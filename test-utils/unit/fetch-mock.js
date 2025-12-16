const oldFetch = globalThis.fetch

/**
 * @param {Parameters<typeof oldFetch>} args - fetch() arguments
 * @this  {{fetchHistory: FetchHistoryEntry[], mockedEntries: any[]}}
 */
async function customFetch (...args) {
  const { fetchHistory, mockedEntries } = this
  const inputs = args
  let output = null
  try {
    const inputToSearch = (() => {
      const input = inputs[0]
      if (typeof input === 'string') return input
      if (input instanceof URL) return input.toString()
      if (input instanceof Request) return input.url.toString()
    })()
    const mockedEntry = mockedEntries.findLast(({ regex }) => regex.test(inputToSearch))
    const response = mockedEntry?.response
    if (!response) {
      throw Error(`no fetch mock found for url ${inputToSearch}`)
    }
    output = response
  } catch (e) {
    output = e
  }
  const isError = output instanceof Error
  const historyEntry = {
    inputs, output, isError
  }
  fetchHistory.push(historyEntry)
  if (isError) {
    throw output
  }
  return output
}

/**
 * @param {RegExp} regex - regex to test url
 * @param {Response|Error} response - fetch response, can be an error to simulate a fetch error (e.g. DNS error)
 */
export function mockFetch (regex, response) {
  this.push({ regex, response })
}

/**
 * Setup fetch mock fixture
 * @returns {MockApi} mock api
 */
export function setup () {
  /** @type {FetchHistoryEntry[]} */
  const fetchHistory = []
  const mockedEntries = []
  /** @type {MockApi} */
  const mockApi = Object.freeze({
    fetchHistory,
    mock (regex, response) {
      mockedEntries.push({ regex, response })
    }
  })
  globalThis.fetch = customFetch.bind({ fetchHistory, mockedEntries })
  return mockApi
}

/**
 * teardown fetch mock fixture
 */
export function teardown () {
  globalThis.fetch = oldFetch
}

/**
 * @typedef {object} FetchHistoryEntry
 * @property {Parameters<typeof globalThis.fetch>} input - fetch() arguments
 * @property {any} output - awaited fetch result
 * @property {boolean} isError - determines if result is an error
 */

/**
 * @typedef {object} MockApi
 * @property {FetchHistoryEntry[]} fetchHistory - fetch history for this mock
 * @property {MockFetch} mock - mock an entry
 */

/**
 * @callback MockFetch
 * @param {RegExp} regex - regex to test url
 * @param {Response|Error} response - fetch response, can be an error to simulate a fetch error (e.g. DNS error)
 */
