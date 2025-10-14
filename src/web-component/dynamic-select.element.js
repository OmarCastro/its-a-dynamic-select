import html from './dynamic-select.element.html'
import css from './dynamic-select.element.css'
import { applyTemplate } from '../utils/templater'
import { isPlainObject } from '../utils/object'
import { dataObjectOfOption } from '../utils/option-data'
import { templatesOf } from '../features/templates/templates'
import { configurationOf } from '../features/configuration/configuration'
import { dynamicOptionsOf } from '../features/dynamic-loaded-options/dynamic-option'
import { computeOnce } from '../utils/memoization'
import * as dom from '../utils/dynamic-select-dom'
import { dropdownPositionUpdaterOf, updateDropdownPosition } from '../features/dropdown-reflects-select-position-and-visibility/dropdown-position-updater'
import { isMobile, MobileDetectionObserver } from '../utils/mobile-detection'
/** @import { OptionData } from '../utils/option-data' */

const loadTemplate = computeOnce(() => {
  const templateElement = document.createElement('template')
  templateElement.innerHTML = html
  return templateElement
})

const loadStyles = computeOnce(() => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  return sheet
})

const { searchInputEl, inputEl, dropdownEl, valueListEl } = dom
const { isSearchInputEl, isDeselectButton, isClearButton, getHostDynamicSelect } = dom

const optionsObserver = new MutationObserver(mutation => {

})
/** @type {MutationObserverInit} */
const optionsObserverOptions = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['data-of-option']
}

const mobileDetectionObserver = new MobileDetectionObserver(mutations => {
  for (const mutation of mutations) {
    console.log('AAAAAAAA')
    inputEl(mutation.target).toggleAttribute('data-mobile', mutation.isMobile)
  }
})

export class DynamicSelect extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.adoptedStyleSheets = [loadStyles()]
    const template = loadTemplate()
    shadowRoot.append(document.importNode(template.content, true))

    searchInputEl(this).addEventListener('input', handleSearchInputChange)
    inputEl(this).addEventListener('click', handleSelectValueButtonClick)
    dropdownEl(this).addEventListener('toggle', handleDropdownToggle)
    dropdownEl(this).addEventListener('pointerdown', handleDropdownPointerDown)
    dropdownEl(this).addEventListener('click', handleDropdownOptionClick)
    optionsObserver.observe(this, optionsObserverOptions)
    mobileDetectionObserver.observe(this)
  }

  connectedCallback () {
    updateDropdownContent(this)
    updateButtonContent(this)
  }

  get searchFilter () {
    return this.getAttribute('data-filter') ?? ''
  }

  set searchFilter (newSearchFilter) {
    if (newSearchFilter === '' || newSearchFilter == null) {
      this.removeAttribute('data-filter')
    }
    this.setAttribute('data-filter', String(newSearchFilter))
  }

  get value () {
    return this.valueAsArray[0] ?? ''
  }

  set value (value) {
    if (typeof value !== 'string') return
    this.valueAsArray = [value]
  }

  get valueAsArray () {
    let iterator = Iterator.from(this.selectedOptions).map(option => option.value)
    if (!this.multiple) {
      iterator = iterator.take(1)
    }
    return iterator.toArray()
  }

  set valueAsArray (valueAsArray) {
    if (!Array.isArray(valueAsArray)) { return }
    Iterator.from(this.options).forEach(option => {
      option.selected = valueAsArray.includes(option.value)
    })
    dynamicOptionsOf(this).values = valueAsArray
  }

  get valueAsObjects () {
    let iterator = Iterator.from(this.selectedOptions)
      .map(dataObjectOfOption)
      .map(info => info.data)
    if (!this.multiple) {
      iterator = iterator.take(1)
    }
    return iterator.toArray()
  }

  set valueAsObjects (valueAsObjects) {
    if (!Array.isArray(valueAsObjects)) { return }
    const isValidValue = (value) => typeof value === 'string' || !isNaN(value)
    const validValueEntries = Iterator.from(valueAsObjects)
      .filter(isPlainObject)
      .filter(obj => isValidValue(obj.value))
      .map(obj => [obj.value, obj])
    const map = Object.fromEntries(validValueEntries)
    Iterator.from(this.options).forEach(option => {
      const data = map[option.value]
      if (data) {
        option.selected = false
        return
      }
      option.selected = true
      if (isPlainObject(data)) {
        const { text, value, ...rest } = data
        if (Object.keys(rest).length > 0) {
          option.setAttribute('data-of-option', JSON.stringify(data))
        }
      }
    })
  }

  get open () {
    return this.hasAttribute('open')
  }

  set open (openBool) {
    if (typeof openBool === 'boolean') {
      this.toggleAttribute('open', openBool)
    }
  }

  get [dom.isDynamicSelectSymbol] () { return true }

  get multiple () {
    return this.hasAttribute('multiple')
  }

  set multiple (multipleBool) {
    if (typeof multipleBool === 'boolean') {
      this.toggleAttribute('multiple', multipleBool)
    }
  }

  static get observedAttributes () {
    return ['open', 'data-filter']
  }

  get options () {
    return [...this.querySelectorAll('option'), ...dynamicOptionsOf(this).options]
  }

  get selectedOptions () {
    const { options } = this
    const result = Iterator.from(options).filter(option => option.selected).toArray()
    if (result.length || this.multiple) {
      return result
    }
    const firstOption = options[0]
    if (!firstOption) {
      return []
    }
    firstOption.selected = true
    return [firstOption]
  }

  get src () {
    return this.querySelectorAll('option[selected]')
  }

  /**
   * @param {string} name - attribute name
   * @param {string} oldValue - previous attribute value
   * @param {string} newValue - current attribute value
   */
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'open':
        if (this.open) {
          if (isMobile()) {
            dropdownEl(this).showModal()
          } else {
            dropdownEl(this).showPopover()
          }
          dropdownPositionUpdaterOf(this).startAnchoringToSelect()
          updateDropdownContent(this)
          dynamicOptionsOf(this).loadData().then(() => {
            updateDropdownContent(this)
          })
        } else {
          if (isMobile()) {
            dropdownEl(this).close()
          } else {
            dropdownEl(this).hidePopover()
          }
          dropdownPositionUpdaterOf(this).stopAnchoringToSelect()
        }
        break
      case 'data-filter':
        searchInputEl(this).value = newValue
        updateDropdownContent(this)
        dynamicOptionsOf(this).loadData().then(() => {
          updateDropdownContent(this)
        })
    }
  }
}

