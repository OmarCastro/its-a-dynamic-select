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

/**
 * @param {HTMLElement} element
 * @returns {Readonly<Configuration>} configurations object
 */
export function configurationOf (element) {
  return Object.freeze({
    get minQueryLength () {
      return getConfigInteger(element, { attribute: 'data-min-query-length', config: 'minQueryLength', defaultValue: 3 })
    },
    get debounceQueryDuration () {
      return getConfigInteger(element, { attribute: 'data-debounce-query-duration', config: 'debounceQueryDuration', defaultValue: 250 })
    },
  })
}

/**
 *
 * @param {HTMLElement} element - target Element
 * @param {object} params - object parameters
 * @param {string} params.attribute - attribute name to query for
 * @param {string} params.config - config property name to search for
 * @param {number} params.defaultValue - default value to be used if not found
 * @returns {number} validConfigName
 */
function getConfigInteger (element, { attribute, config, defaultValue }) {
  return validIntegerOrNull(element.getAttribute(attribute)) ??
    validIntegerOrNull(element.constructor?.['config']?.[config]) ??
    defaultValue
}

/**
 *
 * @param {*} numericValue - target value
 * @returns {number | null} `numericValue` if integer, otherwise null
 */
function validIntegerOrNull (numericValue) {
  if (typeof numericValue === 'string') {
    numericValue = Number.parseInt(numericValue)
  }
  return Number.isInteger(numericValue) ? numericValue : null
}
