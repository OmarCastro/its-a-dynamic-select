/**
 * Memoization technique that calls the callback once, subsequent calls
 * simply returns the result of the first callback
 *
 * @template {() => any} T
 * @param {T} callback - callback to memoize
 * @returns {() => ReturnType<T>} memoized function
 */
export function computeOnce (callback) {
  let result
  return () => result ?? (result = callback())
}
