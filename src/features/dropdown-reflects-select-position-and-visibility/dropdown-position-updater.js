import { dropdownEl, inputEl, isDynamicSelect } from '../../utils/dynamic-select-dom'
/** @import {DynamicSelect} from '../../utils/dynamic-select-dom' */

/** @type {WeakMap<DynamicSelect, DropdownPositionUpdater>} */
const dataLoaderData = new WeakMap()

const intersectionObserver = new IntersectionObserver(records => {
  const selects = new Set(Iterator.from(records)
    .filter(record => !record.isIntersecting)
    .map(record => record.target)
    .filter(isDynamicSelect))
  selects.forEach(select => {
    select.open = false
    dropdownPositionUpdaterOf(select).stopAnchoringToSelect()
  })
})

/**
 * @param {DynamicSelect} element - target element
 * @returns {DropdownPositionUpdater} dataloader of element
 */
export function dropdownPositionUpdaterOf (element) {
  let dataLoader = dataLoaderData.get(element)
  if (!dataLoader) {
    dataLoader = createDropdownPositionUpdaterFor(new WeakRef(element))
    dataLoaderData.set(element, dataLoader)
  }
  return dataLoader
}

/**
 * Creates a dataloader for an element
 * @param {WeakRef<DynamicSelect>} elementRef - weak reference of element. We do not want to have any strong reference chain pointing to
 * globally allocated `dataLoaderData`, effectively creating a memory leak
 * @returns {DropdownPositionUpdater} - created dataloader for element
 */
function createDropdownPositionUpdaterFor (elementRef) {
  const getElement = () => {
    const element = elementRef.deref()
    if (!element) {
      removeScrollListener()
      throw new Error('element no longer exists')
    }
    return element
  }
  const scrollChangeCallback = () => {
    const element = getElement()
    if (!element.open) {
      api.stopAnchoringToSelect()
      return
    }
    updateDropdownPosition(element)
  }

  const addScrollListener = () => document.defaultView?.addEventListener('scroll', scrollChangeCallback, true)
  const removeScrollListener = () => document.defaultView?.removeEventListener('scroll', scrollChangeCallback, true)

  /** @type {DropdownPositionUpdater} */
  const api = {
    startAnchoringToSelect: () => {
      const element = getElement()
      updateDropdownPosition(element)
      addScrollListener()
      intersectionObserver.observe(element)
    },
    stopAnchoringToSelect () {
      const element = getElement()
      intersectionObserver.unobserve(element)
      removeScrollListener()
    }

  }
  return api
}

/**
 * Updated dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
export function updateDropdownPosition (dynamicSelect) {
  const dropdown = dropdownEl(dynamicSelect)
  const input = inputEl(dynamicSelect)
  const clientRect = input.getBoundingClientRect()
  const isTopDirection = clientRect.bottom + dropdown.clientHeight > getViewportHeight()
  dropdown.classList.toggle('top-direction', isTopDirection)
  if (isTopDirection) {
    dropdown.style.marginTop = `${clientRect.top}px`
    dropdown.style.marginLeft = `${clientRect.left}px`
  } else {
    dropdown.style.marginTop = `${clientRect.bottom}px`
    dropdown.style.marginLeft = `${clientRect.left}px`
  }
}

/**
 * gets viewport height
 */
function getViewportHeight () {
  return window.visualViewport?.height ?? window.innerHeight
}

/**
 * @typedef {object} DropdownPositionUpdater
 * @property {() => void} startAnchoringToSelect - starts anchoring to select until select is not visible,
 *   at that point it closes the dropdown
 * @property {() => void} stopAnchoringToSelect - stop anchoring to select
 */
