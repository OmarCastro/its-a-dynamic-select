/**
 * Parses CSV from a string or iterables of strings.
 * @overload
 * @param {string | Iterable<string>} input - CSV source.
 * @param {string} [delimiter] - CSV delimiter.
 * @returns {Generator<*>} generator that yields a parsed CSV row
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
 * @returns {AsyncGenerator<*>} generator that yields a parsed CSV row
 */
export function parseJsonLines (input) {
  if (typeof input === 'string') {
    return parseJsonLinesSync([input])
  } else if (isAsyncIterable(input)) {
    return parseJsonLinesAsync(input)
  } else if (isIterable(input)) {
    return parseJsonLinesSync(input)
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
 * @yields {object | null | any[] | number | string} parsed CSV row
 */
function * parseJsonLinesSync (iterable, delimiter = ',') {
  let buffer = ''

  for (const chunk of iterable) {
    buffer += chunk.toString()

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''// keep last partial line

    for (const line of lines) {
      if (!line.trim()) continue
      yield JSON.parse(line)
    }
  }

  if (buffer.trim()) {
    yield JSON.parse(buffer)
  }
}

/**
 * Parses JSON lines from an async iterable of string chunks.
 *
 * @param {AsyncIterable<string>} asyncIterable - Async iterable of chunks.
 * @yields {object | null | any[] | number | string} parsed JSON line
 */
async function * parseJsonLinesAsync (asyncIterable) {
  let buffer = ''

  for await (const chunk of asyncIterable) {
    buffer += chunk.toString()

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''// keep last partial line

    for (const line of lines) {
      if (!line.trim()) continue
      yield JSON.parse(line)
    }
  }

  if (buffer.trim()) {
    yield JSON.parse(buffer)
  }
}
