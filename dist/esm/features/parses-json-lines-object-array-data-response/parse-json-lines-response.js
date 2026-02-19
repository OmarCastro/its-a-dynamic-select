import { parseJsonLines } from '../../utils/json-lines-parser.js'
import { isPlainObject } from '../../utils/object.js'
import { linkHeaderOf, toTextStream, parseHasMoreHeader } from '../../utils/response.js'
/** @import {ParsedResponse} from '../data-loading/fetch-data' */
/**
 * Checks if response is a valid CSV response
 * It checks by checking content type is CSV
 *
 * @param {Response} response - response from fetch
 * @returns {Promise<ParsedResponse>} parsed response
 */
export async function parseJsonLinesResponse (response) {
  if (!isJsonLinesResponse(response)) {
    throw Error('Not an CSV response')
  }

  const linkHeader = linkHeaderOf(response)
  const hasNextHeader = parseHasMoreHeader(response)
  const data = (await Array.fromAsync(parseJsonLines(toTextStream(response)))).filter(isPlainObject)

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
      navigationMode: 'after_value',
      data
    }
  }

  return {
    hasMore: false,
    data
  }
}

/**
 * Checks if response is a valid JSON Lines response
 * It checks by checking content type is JSON Lines and the response is a 200 status ok
 *
 * @param {Response} response - response from fetch
 * @returns {boolean} true if is a valid JSON Lines response, false otherwise
 */
export function isJsonLinesResponse (response) {
  return response.ok && response.headers.get('Content-Type') === 'application/jsonl'
}
