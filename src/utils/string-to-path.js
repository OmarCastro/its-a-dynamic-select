/** Used to match property names within property paths. */
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g

/** Used to memoize the results. */
const cache = {}

/**
 * Converts `string` to a property path array.
 *
 * @param {string} string The string to convert.
 * @returns {readonly string[]} Returns the property path array.
 */
export function stringToPath (string) {
  const cachedResult = cache[string]
  if (cachedResult) { return cachedResult }

  const result = []
  if (string.at(0) === '.') {
    result.push('')
  }
  string.replace(rePropName, function (match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match))
    return ''
  })

  const finalResult = Object.freeze(result)
  cache[string] = finalResult
  return finalResult
}
