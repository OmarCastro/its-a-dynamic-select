import { isPlainObject } from '../../utils/object.js'
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
  /** @type {DataLoader} */
  const api = {
    fetchData: async () => await fetchData(getElement()),
    fetchNextData: async () => await fetchNextData(getElement()),
    fetchHistory: [],
    getLatestSuccessResponse () {
      for (let i = api.fetchHistory.length - 1; i >= 0; i--) {
        const record = api.fetchHistory[i]
        if (record.completed) {
          const result = record.result
          if (!('error' in result)) { return result }
        }
      }
    }

  }
  return api
}

/**
 *
 * @param {HTMLElement} element - target element
 * @param {DataToFetch} dataToFetch - info for data fetch
 */
function dispatchFetchDataEvent (element, dataToFetch) {
  let customResponse = null
  let respondWithCalls = 0
  const event = new CustomEvent('datafetch', {
    cancelable: true,
    composed: true,
    bubbles: true,
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
  const dataToFetch = {
    query: getQueryValue(element),
    url: getUrlToFetch(element)
  }

  return fetchFromDataToFetch(element, dataToFetch)
}

/**
 *
 * @param {HTMLElement} element
 */
async function fetchNextData (element) {
  const loader = dataLoaderOf(element)
  const currentData = loader.getLatestSuccessResponse()
  if (currentData == null) {
    return await fetchData(element)
  }
  if (!currentData.hasMore) {
    // no need to fetch since we have all data
    return currentData
  }

  const dataToFetch = (() => {
    if (currentData.navigationMode === 'link') {
      return {
        query: getQueryValue(element),
        url: currentData.href
      }
    }
    if (currentData.navigationMode === 'cursor') {
      return {
        query: getQueryValue(element),
        url: getUrlToFetch(element)
      }
    }
  })()

  if (!dataToFetch) {
    console.error('error getting next data: unreachable code detected, aborting fetch')
    return currentData
  }

  return fetchFromDataToFetch(element, dataToFetch)
}

/**
 *
 * @param {HTMLElement} element - target element
 * @param {DataToFetch} dataToFetch -
 */
async function fetchFromDataToFetch (element, dataToFetch) {
  const fetchRecord = addToFetchHistory(element, {
    dataToFetch,
    result: { status: 'dispatching event' },
    completed: false
  })

  const { event, customResponse, respondWithCalls } = dispatchFetchDataEvent(element, dataToFetch)
  if (respondWithCalls > 0) {
    fetchRecord.result = await parseRespondWithCall(customResponse)
    fetchRecord.completed = true

    if ('error' in fetchRecord.result) {
      throw Error(fetchRecord.result.error)
    }

    return fetchRecord.result
  }

  const { url } = dataToFetch
  if (!event.defaultPrevented && url) {
    fetchRecord.result = { status: 'fetching data' }
    const response = await fetch(url)
    fetchRecord.result = await parseResponse(response)
    fetchRecord.completed = true

    if ('error' in fetchRecord.result) {
      throw Error(fetchRecord.result.error)
    }
    return fetchRecord.result
  }

  if (!url) {
    fetchRecord.completed = true
    fetchRecord.result = {
      data: [],
      hasMore: false,
    }
    return fetchRecord.result
  }

  fetchRecord.completed = true
  fetchRecord.result = {
    error: 'no data loaded',
    stage: 'loading data'
  }

  throw Error('no data to load')
}

/**
 *
 * @param {*} paramOfRespondWith - param sent to event.detail.respondWith()
 * @returns {Promise<ParsedResponse | ParseError>} parse result
 */
async function parseRespondWithCall (paramOfRespondWith) {
  const result = await Promise.resolve(paramOfRespondWith)
  if (result instanceof Response) {
    const parsedResponse = await parseResponse(paramOfRespondWith)
    if ('error' in parsedResponse) {
      parsedResponse.error = `parse event .respondWith(Response): ${parsedResponse.error}`
    }
    return parsedResponse
  }

  if (Array.isArray(result)) {
    return {
      data: result,
      hasMore: false
    }
  }
  if (isPlainObject(result)) {
    const { hasMore, links, records } = result
    if (!Array.isArray(records)) {
      return {
        error: `records property must be an array, instead it is ${records}`,
        stage: 'parse event .respondWith(Object)'
      }
    }
    if (typeof links?.next === 'string') {
      return {
        data: records,
        hasMore: true,
        navigationMode: 'link',
        href: links.next
      }
    }
    if (hasMore) {
      return {
        data: records,
        hasMore: true,
        navigationMode: 'cursor'
      }
    }
  }
  return {
    error: 'invalid data on RespondsWith, param must be an array, plain object or Response',
    stage: 'parse event .respondWith(...)'
  }
}

/**
 * @param {Response} response - response from fetch
 * @returns {Promise<ParsedResponse | ParseError>} parse result
 */
async function parseResponse (response) {
  if (response.ok) {
    if (isCSVResponse(response)) {
      return await parseCSVResponse(response)
    } else if (isJsonResponse(response)) {
      return await parseJsonResponse(response)
    } else {
      return {
        error: 'invalid response, expected JSON or CSV response, guarantee that Content-type header is set correctly to "text/csv" or "application/json"',
        stage: 'parse fetch response'
      }
    }
  }
  return {
    error: `${response.status} HTTP status code`,
    stage: 'parse fetch response'
  }
}

/**
 * Adds a record to fetch history of an element data loader
 * Each data loader has an history to at most 128 records. Large enough to debug, small enough to not have a big memory footprint
 * @param {HTMLElement} element - target element to get data loader of
 * @param {FetchRecord} record - fetch record to save
 */
function addToFetchHistory (element, record) {
  const { fetchHistory } = dataLoaderOf(element)
  fetchHistory.push(record)
  if (fetchHistory.length > 128) {
    fetchHistory.shift()
  }
  return record
}

/**
 * @param {HTMLElement} element - target element
 */
const getQueryValue = element => element.getAttribute('data-filter') ?? ''

/**
 * @param {HTMLElement} element - target element
 */
const getDataSource = element => element.getAttribute('data-src') ?? ''

/**
 * @param {HTMLElement} element - target element
 */
const getUrlToFetch = element => {
  const src = getDataSource(element)
  if (!src) {
    return src
  }
  const query = getQueryValue(element)
  const srcURL = new URL(src, window.location.href)
  if (query) {
    srcURL.searchParams.set('q', query)
  }
  return srcURL.href
}

/**
 * @typedef {object} DataLoader
 * @property {() => Promise<ParsedResponse>} fetchData - fetches data and saves to current data
 * @property {() => Promise<ParsedResponse>} fetchNextData - used for paginated options, fetches next page
 * @property {FetchRecord[]} fetchHistory - get fetch history, history is no longer than 128 requests
 * @property {()=>ParsedResponse|undefined} getLatestSuccessResponse - current data for select box
 */

/**
 * @typedef {object} ParsedHasMoreResponse
 * @property {true} hasMore - flag to determine if there is more data after the last element
 * @property {{[prop: string]: string}[]} data - options data
 */

/**
 * @typedef {object} ParsedNoMoreResponse
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
 * @typedef {ParsedNoMoreResponse | (ParsedHasMoreResponse & (CursorPaginatedParsedResponse | LinkPaginatedParsedResponse))} ParsedResponse
 */

/**
 * @typedef {object} ParseError
 * @property {string} error - error message
 * @property {string} stage - stage where error happened
 */

/**
 * @typedef {object} FetchingData
 * @property {string} status - error message
 */

/**
 * @typedef {object} FetchRecordLoading
 * @property {DataToFetch} dataToFetch - error message
 * @property {false} completed - completed flag
 * @property {FetchingData} result - stage where error happened
 */

/**
 * @typedef {object} FetchRecordCompleted
 * @property {DataToFetch} dataToFetch - error message
 * @property {true} completed - completed flag
 * @property {ParseError | ParsedResponse} result - stage where error happened
 */

/**
 * @typedef {FetchRecordLoading | FetchRecordCompleted} FetchRecord
 */

/**
 * @typedef {object} DataToFetch
 * @property {string} query - search filter applied to search
 * @property {string} url - request URL endpoint
 */
