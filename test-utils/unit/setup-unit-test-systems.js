const importExpect = import('expect')
const importInitDom = import('./init-dom.js')
const importFetchMock = import('./fetch-mock.js')
const unitTests = []

const test = (description, test) => {
  unitTests.push({
    description,
    test: async () => {
      const { expect } = await importExpect
      const { window } = await importInitDom
      const { setup: setupFetchMock, teardown: teardownFetchMock } = await importFetchMock
      await test({
        step: async (_, callback) => await callback(),
        expect,
        dom: window,
        get fetch () {
          return setupFetchMock()
        }
      })
      teardownFetchMock()
    }
  })
}

let expectFn = () => { throw Error('invalid Expect') }
importExpect.then(module => { expectFn = module.expect })
globalThis['custom-unit-test-runner'] = { test, expect: (...args) => expectFn(...args) }

setTimeout(async () => {
  const testAmount = unitTests.length
  let failedTestAmount = 0

  console.log(`[unit-test] ${testAmount} tests to run`)
  let result = '[unit-test] results: \n'

  for (const { description, test } of unitTests) {
    try {
      await test()
      result += `  [PASS] ${description}\n`
    } catch (e) {
      console.log(e)
      failedTestAmount++
      result += `**[FAIL] ${description}\n`
    }
  }

  console.log(result)

  if (failedTestAmount <= 0) {
    console.log('[unit-test] All tests passed')
  } else {
    console.log(`[unit-test] ${failedTestAmount} tests failed`)
  }
}, 0)
