/** Used to match property names within property paths. */
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g

/** Used to memoize `stringToPath()` results. */
const stringToPathCache = {}

/**
 * Converts `string` to a property path array.
 *
 * @param {string} string The string to convert.
 * @returns {readonly string[]} Returns the property path array.
 */
export function stringToPath (string) {
  const cachedResult = stringToPathCache[string]
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
  stringToPathCache[string] = finalResult
  return finalResult
}

/**
 * Get object data from a string path
 *
 * @param {*} obj - target object
 * @param {string} stringPath - string path
 * @returns {*} result from string path
 */
export function getFromStringPath (obj, stringPath) {
  if (obj == null) { return obj }
  const pathArray = stringToPath(stringPath)
  let current = obj
  for (const section of pathArray) {
    current = obj[section]
    if (current == null) { return current }
  }
  return current
}
