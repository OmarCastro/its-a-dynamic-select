/**
 * Memoization technique that calls the callback once, subsequent calls
 * simply returns the result of the first callback
 *
 * No arguments are passed to the callback
 *
 * @template {() => unknown} T
 * @param {T} callback - callback to memoize
 * @returns {() => ReturnType<T>} memoized function
 */
export function computeOnce (callback) {
  let call = () => {
    const result = /** @type {ReturnType<T>} */(callback())
    call = () => result
    return result
  }
  return () => call()
}
