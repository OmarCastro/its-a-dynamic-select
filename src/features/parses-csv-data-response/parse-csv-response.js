import { parseCSV } from '../../utils/csv-parser.js'
import { linkHeaderOf, toTextStream, parseHasMoreHeader } from '../../utils/response.js'
/** @import {ParsedResponse} from '../data-loading/fetch-data' */
/**
 * Checks if response is a valid CSV response
 * It checks by checking content type is CSV
 *
 * @param {Response} response - response from fetch
 * @returns {Promise<ParsedResponse>} parsed response
 */
export async function parseCSVResponse (response) {
  if (!isCSVResponse(response)) {
    throw Error('Not an CSV response')
  }

  const linkHeader = linkHeaderOf(response)
  const hasNextHeader = parseHasMoreHeader(response)
  const data = await Array.fromAsync(parseCSV(toTextStream(response)))
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
 * Checks if response is a valid CSV response
 * It checks by checking content type is CSV and the response is a 200 status ok
 *
 * @param {Response} response - response from fetch
 * @returns {boolean} true if is a valid CSV response, false otherwise
 */
export function isCSVResponse (response) {
  return response.ok && response.headers.get('Content-Type') === 'text/csv'
}
