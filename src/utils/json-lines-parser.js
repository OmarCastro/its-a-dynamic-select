/**
 * Parses JSONL from a string or iterables of strings.
 * @overload
 * @param {string | Iterable<string>} input - JSONL source.
 * @returns {Generator<*>} generator that yields a parsed json line
 * @example
 * for (const row of parseCSV('{"name": "John","age": 30}\n{"name": "Jane","age": 25}')) {
 *   console.log(row);
 * }
 *
 * @example
 * const chunkArray = ['{"name": "John","age": 30}\n', '{"name": "Jane","age": 25}'];
 * for (const row of parseCSV(chunkArray)) {
 *   console.log(row);
 * }
 */
/**
 * Parses JSONL from async string iterables.
 *
 * @example
 * async function* chunks() {
 *   yield '{"name": "John","age": 30}\n{"na';
 *   yield 'me": "Jane","age": 25}\n';
 * }
 * for await (const row of parseCSV(chunks())) {
 *   console.log(row);
 * }
 * @overload
 * @param {AsyncIterable<string>} input - JSONL source.
 * @returns {AsyncGenerator<*>} generator that yields a parsed json line
 */
/**
 * @param {string | Iterable<string> | AsyncIterable<string>} input - JSONL source.
 * @returns {Generator<*> | AsyncGenerator<*>} generator that yields a parsed json line
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
 * @param {*} object - target object
 * @returns {object is Iterable<*>} - true if iterable, false otherwise
 */
const isIterable = (object) => typeof object?.[Symbol.iterator] === 'function'

/**
 * @param {*} object - target object
 * @returns {object is AsyncIterable<*>} - true if iterable, false otherwise
 */
const isAsyncIterable = (object) => typeof object?.[Symbol.asyncIterator] === 'function'

/**
 * Parses CSV from a synchronous iterable of strings.
 *
 * @param {Iterable<string>} iterable - Iterable of string chunks.
 * @yields {object | null | any[] | number | string} parsed CSV row
 */
function * parseJsonLinesSync (iterable) {
  let buffer = ''

  for (const chunk of iterable) {
    buffer += chunk.toString()

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''// keep last partial line

    for (const line of lines) {
      if (!line.trim()) { continue }
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
      if (!line.trim()) { continue }
      yield JSON.parse(line)
    }
  }

  if (buffer.trim()) {
    yield JSON.parse(buffer)
  }
}
