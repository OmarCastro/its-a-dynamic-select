/** @import {ParseSelector} from "typed-query-selector/parser.d.ts" */

/** @typedef {import('../web-component/dynamic-select.element.js').DynamicSelect} DynamicSelect */

export const searchInputEl = shadowQuery('input.search-input')
export const inputEl = shadowQuery('span.input')
export const dropdownEl = shadowQuery('dialog.dropdown')
export const valueListEl = shadowQuery('dialog.dropdown > ul.value-list')

export const isSearchInputEl = elementMatcher('input.search-input')
export const isDeselectButton = elementMatcher('.multiselect-option[data-value] > button.deselect-option')
export const getDynamicOptions = shadowQuery('div.dynamic-options:not(.option *)')

export const isDynamicSelectSymbol = Symbol('its-a-dynamic-select')

/**
 * Gets hots DynamicSelect element from a shadow DOM element
 *
 * @param {EventTarget | null} target - target element in shadow DOM
 * @returns {DynamicSelect} host element
 */
export function getHostDynamicSelect (target) {
  if (!(target instanceof Element)) throw Error('target is not an element')
  const rootNode = target.getRootNode()
  if (!(rootNode instanceof ShadowRoot)) throw Error('target is not inside a shadow dom')
  const host = rootNode.host
  if (!isDynamicSelect(host)) throw Error('target is not inside a Dynamic Select shadow dom')
  return host
}

/**
 * @template {string} T
 * @param {T} selector - css selector
 * @returns {(dynamicSelect: DynamicSelect) => ParseSelector<T, Element>} type guarded query function
 */
function shadowQuery (selector) {
  return (dynamicSelect) => {
    const result = dynamicSelect.shadowRoot?.querySelector(selector)
    if (!result) throw Error(`Error: no "${JSON.stringify(selector)}" found in dynamic select shadow DOM`)
    return result
  }
}

/**
 * @template {string} T
 * @param {T} selector - selector to match
 */
function elementMatcher (selector) {
/**
 * @param {EventTarget | null} element - target element
 * @returns {element is ParseSelector<T, Element>} type guarded element matcher
 */
  return function (element) {
    return element instanceof Element && element.matches(selector)
  }
}

/**
 *
 * @param {Element} element
 * @returns {element is DynamicSelect}
 */
export function isDynamicSelect (element) {
  return element[isDynamicSelectSymbol] === true
}
