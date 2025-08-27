/**
 *
 * @param {*} obj - target object
 * @returns {obj is Record<string,any>} true if `obj` is a plain object, false otherwise
 */
export const isPlainObject = obj => (obj?.constructor === Object || Object.getPrototypeOf(obj ?? 0) === null)
