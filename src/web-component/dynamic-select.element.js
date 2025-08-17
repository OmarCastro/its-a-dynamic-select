import html from './dynamic-select.element.html'
import defaultTemplatesHtml from './dynamic-select.templates.inline.html'
import css from './dynamic-select.element.css'
import { applyTemplate } from '../utils/templater'
/** @import {ParseSelector} from "typed-query-selector/parser.d.ts" */

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

const loadSelectDefaultTemplates = computeOnce(() => {
  const templatesRootElement = document.createElement('template')
  templatesRootElement.innerHTML = defaultTemplatesHtml
  /**
   * @param {string} name - template id on './dynamic-select.templates.html'
   */
  const query = (name) => {
    const result = templatesRootElement.content.querySelector('template#' + name)
    if (!(result instanceof HTMLTemplateElement)) throw Error(`Error: default template "${JSON.stringify(name)}" not defined`)
    return result
  }

  const templates = {
    option: query('option'),
    selectedOption: query('selected-option'),
    singleSelectInput: query('single-select-input'),
    multiSelectInput: query('multi-select-input'),
  }
  return templates
})

const searchInputEl = shadowQuery('input.search-input')
const inputEl = shadowQuery('span.input')
const dropdownEl = shadowQuery('dialog.dropdown')
const valueListEl = shadowQuery('dialog.dropdown > ul.value-list')

const isSearchInputEl = elementMatcher('input.search-input')
const isDeselectButton = elementMatcher('.multiselect-option[data-value] > button.deselect-option')

const optionsObserver = new MutationObserver(mutation => {

})
/** @type {MutationObserverInit} */
const optionsObserverOptions = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['data-of-option']
}

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
    optionsObserver.observe(this, optionsObserverOptions)
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
  }

  get open () {
    return this.hasAttribute('open')
  }

  set open (openBool) {
    if (typeof openBool === 'boolean') {
      this.toggleAttribute('open', openBool)
    }
  }

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
    return this.querySelectorAll('option')
  }

  get selectedOptions () {
    const result = Iterator.from(this.querySelectorAll('option')).filter(option => option.selected).toArray()
    if (result.length || this.multiple) {
      return result
    }
    const firstOption = this.querySelector('option')
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
          dropdownEl(this).showPopover()
          updateDropdownPosition(this)
        } else {
          dropdownEl(this).close()
        }
        break
      case 'data-filter':
        searchInputEl(this).value = newValue
    }
  }
}

/**
 * Updated dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
function getSelectedOptionTemplate (dynamicSelect) {
  const defaults = loadSelectDefaultTemplates()
  return defaults.selectedOption
}

/**
 * Updated dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
function updateDropdownContent (dynamicSelect) {
  const newChildren = []
  for (const optionOrGroup of dynamicSelect.querySelectorAll(':scope > :is(option, optgroup)')) {
    newChildren.push(optionOrGroup.cloneNode(true))
  }
  const valueList = valueListEl(dynamicSelect)
  valueList.replaceChildren(...newChildren)
}

/**
 * Updated dropdown content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
function updateDropdownPosition (dynamicSelect) {
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
 *
 */
function getViewportHeight () {
  return window.visualViewport?.height ?? window.innerHeight
}

/**
 * Updated input content based on the content in dynamic select in light DOM
 * @param {DynamicSelect} dynamicSelect - web component element reference
 */
function updateButtonContent (dynamicSelect) {
  const optionTemplate = getSelectedOptionTemplate(dynamicSelect)
  const defaultTemplates = loadSelectDefaultTemplates()
  const isMultiple = dynamicSelect.multiple
  const buttonTemplate = isMultiple ? defaultTemplates.multiSelectInput : defaultTemplates.singleSelectInput
  const selectedOptionsVal = dynamicSelect.selectedOptions.map(option => ({
    text: option.textContent,
    value: option.value
  }))
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
  dynamicSelect.open = dropdownEl(dynamicSelect).matches(':popover-open')
}

/**
 * @param {EventTarget | null} target - target
 * @returns {DynamicSelect} host element
 */
function getHostDynamicSelect (target) {
  if (!(target instanceof Element)) throw Error('target is not an element')
  const rootNode = target.getRootNode()
  if (!(rootNode instanceof ShadowRoot)) throw Error('target is not inside a shadow dom')
  const host = rootNode.host
  if (!(host instanceof DynamicSelect)) throw Error('target is not inside a Dynamic Select shadow dom')
  return host
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
 * Memoization technique that computes once
 * @template {() => any} T
 * @param {T} callback - callback to memoize
 * @returns {() => ReturnType<T>} memoized function
 */
function computeOnce (callback) {
  let result
  return () => result ?? (result = callback())
}