/**
 * Updates dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 * @returns {{
 *    ungroupedOptions: OptionData[],
 *    optionGroups: {[groupName:string]: OptionData[]}
 * }} - dropdown data
 */
function getDropdownListData (dynamicSelect) {
  const ungroupedOptions = []
  const optionGroups = ({})

  for (const option of dynamicSelect.querySelectorAll(':scope > option')) {
    ungroupedOptions.push(dataObjectOfOption(option))
  }
  for (const option of dynamicSelect.querySelectorAll(':scope > optgroup option')) {
    const groupName = option.closest('optgroup')?.label
    const data = dataObjectOfOption(option)

    if (!groupName) {
      ungroupedOptions.push(data)
    } else {
      optionGroups[groupName] ??= []
      optionGroups[groupName].push(data)
    }
  }

  const { optionsData } = dynamicOptionsOf(dynamicSelect)
  for (const data of optionsData) {
    const groupName = data.data.group?.toString()
    if (!groupName) {
      ungroupedOptions.push(data)
    } else {
      optionGroups[groupName] ??= []
      optionGroups[groupName].push(data)
    }
  }

  const { searchFilter } = dynamicSelect
  const { minQueryLength } = configurationOf(dynamicSelect)

  if (typeof searchFilter === 'string' && searchFilter.trim() !== '' && searchFilter.length >= minQueryLength) {
    const matchFilter = filterMatcher(searchFilter)
    const filteredUngrouped = ungroupedOptions.filter((option) => matchFilter(option.text))
    const filteredOptionGroups = ({})

    for (const [groupName, options] of Object.entries(optionGroups)) {
      if (matchFilter(groupName)) {
        filteredOptionGroups[groupName] = options
        continue
      }
      const filteredOptions = options.filter((option) => matchFilter(option.text))
      if (filteredOptions.length > 0) {
        filteredOptionGroups[groupName] = filteredOptions
      }
    }
    return {
      ungroupedOptions: filteredUngrouped,
      optionGroups: filteredOptionGroups
    }
  }

  return { ungroupedOptions, optionGroups }
}

/**
 * Updates dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 * @returns {{
 *    ungroupedOptions: (OptionData & {checkedIndicatorType: "radio" | "checkbox"})[],
 *    optionGroups: {groupName:string, options: (OptionData & {checkedIndicatorType: "radio" | "checkbox"})[]}[]
 * }} - dropdown data
 */
function getDropdownTemplateData (dynamicSelect) {
  const { ungroupedOptions, optionGroups } = getDropdownListData(dynamicSelect)

  const checkedIndicatorType = dynamicSelect.multiple ? 'checkbox' : 'radio'
  return {
    ungroupedOptions: ungroupedOptions.map(option => ({ ...option, checkedIndicatorType })),
    optionGroups: Object.entries(optionGroups).map(([groupName, options]) => ({ groupName, options: options.map(option => ({ ...option, checkedIndicatorType })) }))

  }
}

/**
 * Create a predicate as option filter on dropdown
 * @param {string} filter - filter value, generally the filter input on the dropdown
 * @returns {(text: string) => boolean} filter predicate
 */
