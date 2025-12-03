import { dropdownEl, inputEl, isDynamicSelect } from '../../utils/dynamic-select-dom.js'
import { centerDropdownPosition, shouldCenterDropdown } from '../centers-dropdown-to-screen-on-mobile/dropdown-mobile-centering.js'
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
      removeListenersForPotentialPositionChange()
      throw new Error('element no longer exists')
    }
    return element
  }
  const potentialPositionChangeCallback = () => {
    const element = getElement()
    if (!element.open) {
      api.stopAnchoringToSelect()
      return
    }
    updateDropdownPosition(element)
  }

  const addScrollListener = () => document.defaultView?.addEventListener('scroll', potentialPositionChangeCallback, true)
  const removeScrollListener = () => document.defaultView?.removeEventListener('scroll', potentialPositionChangeCallback, true)
  const addResizeListener = () => document.defaultView?.addEventListener('resize', potentialPositionChangeCallback)
  const removeResizeListener = () => document.defaultView?.removeEventListener('resize', potentialPositionChangeCallback)
  const addListenersForPotentialPositionChange = () => {
    addScrollListener()
    addResizeListener()
  }

  const removeListenersForPotentialPositionChange = () => {
    removeScrollListener()
    removeResizeListener()
  }

  /** @type {DropdownPositionUpdater} */
  const api = {
    startAnchoringToSelect: () => {
      const element = getElement()
      updateDropdownPosition(element)
      addListenersForPotentialPositionChange()
      intersectionObserver.observe(element)
    },
    stopAnchoringToSelect () {
      const element = getElement()
      intersectionObserver.unobserve(element)
      removeListenersForPotentialPositionChange()
    }
  }
  return api
}

/**
 * Update dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
export function updateDropdownPosition (dynamicSelect) {
  if (shouldCenterDropdown()) {
    centerDropdownPosition(dynamicSelect)
    return
  }
  const dropdown = dropdownEl(dynamicSelect)
  const input = inputEl(dynamicSelect)
  const clientRect = input.getBoundingClientRect()
  const viewportRect = getViewportRect()
  const isTopDirection = clientRect.bottom + dropdown.clientHeight > viewportRect.height
  const isLeftDirection = clientRect.left + dropdown.clientWidth > viewportRect.width
  const xPosition = isTopDirection ? clientRect.top : clientRect.bottom
  const yPosition = isLeftDirection ? Math.min(viewportRect.width, clientRect.right) : Math.max(0, clientRect.left)
  dropdown.classList.toggle('top-direction', isTopDirection)
  dropdown.classList.toggle('left-direction', isLeftDirection)
  dropdown.style.marginTop = `${xPosition}px`
  dropdown.style.marginLeft = `${yPosition}px`
}

/**
 * @returns {DOMRectReadOnly} viewport rect
 */
function getViewportRect () {
  const { visualViewport } = window
  if (!visualViewport) {
    return new DOMRectReadOnly(0, 0, window.innerWidth, window.innerHeight)
  }
  const { offsetLeft, offsetTop, width, height } = visualViewport
  return new DOMRectReadOnly(offsetLeft, offsetTop, width, height)
}

/**
 * @typedef {object} DropdownPositionUpdater
 * @property {() => void} startAnchoringToSelect - starts anchoring to select until select is not visible,
 *   at that point it closes the dropdown
 * @property {() => void} stopAnchoringToSelect - stop anchoring to select
 */
