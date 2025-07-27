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
// const searchInputEl = (dynamicSelect) => dynamicSelect.shadowRoot.getElementById('search-input')
/** @type {(element: Element) => element is HTMLInputElement} */
const isSearchInputEl = (node) => node.matches('input#search-input')

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
}
