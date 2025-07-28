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

/** @type {(element: Element) => element is HTMLInputElement} */
const isSearchInputEl = (node) => node.matches('input.search-input')
/** @type {(element: Element) => element is HTMLInputElement} */
const isSelectedValueButton = (node) => node.matches('button.selected-value')

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

  static get observedAttributes () {
    return ['open', 'data-filter']
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
