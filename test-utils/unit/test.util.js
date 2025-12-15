/* eslint-disable max-lines-per-function */
/* eslint-disable no-empty-pattern */
// @ts-nocheck
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
 * @returns {Promise<Test>} adapted tests
 */
const fn = async () => {
  if (globalThis.Deno != null) {
    // init unit tests for deno

    importStr = 'https://deno.land/x/expect/mod.ts'
    const { expect } = await importModule(importStr)

    importStr = './init-dom'
    const { window } = await importModule(importStr)

    importStr = './fetch-mock'
    const { fetchMockApi, cleanup: cleanupFetchMock } = await importModule(importStr)

    return (description, test) => {
      globalThis.Deno.test(`${description}`, async (t) => {
        await test({
          step: t.step,
          expect,
          dom: window,
          fetch: fetchMockApi
        })
        cleanupFetchMock()
      })
    }
  }

  if (globalThis.window == null) {
    // init unit tests for Playwright

    importStr = '@playwright/test'
    const { test: base, expect } = await import(importStr)

    importStr = './init-dom'
    const { window, resetDom } = await importModule(importStr)

    importStr = './fetch-mock'
    const { fetchMockApi, cleanup: cleanupFetchMock } = await importModule(importStr)

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
        await use(fetchMockApi)
        cleanupFetchMock()
      },
    })

    return test
  } else {
    // init unit tests to be run in browser

    const { expect } = await import('expect')
    const { fetchMockApi, cleanup: cleanupFetchMock } = await import('./fetch-mock')

    return async (description, test) => {
      console.log('-' + description)
      try {
        return test({
          step: async (description, test) => {
            console.log('--' + description)
            await test()
          },
          dom: window,
          expect,
          fetch: fetchMockApi,
        })
      } finally {
        cleanupFetchMock()
      }
    }
  }
}

export const test = await fn()

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
 * @property {typeof import('./fetch-mock').fetchMockApi} fetch - dom fixture
 */

/**
 * @callback TestAPICall
 * @param {string} description
 * @param {() => any} step
 * @returns {Promise<any>}
 */
