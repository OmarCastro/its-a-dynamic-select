/**
 * Generator function to stream text from response.
 *
 * @param {Response} response - response from fetch
 * @yields {string} text from the response stream.
 */
export async function * toTextStream (response) {
  const { body } = response
  if (!body) {
    return
  }
  const reader = body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    // wait for next encoded chunk
    const { done, value } = await reader.read()
    // check if stream is done
    if (done) break
    // Decodes data chunk and yields it
    yield (decoder.decode(value))
  }
}

/**
 * Gets parsed LinkHeader. Returns empty LinkHeader if invalid or absent
 * @param {Response|string} responseOrHeader - response from fetch
 * @returns {LinkHeader} parser Link header
 */
export function linkHeaderOf (responseOrHeader) {
  if (responseOrHeader instanceof Response) {
    const header = responseOrHeader.headers.get('Link')
    return parseLinkHttpHeader(header)
  }
  if (typeof responseOrHeader === 'string') {
    return parseLinkHttpHeader(responseOrHeader)
  }
  return parseLinkHttpHeader(null)
}

/**
 * Parses "X-Has-More" as well as "Has-More" header from response to
 * detect if there is more data to fetch
 * Note: "Has-More" has higher priority than "X-Has-More"
 * @param {Response} response - response from fetch
 * @returns {boolean} parsed "Has more" response header
 */
export function parseHasMoreHeader (response) {
  if (!(response instanceof Response)) {
    return false
  }
  for (const headerName of ['Has-More', 'X-Has-More']) {
    const header = response.headers.get(headerName)
    if (header) {
      return header.toLowerCase() === 'true'
    }
  }
  return false
}

/**
 * Parses Link HTTP header used for pagination only
 * @param {string?} header - response from fetch
 * @returns {LinkHeader} parser Link header
 */
function parseLinkHttpHeader (header) {
  if (!header || header.length <= 0) {
    return { entries: [], byRel: {} }
  }

  const entries = Iterator.from(splitLinkEntries(header))
    .map(parseLinkHeaderEntry)
    .filter(result => result != null)
    .toArray()

  const byRel = ({})
  for (const entry of entries) {
    const { params: { rel } } = entry
    if (!rel) { continue }
    for (const relEntry of rel.split(' ').filter(Boolean)) {
      byRel[relEntry] ??= []
      byRel[relEntry].push(entry)
    }
  }

  return { entries, byRel }
}

/**
 * @param {string} header - header object
 */
function splitLinkEntries (header) {
  const entries = []
  let subEntry = []

  let current = ''
  let inQuotes = false
  let inAngleBrackets = false
  let firstAngleBrackets = true

  for (let i = 0, e = header.length; i < e; i++) {
    const char = header[i]
    if ((inAngleBrackets && char !== '>') || (inQuotes && char !== '"')) {
      current += char
      continue
    }
    if (char === '<' && firstAngleBrackets) {
      inAngleBrackets = true
      firstAngleBrackets = false
    }

    if (char === '>') {
      inAngleBrackets = false
    }

    if (char === '"') {
      inQuotes = !inQuotes
    }

    if (char === ';') {
      subEntry.push(current)
      current = ''
      continue
    }

    if (char === ',') {
      subEntry.push(current)
      entries.push(subEntry)
      current = ''
      subEntry = []
      firstAngleBrackets = true
    } else {
      current += char
    }
  }

  if (current) {
    subEntry.push(current)
    entries.push(subEntry)
  }
  return entries
}

/**
 * @param {string[]} headerEntry - `Link` header entry
 * @returns {LinkHeaderEntry|null} parser header entry, or null if invalid
 */
function parseLinkHeaderEntry (headerEntry) {
  const [uri, ...params] = headerEntry
  const match = uri.match(/<([^>]+)>/)
  if (!match) return null

  const url = match[1]

  const parsedParams = Object.fromEntries(
    Iterator.from(params)
      .map(p => p.trim())
      .filter(Boolean)
      .map(param => param.match(/^([^=]+)="?([^"]+)"?$/))
      .filter(match => match != null)
      .map(match => {
        const [,key, value] = match
        return [key, value]
      })
      .toArray()
  )
  return { url, params: parsedParams }
}

/**
 * @typedef {object} LinkHeader
 *
 * @property {LinkHeaderEntry[]} entries - link entries
 * @property {{[rel: string]: LinkHeaderEntry[]}} byRel - link entries grouped by rel
 */

/**
 * @typedef {object} LinkHeaderEntry
 *
 * @property {string} url - link entry URI
 * @property {{[key: string]: string}} params - link entry parameters
 */
