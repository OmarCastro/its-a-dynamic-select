import html from './dynamic-select.element.html'
import css from './dynamic-select.element.css'
/** @import {ParseSelector} from "typed-query-selector/parser.d.ts" */

let loadTemplate = () => {
  const templateElement = document.createElement('template')
  templateElement.innerHTML = html
  loadTemplate = () => templateElement
  return templateElement
}
let loadStyles = () => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  loadStyles = () => sheet
  return sheet
}

const searchInputEl = shadowQuery('input.search-input')
const dropdownEl = shadowQuery('dialog.dropdown')
const selectedValueButton = shadowQuery('button.selected-value')
const valueListEl = shadowQuery('dialog.dropdown > ul.value-list')
const collapseArrow = shadowQuery('span.collapse-arrow')

const isSearchInputEl = elementMatcher('input.search-input')

const optionsObserver = new MutationObserver(mutation => {

})

export class DynamicSelect extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.adoptedStyleSheets = [loadStyles()]
    const template = loadTemplate()
    shadowRoot.append(document.importNode(template.content, true))

    searchInputEl(this).addEventListener('input', handleSearchInputChange)
    selectedValueButton(this).addEventListener('click', handleSelectValueButtonClick)
    dropdownEl(this).addEventListener('toggle', handleDropdownToggle)
  }

  connectedCallback () {
    updateDropdownContent(this)
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

  /**
   * @param {string} name - attribute name
   * @param {string} oldValue - previous attribute value
   * @param {string} newValue - current attribute value
   */
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'open':
        updateSelectButtonContent(this)
        if (this.open) {
          dropdownEl(this).showPopover()
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
function updateSelectButtonContent (dynamicSelect) {
  const arrowContent = dynamicSelect.open ? '▲' : '▼'
  collapseArrow(dynamicSelect).innerHTML = arrowContent
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
  const dynamicSelect = getHostDynamicSelect(event.target)
  dynamicSelect.open = !dynamicSelect.open
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
