const oldFetch = globalThis.fetch
globalThis.fetch = customFetch

const fetchHistory = []

const mockedEntries = []

/**
 * @param  {Parameters<typeof oldFetch>} args
 */
async function customFetch (...args) {
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
    output = mockedEntry?.response ?? await oldFetch(...args)
  } catch (e) {
    output = e
  }
  const historyEntry = {
    inputs, output
  }
  fetchHistory.push(historyEntry)
  if (output instanceof Error) {
    throw output
  }
  return output
}

/**
 *
 * @param {RegExp} regex
 * @param {Response|Error} response
 */
export function mockFetch (regex, response) {
  mockedEntries.push({ regex, response })
}

/**
 *
 */
export function cleanup () {
  fetchHistory.length = 0
  mockedEntries.length = 0
}

export const fetchMockApi = Object.freeze({
  get history () {
    return [...fetchHistory]
  },
  mock: mockFetch
})
