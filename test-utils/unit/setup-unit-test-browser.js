/** @import { Expect } from 'expect' */
// eslint-disable-next-line max-lines-per-function
globalThis[Symbol.for('custom-unit-test-setup')] = async function setupUnitTestsForSystems () {
  const { expect } = await import('./simple-expect.js')
  const { setup: setupFetchMock, teardown: teardownFetchMock } = await import('./fetch-mock.js')

  async function runTests () {
    const testAmount = unitTests.length
    let failedTestAmount = 0

    let logs = ''
    const log = (text) => {
      console.log(text)
      logs += String(text) + '\n'
    }
    console.log(`[unit-test] ${testAmount} tests to run`)
    let result = '[unit-test] results: \n'

    for (const { description, test } of unitTests) {
      try {
        await test()
        result += `  [PASS] ${description}\n`
      } catch (e) {
        log(e)
        failedTestAmount++
        result += `**[FAIL] ${description}\n`
      }
    }

    log(result)

    if (failedTestAmount <= 0) {
      log('[unit-test] All tests passed')
    } else {
      log(`[unit-test] ${failedTestAmount} tests failed`)
    }
    reportLogs(logs)
  }

  function scheduleUnitTestRun () {
    if (!scheduleUnitTestRun.alreadyScheduled) {
      setTimeout(runTests, 0)
      scheduleUnitTestRun.alreadyScheduled = true
    }
  }

  const notTestsFoundTimeout = setTimeout(() => {
    reportLogs('No tests found')
  }, 250)

  const unitTests = []
  const noopGC = async () => {}
  noopGC.status = {
    enabled: false,
    reason: 'Garbage collection not enabled'
  }
  const test = (description, test) => {
    unitTests.push({
      description,
      test: async () => {
        await test({
          step: async (_, callback) => await callback(),
          expect,
          dom: window,
          get fetch () {
            return setupFetchMock()
          },
          gc: noopGC
        })
        teardownFetchMock()
      }
    })
    clearTimeout(notTestsFoundTimeout)
    scheduleUnitTestRun()
  }

  test.skip = (invariant, Message) => {

  }

  return { test, expect }
}

/**
 * @param {string} logs - test logs
 */
function reportLogs (logs) {
  window.document.body.replaceChildren(...logs.split('\n').map(log => {
    const div = document.createElement('div')
    div.textContent = log
    return div
  }))
}
