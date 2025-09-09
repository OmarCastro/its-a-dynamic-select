import { dataLoaderOf } from '../data-loading/fetch-data'
import { optionElementOfData, dataObjectOfOption } from '../../utils/option-data.js'
/** @import {OptionData} from '../../utils/option-data.js' */

/** @type {WeakMap<HTMLElement, DynamicOptionsData>} */
const dataLoaderData = new WeakMap()

/**
 * @param {HTMLElement} element - target element
 * @returns {DynamicOptionsData} dataloader of element
 */
export function dynamicOptionsOf (element) {
  let dataLoader = dataLoaderData.get(element)
  if (!dataLoader) {
    dataLoader = createDynamicOptionsDataFor(new WeakRef(element))
    dataLoaderData.set(element, dataLoader)
  }
  return dataLoader
}

/**
 * Creates a dataloader for an element
 * @param {WeakRef<HTMLElement>} elementRef - weak reference of element. We do not want to have any strong reference chain pointing to
 * globally allocated `dataLoaderData`, effectively creating a memory leak
 * @returns {DynamicOptionsData} - created dataloader for element
 */
function createDynamicOptionsDataFor (elementRef) {
  const getElement = () => {
    const element = elementRef.deref()
    if (!element) { throw new Error('element no longer exists') }
    return element
  }
  const api = {
    selectedValues: new Set(),
    get optionsData () {
      return api.options.map(dataObjectOfOption)
    },
    get options () {
      return [...getDynamicOptions(getElement()).querySelectorAll(':scope > option')]
    },
    get optionsMap () {
      return Object.fromEntries(api.options.map(option => [option.value, option]))
    },
    status: 'empty',
    loadData: () => loadData(getElement(), api),
    loadNextData: () => loadNextData(getElement(), api),
    get values () {
      return Iterator.from(api.options)
        .filter(option => option.selected)
        .map(option => option.value)
        .toArray()
    },
    set values (values) {
      api.selectedValues = new Set(...values)
      api.options.forEach(option => { option.selected = values.includes(option.value) })
    },

    toggleValue (value, selected) {
      if (selected) {
        api.selectedValues.delete(value)
      } else {
        api.selectedValues.add(value)
      }
      Iterator.from(api.options)
        .filter(option => option.value === value)
        .forEach(option => { option.selected = selected })
    },
    get selectedOptions () {
      return Iterator.from(api.options)
        .filter(option => option.selected)
        .toArray()
    }
  }
  return /** @type {DynamicOptionsData} */(api)
}

/**
 *
 * @param element
 * @param api
 */
async function loadData (element, api) {
  const loader = dataLoaderOf(element)
  const dynamicOptionsElement = getDynamicOptions(element)
  try {
    const result = await loader.fetchData()
    const { selectedValues } = api
    const optionsMap = api.optionsMap
    for (const data of result.data) {
      const objectData = dataObjectOfData(data, selectedValues)
      if (optionsMap[objectData.value] == null) {
        dynamicOptionsElement.append(optionElementOfData(objectData))
      }
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 *
 * @param element
 * @param api
 */
async function loadNextData (element, api) {
  const loader = dataLoaderOf(element)
  const dynamicOptionsElement = getDynamicOptions(element)
  try {
    const result = await loader.fetchNextData()
    const { selectedValues } = api
    const optionsMap = api.optionsMap
    for (const data of result.data) {
      const objectData = dataObjectOfData(data, selectedValues)
      if (optionsMap[objectData.value] == null) {
        dynamicOptionsElement.append(optionElementOfData(objectData))
      }
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * get data object of option in a JSON represented format
 *
 * @param {*} optionData - target element in shadow DOM
 * @param {Set<string>} selectedValues - target element in shadow DOM
 * @returns {OptionData} option data
 */
export function dataObjectOfData (optionData, selectedValues) {
  const value = String(optionData.value)
  return {
    value,
    text: optionData.text ?? value,
    selected: selectedValues.has(value),
    origin: 'fetch',
    data: optionData,
  }
}

/**
 * get data object of option in a JSON represented format
 *
 * @param {OptionData} optionData - target element in shadow DOM
 * @param {Set<string>} selectedValues - target element in shadow DOM
 * @returns {HTMLOptionElement} option data
 */
export function optionFromData (optionData, selectedValues) {
  const option = optionElementOfData(optionData)
  option.selected = selectedValues.has(optionData.value)
  return option
}

/**
 * @param {HTMLElement} element
 */
const getDynamicOptions = shadowQuery('div.dynamic-options:not(.option *)')

/**
 * @template {string} T
 * @param {T} selector - css selector
 * @returns {(element: HTMLElement) => import('typed-query-selector/parser.js').ParseSelector<T, Element>} type guarded query function
 */
function shadowQuery (selector) {
  return (element) => {
    const result = element.shadowRoot?.querySelector(selector)
    if (!result) throw Error(`Error: no "${JSON.stringify(selector)}" found in dynamic select shadow DOM`)
    return result
  }
}

/**
 * @typedef {object} DynamicOptionsData
 * @property {OptionData[]} optionsData
 * @property {HTMLOptionElement[]} options
 * @property {"loading"|"paginated"|"loadedWithAllData"|"empty"} status
 * @property {() => Promise<void>} loadData
 * @property {() => Promise<void>} loadNextData
 * @property {string[]} values
 * @property {HTMLOptionElement[]} selectedOptions
 * @property {(value: string, selected: boolean) => void} toggleValue
 */
