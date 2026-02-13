/* eslint-disable max-lines-per-function */
/* eslint-disable no-empty-pattern */
// @ts-nocheck
/** @import {Expect} from 'expect' */
/**
 * this file adapts the test to their own environment
 *
 * on Deno uses Deno API
 * on Node it uses playwright
 * on browser it uses a custom api
 */

// thee 2 lines are to prevent esbuild to bundle the await imports
/**
 * @param {string} str - import path
 * @returns {Promise<any>} import result
 */
const importModule = (str) => import(str)
let importStr

/**
 * @returns {Promise<{test: Test, expect: Expect}>} adapted tests
 */
const fn = async () => {
  const customTestSetup = globalThis[Symbol.for('custom-unit-test-setup')]
  if (customTestSetup) {
    const { test, expect } = await customTestSetup()
    return { test, expect }
  } else if (globalThis.Deno != null) {
    // init unit tests for deno

    importStr = 'jsr:@std/expect'
    const { expect } = await importModule(importStr)

    importStr = './init-dom.js'
    const { window } = await importModule(importStr)

    importStr = './fetch-mock.js'
    const { setup: setupFetchMock, teardown: teardownFetchMock } = await importModule(importStr)

    const test = (description, test) => {
      globalThis.Deno.test(`${description}`, async (t) => {
        try {
          await test({
            step: t.step,
            expect,
            dom: window,
            get fetch () {
              return setupFetchMock()
            }
          })
        } finally {
          teardownFetchMock()
        }
      })
    }

    return { test, expect }
  }

  if (globalThis.window == null) {
    // init unit tests for Playwright

    importStr = '@playwright/test'
    const { test: base, expect } = await import(importStr)

    importStr = './init-dom.js'
    const { window, resetDom } = await importModule(importStr)

    importStr = './fetch-mock.js'
    const { setup: setupFetchMock, teardown: teardownFetchMock } = await importModule(importStr)

    /** @type {any} */
    const test = base.extend({
      step: async ({}, use) => {
        await use(test.step)
      },
      dom: async ({}, use) => {
        resetDom()
        await use(window)
      },
      expect: async ({}, use) => {
        await use(expect)
      },
      fetch: async ({}, use) => {
        const api = setupFetchMock()
        await use(api)
        teardownFetchMock()
      },
    })

    return { test, expect }
  } else {
    // init unit tests to be run in browser

    const { expect } = await import('expect')
    const { setup: setupFetchMock, teardown: teardownFetchMock } = await importModule('./fetch-mock.js')

    const test = async (description, test) => {
      console.log('-' + description)
      try {
        return test({
          step: async (description, test) => {
            console.log('--' + description)
            await test()
          },
          dom: window,
          expect,
          get fetch () {
            return setupFetchMock()
          }
        })
      } finally {
        teardownFetchMock()
      }
    }

    return { test, expect }
  }
}

export const { test, expect } = await fn()
const inspect = (await import('object-inspect')).default

export const formatted = (strings, ...values) => String.raw(
  { raw: strings },
  ...values.map(value => inspect(value))
)
/**
 * @callback Test
 * @param {string} description
 * @param {TestCall} test
 */

/**
 * @callback TestCall
 * @param {TestAPI} callback
 */

/**
 * @typedef {object} TestAPI
 * @property {typeof import('expect').expect} expect - expect API
 * @property {TestAPICall} step - test step
 * @property {Window} dom - dom fixture
 * @property {import('./fetch-mock.js').MockApi} fetch - dom fixture
 */

/**
 * @callback TestAPICall
 * @param {string} description
 * @param {() => any} step
 * @returns {Promise<any>}
 */
