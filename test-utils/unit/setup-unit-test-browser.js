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
    reportLogs({ logs, failed: failedTestAmount, total: testAmount, passed: testAmount - failedTestAmount })
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
  const noopGC = async () => { }
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
 * @param {object} report - test report
 * @param {string} report.logs - test logs
 * @param {number} report.failed - amount of failed tests
 * @param {number} report.passed - amount of passed tests
 * @param {number} report.total - total amount tests
 */
function reportLogs (report) {
  const inIframe = window.self !== window.top
  const { body } = window.document
  const { reportType } = globalThis[Symbol.for('unit-test-info')]
  if (inIframe) {
    window.top.postMessage({ message: 'unit test report', data: report })
  }
  if (reportType === 'badge') {
    createSVGResponse(report).then(svg => {
      body.innerHTML = svg
      body.classList.add('done')
    })
  } else {
    body.replaceChildren(...report.logs.split('\n').map(log => {
      const div = document.createElement('div')
      div.textContent = log
      return div
    }))
    body.classList.add('done')
  }
}

const badgeColors = {
  green: { dark: '#060', light: '#90e59a' },
  red: { dark: '#a00', light: '#f77' },
}

let badgeFetch = null

const createSVGResponse = async (report) => {
  const label = `${report.passed} / ${report.total}`
  const color = report.failed > 0 ? badgeColors.red : badgeColors.green
  const { badgeUrl } = globalThis[Symbol.for('unit-test-info')]
  badgeFetch ??= fetch(badgeUrl).then(response => response.text())
  const badgeSvg = await badgeFetch
  return badgeSvg
    .replaceAll('RUNNING...', label)
    .replaceAll('--dark-fill: #05a; --light-fill: #acf;', `--dark-fill: ${color.dark}; --light-fill: ${color.light};`)
}
