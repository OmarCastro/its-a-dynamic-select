import { parseCSVResponse, isCSVResponse } from '../parses-csv-data-response/parse-csv-response.js'
import { parseJsonResponse, isJsonResponse } from '../parses-json-array-and-object-data-response/parse-json-response.js'
const dataLoaderData = new WeakMap()

/**
 *
 * @param {HTMLElement} element
 */
export function dataLoaderOf (element) {
  if (dataLoaderData.has(element)) {
    return dataLoaderData.get(element)
  }

  const newDataLoader = {
    fetchData: () => fetchData(element),

    fetchHistory: [],
    currentData: null
  }

  dataLoaderData.set(element, newDataLoader)
  return newDataLoader
}

/**
 *
 * @param {HTMLElement} element
 * @param dataToFetch
 */
function dispatchFetchDataEvent (element, dataToFetch) {
  let customResponse = null
  let respondWithCalls = 0
  const event = new CustomEvent('fetch data', {
    cancelable: true,
    composed: true,
    detail: {
      dataToFetch,
      respondWith (data) {
        customResponse = data
        respondWithCalls++
      }
    }
  })

  element.dispatchEvent(event)

  return { event, customResponse, respondWithCalls }
}

/**
 *
 * @param {HTMLElement} element
 */
async function fetchData (element) {
  const loader = dataLoaderOf(element)
  const { currentData } = loader
  const { lastValue, navigationMode, link } = currentData ?? {}

  const dataToFetch = {
    query: '',
    lastValue: lastValue ?? null,
    navigationMode,
    ...(navigationMode === 'link' ? { link } : {})

  }

  const { event, customResponse, respondWithCalls } = dispatchFetchDataEvent(element, dataToFetch)
  if (respondWithCalls > 0) {
    const response = await customResponse
    loader.currentData = {
      optionsData: response
    }
    return
  }

  const src = element.getAttribute('data-src')
  if (!event.defaultPrevented && src) {
    const response = await fetch(src)
    if (isValidResponse(response)) {
      if (isCSVResponse(response)) {
        loader.currentData = parseCSVResponse(response)
      } else if (isJsonResponse(response)) {
        loader.currentData = parseJsonResponse(response)
      } else {
        addToFetchHistory(element, dataToFetch, {
          ok: false,
          status: response.status,
          error: 'invalid response'
        })
      }
    } else {
      addToFetchHistory(element, dataToFetch, {
        ok: false,
        status: response.status,
        error: `${response.status} HTTP status code`
      })
    }
  }

  return loader.currentData
}

/**
 *
 * @param {HTMLElement} element
 * @param dataToFetch
 * @param result
 */
function addToFetchHistory (element, dataToFetch, result) {
  const { fetchHistory } = dataLoaderOf(element)
  fetchHistory.push({ dataToFetch, result })
  if (fetchHistory.length > 128) {
    fetchHistory.shift()
  }
}

/**
 *
 * @param {Response} response
 * @returns
 */
function isValidResponse (response) {
  return response.ok
}

/**
 * @typedef {object} ParsedResponseBase
 * @property {boolean} hasMore - flag to determine if there is more data after the last element
 * @property {{[prop: string]: string}[]} data - options data
 */

/**
 * @typedef {object} LinkPaginatedParsedResponse
 * @property {"link"} navigationMode - navigation mode
 * @property {string} href - link url
 */

/**
 * @typedef {object} CursorPaginatedParsedResponse
 * @property {"cursor"} navigationMode - navigation mode
 */

/**
 * @typedef {ParsedResponseBase | (ParsedResponseBase & (CursorPaginatedParsedResponse | LinkPaginatedParsedResponse))} ParsedResponse
 */
