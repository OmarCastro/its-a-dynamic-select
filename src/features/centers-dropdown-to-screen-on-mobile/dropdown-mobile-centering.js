import { dropdownEl } from '../../utils/dynamic-select-dom.js'
import { isMobile } from '../../utils/mobile-detection.js'
import { IterableWeakSet } from '../../utils/iterable-weak-struct.js'
/** @import {DynamicSelect} from '../../utils/dynamic-select-dom.js' */

/**
 * @returns {boolean} true if dropdown should be centered on screen instead
 * of being anchored to the select box
 */
export function shouldCenterDropdown () {
  return isMobile()
}

const positionFixer = (() => {
  /** @type {IterableWeakSet<DynamicSelect>} */
  const selectBoxes = new IterableWeakSet()

  const viewport = window.visualViewport
  if (!viewport) {
    return {
      applyOnSelect () {},
    }
  }

  const startListening = () => {
    viewport.addEventListener('scroll', handler)
    viewport.addEventListener('resize', handler)
  }

  const stopListening = () => {
    viewport.removeEventListener('scroll', handler)
    viewport.removeEventListener('resize', handler)
  }

  const updateDropdownPosition = (element) => {
    const offsetLeft = viewport.offsetLeft
    const offsetTop = viewport.offsetTop

    const boundingRect = element.getBoundingClientRect()

    const left = offsetLeft + (viewport.width - boundingRect.width) / 2
    const top = offsetTop + (viewport.height - boundingRect.height) / 2

    // You could also do this by setting style.left and style.top if you
    // use width: 100% instead.
    element.style.transform = `translate(${left}px, ${top}px) scale(${1 / viewport.scale})`
    element.style.transformOrigin = 'top left'
  }

  const handler = () => {
    if (selectBoxes.size <= 0) {
      stopListening()
      return
    }
    for (const select of selectBoxes) {
      if (!select.open) {
        selectBoxes.delete(select)
        continue
      }
      updateDropdownPosition(dropdownEl(select))
    }
  }

  /**
   * @param {DynamicSelect} dynamicSelect - target dynamic select
   */
  const applyOnSelect = (dynamicSelect) => {
    selectBoxes.add(dynamicSelect)
    if (dynamicSelect.open) {
      const dropdown = dropdownEl(dynamicSelect)
      updateDropdownPosition(dropdown)
      // apply twice because first `getBoundingClientRect` is not applying in updated transformation
      updateDropdownPosition(dropdown)
    }
    startListening()
  }

  return {
    applyOnSelect
  }
})()

/**
 * Updated dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
export function centerDropdownPosition (dynamicSelect) {
  const dropdown = dropdownEl(dynamicSelect)
  positionFixer.applyOnSelect(dynamicSelect)
  dropdown.classList.remove('top-direction', 'left-direction')
  dropdown.style.marginTop = ''
  dropdown.style.marginLeft = ''
}
