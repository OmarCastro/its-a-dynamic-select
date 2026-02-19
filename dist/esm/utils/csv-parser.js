/**
 * Parses CSV from a string or iterables of strings.
 * @overload
 * @param {string | Iterable<string>} input - CSV source.
 * @param {string} [delimiter] - CSV delimiter.
 * @returns {Generator<{[field: string]: string}>} generator that yields a parsed CSV row
 * @example
 * for (const row of parseCSV("name,age\nJohn,30\nJane,25")) {
 *   console.log(row);
 * }
 *
 * @example
 * const chunkArray = ['name,age\n', 'John,30'];
 * for (const row of parseCSV(chunkArray)) {
 *   console.log(row);
 * }
 */
/**
 * Parses CSV from async string iterables.
 *
 * @example
 * async function* chunks() {
 *   yield 'name,age\nJo';
 *   yield 'hn,30\n';
 * }
 * for await (const row of parseCSV(chunks())) {
 *   console.log(row);
 * }
 * @overload
 * @param {AsyncIterable<string>} input - CSV source.
 * @param {string} [delimiter] - CSV delimiter.
 * @returns {AsyncGenerator<{[field: string]: string}>} generator that yields a parsed CSV row
 */
export function parseCSV (input, delimiter = ',') {
  if (typeof input === 'string') {
    return parseCSVSync([input], delimiter)
  } else if (isAsyncIterable(input)) {
    return parseCSVAsync(input, delimiter)
  } else if (isIterable(input)) {
    return parseCSVSync(input, delimiter)
  } else {
    throw new TypeError('Input must be a string, Iterable, or AsyncIterable')
  }
}

/**
 * @param {unknown} object - target object
 * @returns {object is Iterable} - true if iterable, false otherwise
 */
const isIterable = object => typeof object?.[Symbol.iterator] === 'function'

/**
 * @param {unknown} object - target object
 * @returns {object is AsyncIterable} - true if iterable, false otherwise
 */
const isAsyncIterable = object => typeof object?.[Symbol.asyncIterator] === 'function'

/**
 * Parses CSV from a synchronous iterable of strings.
 *
 * @param {Iterable<string>} iterable - Iterable of string chunks.
 * @param {string} [delimiter] - CSV delimiter.
 * @yields {{[field: string]: string}} parsed CSV row
 */
function * parseCSVSync (iterable, delimiter = ',') {
  let buffer = ''
  let headers = null

  for (const chunk of iterable) {
    buffer += chunk.toString()

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''// keep last partial line

    for (const line of lines) {
      if (!line.trim()) continue

      const fields = parseCSVLine(line, delimiter)

      if (!headers) {
        headers = fields
      } else {
        yield Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? '']))
      }
    }
  }

  if (buffer.trim() && headers) {
    const fields = parseCSVLine(buffer, delimiter)
    yield Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? '']))
  }
}

/**
 * Parses CSV from an async iterable of string chunks.
 *
 * @param {AsyncIterable<string>} asyncIterable - Async iterable of chunks.
 * @param {string} [delimiter] - CSV delimiter.
 * @yields {{[field: string]: string}} parsed CSV row
 */
async function * parseCSVAsync (asyncIterable, delimiter = ',') {
  let buffer = ''
  let headers = null

  for await (const chunk of asyncIterable) {
    buffer += chunk.toString()

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''// keep last partial line

    for (const line of lines) {
      if (!line.trim()) continue

      const fields = parseCSVLine(line, delimiter)

      if (!headers) {
        headers = fields
      } else {
        yield Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? '']))
      }
    }
  }

  if (buffer.trim() && headers) {
    const fields = parseCSVLine(buffer, delimiter)
    yield Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? '']))
  }
}

/**
 * Parses a single CSV line into an array of fields.
 * Handles quoted fields and escaped quotes.
 *
 * @param {string} line - A single line of CSV text.
 * @param {string} [delimiter] - The delimiter character (default is comma).
 * @returns {string[]} - Array of parsed fields.
 */
function parseCSVLine (line, delimiter = ',') {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      i++ // skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
