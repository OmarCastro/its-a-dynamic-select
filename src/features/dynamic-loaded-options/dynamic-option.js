import { dataLoaderOf } from '../data-loading/fetch-data.js'
import { optionElementOfData, dataObjectOfOption } from '../../utils/option-data.js'
import { containerEl, getDynamicOptions } from '../../utils/dynamic-select-dom.js'
/** @import {DynamicSelect} from '../../utils/dynamic-select-dom.js' */
/** @import {OptionData} from '../../utils/option-data.js' */

/** @type {WeakMap<DynamicSelect, DynamicOptionsData>} */
const dataLoaderData = new WeakMap()

/**
 * @param {DynamicSelect} element - target element
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
 * @param {WeakRef<DynamicSelect>} elementRef - weak reference of element. We do not want to have any strong reference chain pointing to
 * globally allocated `dataLoaderData`, effectively creating a memory leak
 * @returns {DynamicOptionsData} - created dataloader for element
 */
function createDynamicOptionsDataFor (elementRef) {
  const getElement = () => {
    const element = elementRef.deref()
    if (!element) { throw new Error('element no longer exists') }
    return element
  }
  /** @type {DynamicOptionsData} */
  const api = {
    selectedValues: new Set(),
    get options () {
      return [...getDynamicOptions(getElement()).querySelectorAll(':scope > option')]
    },
    get optionsData () {
      return api.options.map(option => Object.freeze({ ...dataObjectOfOption(option), origin: 'fetch' }))
    },
    get optionsMap () {
      return Object.fromEntries(api.options.map(option => [option.value, option]))
    },
    status: 'empty',
    loadData: () => loadData(getElement()),
    loadNextData: () => loadNextData(getElement()),
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

    toggleValue (value, force) {
      const selected = force == null ? !api.selectedValues.has(value) : force
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
  return api
}

/**
 * Loads data of dynamic select. Loads first page if paginated
 * @param {DynamicSelect} element - target dynamic select element
 */
async function loadData (element) {
  const loader = dataLoaderOf(element)
  const dynamicOptionsElement = getDynamicOptions(element)
  try {
    const fetchData = loader.fetchData()
    containerEl(element).setAttribute('load-mode', loader.fetchHistory.at(-1)?.loadingMode ?? 'sync')
    const result = await fetchData
    const api = dynamicOptionsOf(element)
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
 * Loads next page.
 * @param {DynamicSelect} element - target dynamic select element
 */
async function loadNextData (element) {
  const loader = dataLoaderOf(element)
  const dynamicOptionsElement = getDynamicOptions(element)
  try {
    const result = await loader.fetchNextData()
    const api = dynamicOptionsOf(element)
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
 * @typedef {object} DynamicOptionsData
 *
 * Manages dynamic select's dynamically generated options, be it by fetching it
 * from an URL or other source, such as calling `details.respondWith()` on
 * "fetch" event
 *
 * @property {HTMLOptionElement[]} options - List of dynamically generated options
 * @property {OptionData[]} optionsData - `options` mapped to data
 * @property {Set<string>} selectedValues - Dynamically selected values, does not reflect 100% to values:
 *   you can set any list of values on the selected values, but if the option does not exist it will
 *   be excluded on the `values`. When the option exists (is loaded asynchronously), the it will be
 *   it will be automatically added to `values`
 * @property {{[k: string]: HTMLOptionElement}} optionsMap - Map of value to HTMLOptionElement
 * @property {"loading"|"paginated"|"fullyLoaded"|"empty"} status Dynamic options state:
 *      - `"loading"`: loading data
 *      - `"paginated"`: data loaded and has a next page
 *      - `"fullyLoaded"`: data loaded. All pages are loaded if paginated
 *      - `"empty"`: no data loaded at all
 * @property {() => Promise<void>} loadData - loads data of dynamic select. Loads first page if paginated
 * @property {() => Promise<void>} loadNextData - Loads next page. Only used in paginated data.
 * @property {string[]} values - values applied to select
 * @property {HTMLOptionElement[]} selectedOptions - selected option elements
 * @property {(value: string, selected?: boolean) => void} toggleValue - toggle value of select
 */
