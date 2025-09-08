import { dataLoaderOf } from '../data-loading/fetch-data'
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
  /** @type {DynamicOptionsData} */
  const api = {
    selectedValues: new Set(),
    optionsData: [],
    status: 'empty',
    async loadData () {
      const loader = dataLoaderOf(getElement())
      try {
        const result = await loader.fetchData()
        const { selectedValues } = api
        api.optionsData = result.data.map(optionData => dataObjectOfData(optionData, selectedValues))
      } catch (e) {
        console.error(e)
      }
    },
    async loadNextData () {
      const loader = dataLoaderOf(getElement())
      try {
        const result = await loader.fetchNextData()
        const { selectedValues } = api
        api.optionsData.push(...result.data.map(optionData => dataObjectOfData(optionData, selectedValues)))
      } catch (e) {
        console.error(e)
      }
    },
    toggleValue (value, selected) {
      if (selected) {
        api.selectedValues.add(value)
      } else {
        api.selectedValues.delete(value)
      }
      Iterator.from(api.optionsData)
        .filter(option => option.value === value)
        .forEach(option => { option.selected = selected })
    }
  }
  return api
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
    text: optionData.textContent ?? value,
    selected: selectedValues.has(value),
    origin: 'fetch',
    data: optionData,
  }
}

/**
 * @typedef {object} DynamicOptionsData
 * @property {Set<string>} selectedValues
 * @property {OptionData[]} optionsData
 * @property {"loading"|"paginated"|"loadedWithAllData"|"empty"} status
 * @property {() => Promise<void>} loadData
 * @property {() => Promise<void>} loadNextData
 * @property {(value: string, selected: boolean) => void} toggleValue
 */
