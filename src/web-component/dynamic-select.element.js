import html from './dynamic-select.element.html'
import css from './dynamic-select.element.css'

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

/** @type {(dynamicSelect: DynamicSelect) => HTMLInputElement} */
const searchInputEl = (dynamicSelect) => dynamicSelect.shadowRoot.querySelector('input.search-input')
/** @type {(dynamicSelect: DynamicSelect) => HTMLDialogElement} */
const dropdownEl = (dynamicSelect) => dynamicSelect.shadowRoot.querySelector('dialog.dropdown')
/** @type {(dynamicSelect: DynamicSelect) => HTMLDialogElement} */
const selectedValueButton = (dynamicSelect) => dynamicSelect.shadowRoot.querySelector('button.selected-value')
/** @type {(dynamicSelect: DynamicSelect) => HTMLUListElement} */
const valueListEl = (dynamicSelect) => dynamicSelect.shadowRoot.querySelector('dialog.dropdown > ul.value-list')

/** @type {(element: Element) => element is HTMLInputElement} */
const isSearchInputEl = (node) => node.matches('input.search-input')
/** @type {(element: Element) => element is HTMLInputElement} */
const isSelectedValueButton = (node) => node.matches('button.selected-value')

const optionsObserver = new MutationObserver(mutation => {

})

export class DynamicSelect extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.adoptedStyleSheets = [loadStyles()]
    const template = loadTemplate()
    shadowRoot.append(document.importNode(template.content, true))
    shadowRoot.addEventListener('input', event => {
      const { target } = event
      if (isSearchInputEl(target)) {
        this.searchFilter = target.value
      }
    })
    shadowRoot.addEventListener('click', event => {
      const { target } = event
      if (isSelectedValueButton(target)) {
        this.open = !this.open
      }
    })
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
    if (typeof multiple === 'boolean') {
      this.toggleAttribute('multiple', multipleBool)
    }
  }

  static get observedAttributes () {
    return ['open', 'data-filter']
  }

  get options () {
    return this.querySelectorAll('option')
  }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'open':
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
