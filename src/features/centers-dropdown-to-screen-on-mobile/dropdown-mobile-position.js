import { dropdownEl } from '../../utils/dynamic-select-dom'
import { isMobile } from '../../utils/mobile-detection.js'
/** @import {DynamicSelect} from '../../utils/dynamic-select-dom' */

/**
 * @returns {boolean} true if dropdown should be centered on screen instead
 * of being anchored to the select box
 */
export function shouldCenterDropdown () {
  return isMobile()
}

/**
 * Updated dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
export function centerDropdownPosition (dynamicSelect) {
  const dropdown = dropdownEl(dynamicSelect)
  dropdown.classList.remove('top-direction', 'left-direction')
  dropdown.style.marginTop = ''
  dropdown.style.marginLeft = ''
}
