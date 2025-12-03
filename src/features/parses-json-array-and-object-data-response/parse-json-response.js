import { linkHeaderOf } from '../../utils/response.js'
/** @import {ParsedResponse} from '../data-loading/fetch-data' */

/**
 * Checks if response is a valid CSV response
 * It checks by checking content type is CSV
 *
 * @param {Response} response - response from fetch
 * @returns {Promise<ParsedResponse>} parsed response
 */
export async function parseJsonResponse (response) {
  if (!isJsonResponse(response)) {
    throw Error('Not an JSON response')
  }
  const json = await response.json()
  return Array.isArray(json) ? parseJsonArrayResponse(json, response) : parseJsonObjectResponse(json, response)
}

/**
 *
 * @param {any[]} json - json array parsed from `response` body
 * @param {Response} response - response from fetch
 * @returns {ParsedResponse} parsed response
 */
function parseJsonArrayResponse (json, response) {
  const linkHeader = linkHeaderOf(response)
  const hasNextHeader = response.headers.get('X-Has-More')?.toLowerCase() === 'true'
  const data = json
  if (linkHeader.byRel.next) {
    return {
      hasMore: true,
      navigationMode: 'link',
      href: linkHeader.byRel.next[0].url,
      data
    }
  }
  if (hasNextHeader) {
    return {
      hasMore: true,
      navigationMode: 'cursor',
      data
    }
  }

  return {
    hasMore: false,
    data
  }
}

/**
 *
 * @param {object} json - json object parsed from `response` body
 * @param {Response} response - response from fetch
 * @returns {ParsedResponse} parsed response
 */
function parseJsonObjectResponse (json, response) {
  const { links, hasMore, records } = json.links
  const data = records
  const nextLink = links.next || linkHeaderOf(response).byRel.next?.[0]?.url
  const useHasMore = hasMore ?? response.headers.get('X-Has-More')?.toLowerCase() === 'true'

  if (nextLink) {
    return {
      hasMore: true,
      navigationMode: 'link',
      href: nextLink,
      data
    }
  }
  if (useHasMore) {
    return {
      hasMore: true,
      navigationMode: 'cursor',
      data
    }
  }

  return {
    hasMore: false,
    data
  }
}

/**
 * Checks if response is a valid CSV response
 * It checks by checking content type is CSV and the response is a 200 status ok
 *
 * @param {Response} response - response from fetch
 * @returns {boolean} true if is a valid CSV response, false otherwise
 */
export function isJsonResponse (response) {
  return response.ok && response.headers.get('Content-Type') === 'application/json'
}
