/**
 * @typedef {object} Configuration
 *
 * Configurations of Dynamic Select boxes
 *
 * @property {number} minQueryLength - minimum number of characters in the filter
 *  text input on dropdown to filter data in the option list, defaults to 3
 * @property {number} debounceQueryDuration - number of milliseconds for the
 *   text input to wait for updates before filtering the data
 */

export const defaultValues = Object.freeze({
  minQueryLength: 3,
  debounceQueryDuration: 250,
})

/**
 * @param {HTMLElement} element - target element
 * @returns {Readonly<Configuration>} configurations object
 */
export function configurationOf (element) {
  return Object.freeze({
    get minQueryLength () {
      return getConfigPositiveIntegerOrZero(element, { attribute: 'data-min-query-length', config: 'minQueryLength' })
    },
    get debounceQueryDuration () {
      return getConfigPositiveIntegerOrZero(element, { attribute: 'data-debounce-query-duration', config: 'debounceQueryDuration' })
    },
  })
}

/**
 *
 * @param {HTMLElement} element - target Element
 * @param {object} params - object parameters
 * @param {string} params.attribute - attribute name to query for
 * @param {keyof typeof defaultValues} params.config - config property name to search for
 * @returns {number} validConfigName
 */
function getConfigPositiveIntegerOrZero (element, { attribute, config }) {
  return validPositiveIntegerPlusZeroOrNull(element.getAttribute(attribute)) ??
    validPositiveIntegerPlusZeroOrNull(element.constructor?.['config']?.[config]) ??
    defaultValues[config]
}

/**
 *
 * @param {unknown} numericValue - target value
 * @returns {number | null} `numericValue` if integer, otherwise null
 */
function validPositiveIntegerPlusZeroOrNull (numericValue) {
  if (typeof numericValue === 'string') {
    numericValue = Number.parseFloat(numericValue)
  }
  return typeof numericValue === 'number' && Number.isInteger(numericValue) && numericValue >= 0 ? numericValue : null
}
