import { parseCSVResponse, isCSVResponse } from '../parses-csv-data-response/parse-csv-response.js'
import { parseJsonResponse, isJsonResponse } from '../parses-json-array-and-object-data-response/parse-json-response.js'

/** @type {WeakMap<HTMLElement, DataLoader>} */
const dataLoaderData = new WeakMap()

/**
 * @param {HTMLElement} element - target element
 * @returns {DataLoader} dataloader of element
 */
export function dataLoaderOf (element) {
  let dataLoader = dataLoaderData.get(element)
  if (!dataLoader) {
    dataLoader = createDataLoaderFor(new WeakRef(element))
    dataLoaderData.set(element, dataLoader)
  }
  return dataLoader
}

/**
 * Creates a dataloader for an element
 * @param {WeakRef<HTMLElement>} elementRef - weak reference of element. We do not want to have any strong reference chain pointing to
 * globally allocated `dataLoaderData`, effectively creating a memory leak
 * @returns {DataLoader} - created dataloader for element
 */
function createDataLoaderFor (elementRef) {
  const getElement = () => {
    const element = elementRef.deref()
    if (!element) { throw new Error('element no longer exists') }
    return element
  }
  return {
    fetchData: async () => await fetchData(getElement()),
    fetchNextData: async () => await fetchNextData(getElement()),
    fetchHistory: [],
    currentData: null
  }
}

/**
 *
 * @param {HTMLElement} element - target element
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
 * @param {HTMLElement} element - target element to load data to
 */
async function fetchData (element) {
  const loader = dataLoaderOf(element)

  const url = getUrlToFetch(element)
  const dataToFetch = {
    query: getQueryValue(element),
    url
  }

  const { event, customResponse, respondWithCalls } = dispatchFetchDataEvent(element, dataToFetch)
  if (respondWithCalls > 0) {
    const response = await customResponse
    loader.currentData = response
    return loader.currentData
  }

  if (!event.defaultPrevented && url) {
    const response = await fetch(url)
    await parseResponse(element, response, dataToFetch)
  }

  return loader.currentData
}

/**
 *
 * @param {HTMLElement} element
 */
async function fetchNextData (element) {
  const loader = dataLoaderOf(element)
  const { currentData } = loader

  const url = getUrlToFetch(element)

  const dataToFetch = (() => {
    const base = {
      query: getQueryValue(element),
      url
    }
    if (currentData == null || !currentData.hasMore) {
      return base
    }
    if (currentData.navigationMode === 'link') {
      return {
        ...base,
        url: currentData.href
      }
    }
    if (currentData.navigationMode === 'cursor') {
      return {
        ...base,
      }
    }
    return base
  })()

  const { event, customResponse, respondWithCalls } = dispatchFetchDataEvent(element, dataToFetch)
  if (respondWithCalls > 0) {
    const response = await customResponse
    loader.currentData = response
    return loader.currentData
  }

  const src = element.getAttribute('data-src')
  if (!event.defaultPrevented && src) {
    const response = await fetch(src)
    await parseResponse(element, response, dataToFetch)
  }

  return loader.currentData
}

/**
 *
 * @param element
 * @param response
 * @param dataToFetch
 */
async function parseResponse (element, response, dataToFetch) {
  const loader = dataLoaderOf(element)

  if (isValidResponse(response)) {
    if (isCSVResponse(response)) {
      loader.currentData = await parseCSVResponse(response)
    } else if (isJsonResponse(response)) {
      loader.currentData = await parseJsonResponse(response)
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
 * @param {HTMLElement} element
 */
const getQueryValue = element => element.getAttribute('data-filter') ?? ''

/**
 *
 * @param {HTMLElement} element
 */
const getDataSource = element => element.getAttribute('data-src') ?? ''

/**
 *
 * @param {HTMLElement} element
 */
const getUrlToFetch = element => {
  const src = getDataSource(element)
  if (!src) {
    return src
  }
  const query = getQueryValue(element)
  const srcURL = new URL(src, window.location.href)
  if (query) {
    srcURL.searchParams.append('q', query)
  }
  return srcURL.href
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
 * @typedef {object} DataLoader
 * @property {() => Promise<ParsedResponse|null>} fetchData - fetches data and saves to current data
 * @property {() => Promise<ParsedResponse|null>} fetchNextData - used for paginated options, fetches next page
 * @property {*[]} fetchHistory - get fetch history, history is no longer than 128 requests
 * @property {ParsedResponse|null} currentData - current data for select box
 */

/**
 * @typedef {object} ParsedResponseBase
 * @property {true} hasMore - flag to determine if there is more data after the last element
 * @property {{[prop: string]: string}[]} data - options data
 */

/**
 * @typedef {object} NoMoreResponse
 * @property {false} hasMore - flag to determine if there is more data after the last element
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
 * @typedef {NoMoreResponse | (ParsedResponseBase & (CursorPaginatedParsedResponse | LinkPaginatedParsedResponse))} ParsedResponse
 */