const filterMatcher = (filter) => {
  const caseInsensitiveFilter = filter.trim().toLocaleLowerCase()
  return (text) => text.toLowerCase().includes(caseInsensitiveFilter)
}

/**
 * Updates dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
function updateDropdownContent (dynamicSelect) {
  const dropdownData = getDropdownTemplateData(dynamicSelect)
  const { dropdownList, option: optionTemplate } = templatesOf(dynamicSelect)
  const listFragment = applyTemplate(dropdownList, dropdownData)
  listFragment.querySelectorAll('slot[name="option"]').forEach(slot => {
    const data = JSON.parse(slot.dataset.value || '{}')
    slot.replaceWith(applyTemplate(optionTemplate, data))
  })

  const valueList = valueListEl(dynamicSelect)
  valueList.replaceChildren(listFragment)
}

/**
 * Updates button content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
function updateButtonContent (dynamicSelect) {
  const { option: optionTemplate, multiSelectInput, singleSelectInput } = templatesOf(dynamicSelect)
  const isMultiple = dynamicSelect.multiple
  const buttonTemplate = isMultiple ? multiSelectInput : singleSelectInput
  const selectedOptionsVal = dynamicSelect.selectedOptions.map(dataObjectOfOption)
  const data = {
    isMultiple,
    isSingle: !isMultiple,
    selectedOptions: selectedOptionsVal,
    selectedOption: selectedOptionsVal[0],
  }
  const button = applyTemplate(buttonTemplate, data)
  button.querySelectorAll('slot[name="selected-option"]').forEach(slot => {
    const data = JSON.parse(slot.dataset.value || '{}')
    slot.replaceWith(applyTemplate(optionTemplate, data))
  })
  inputEl(dynamicSelect).replaceChildren(button)
}

/**
 * @param {Event} event - input event
 */
function handleSearchInputChange (event) {
  const { target } = event
  if (!isSearchInputEl(target)) return
  const dynamicSelect = getHostDynamicSelect(target)
  dynamicSelect.searchFilter = target.value
}

/**
 * @param {Event} event - input event
 */
function handleSelectValueButtonClick (event) {
  const { target } = event
  if (isDeselectButton(target)) {
    const option = target.closest('.multiselect-option')
    if (!(option instanceof HTMLElement)) { return }
    const value = option.dataset.value
    const dynamicSelect = getHostDynamicSelect(option)
    const selectOption = dynamicSelect.selectedOptions.find(option => option.value === value)
    if (selectOption == null) { return }
    selectOption.selected = false
    dynamicOptionsOf(dynamicSelect).toggleValue(selectOption.value, false)
    updateButtonContent(dynamicSelect)
  } else if (isClearButton(target)) {
    const dynamicSelect = getHostDynamicSelect(target)
    dynamicSelect.valueAsArray = []
    updateButtonContent(dynamicSelect)
  } else {
    const dynamicSelect = getHostDynamicSelect(event.target)
    dynamicSelect.open = !dynamicSelect.open
  }
}

/**
 * @param {Event} event - input event
 */
function handleDropdownToggle (event) {
  const dynamicSelect = getHostDynamicSelect(event.target)
  dynamicSelect.open = dropdownEl(dynamicSelect).matches(':popover-open,:open')
}

/**
 * @param {PointerEvent} event - input event
 */
function handleDropdownPointerDown (event) {
  const { target, currentTarget, clientX, clientY } = event
  const isClickingOnDialog = target === currentTarget
  if (isClickingOnDialog && currentTarget instanceof HTMLElement) {
    const { left, right, bottom, top } = currentTarget.getBoundingClientRect()
    if (clientX < left || clientX > right || clientY < top || clientY > bottom) {
      getHostDynamicSelect(target).open = false
    }
  }
}

/**
 * @param {Event} event - input event
 */
function handleDropdownOptionClick (event) {
  const { target } = event
  if (!(target instanceof Element)) { return }
  const liTarget = target.closest('li.option-value:not(.option *)')
  if (!(liTarget instanceof HTMLLIElement)) { return }
  const value = liTarget.dataset.value
  if (typeof value !== 'string') return
  const dynamicSelect = getHostDynamicSelect(liTarget)
  if (dynamicSelect.multiple) {
    const valueSet = new Set(dynamicSelect.valueAsArray)
    const toggledValue = valueSet.symmetricDifference(new Set([value]))
    dynamicSelect.valueAsArray = [...toggledValue]
    updateButtonContent(dynamicSelect)
    updateDropdownContent(dynamicSelect)
    updateDropdownPosition(dynamicSelect)
  } else {
    dynamicSelect.value = value
    updateButtonContent(dynamicSelect)
    updateDropdownContent(dynamicSelect)
    dynamicSelect.open = false
  }
}
