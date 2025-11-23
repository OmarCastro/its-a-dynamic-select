/**
 *
 * @param {unknown} obj - target object
 * @returns {obj is Record<string,any>} true if `obj` is a plain object, false otherwise
 */
export const isPlainObject = obj => !!obj && [null, Object.prototype].includes(Object.getPrototypeOf(obj))
