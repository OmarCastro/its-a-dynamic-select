import { isPlainObject } from './object.js'

/**
 * @typedef {object} OptionData
 *
 * JSON representation of option data
 *
 * @property {boolean} selected - option selected flag
 * @property {string} text - option text
 * @property {string} value - option value
 * @property {"fetch"|"option"} origin - gets where the data is from
 * @property { {
 *  [x:string]: any,
 *  text: string,
 *  value: string,
 *  group?: string
 * }} data - option custom data
 */

/**
 * get data object of option in a JSON represented format
 *
 * @param {HTMLOptionElement} option - target element in shadow DOM
 * @returns {OptionData} option data
 */
export function dataObjectOfOption (option) {
  const baseData = {
    text: option.textContent || '',
    value: option.value,
  }
  const dataAttr = option.getAttribute('data-of-option')
  if (dataAttr != null && dataAttr.trim() !== '') {
    try {
      const jsonData = JSON.parse(dataAttr)
      if (!isPlainObject(jsonData)) { throw Error('data-of-option attr must be serialized json object') }
      return {
        ...baseData,
        selected: option.selected,
        origin: 'option',
        data: {
          ...jsonData,
          ...baseData,
        }
      }
    } catch {
      // ignore
    }
  }
  return {
    ...baseData,
    selected: option.selected,
    origin: 'option',
    data: baseData,
  }
}
