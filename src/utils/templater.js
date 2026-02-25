import { getFromStringPath } from './string-path.js'

/**
 * @param {unknown} value - value to normalize
 * @returns {string} normalized value
 */
function normalizeValue (value) {
  return value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
}

/**
 * Auxiliary method of `applyTemplate`, applies the template on the current element
 *
 * @param {Element} currentElement - target element
 * @param {Record<string, unknown>} currentData - data to apply
 */
function applyTemplateAux (currentElement, currentData) {
  switch (currentElement.tagName) {
    case 'SLOT': {
      const name = currentElement.getAttribute('name') ?? ''
      if (name.startsWith('$.')) {
        currentElement.removeAttribute('name')
        const content = normalizeValue(getFromStringPath(currentData, name.slice(2)))
        const parent = currentElement.parentNode
        currentElement.replaceWith(content)
        parent?.normalize()
      }
      break
    }
    case 'TEMPLATE': {
      const loopPath = currentElement.getAttribute('data-each') ?? ''
      if (loopPath.startsWith('$.')) {
        const data = getFromStringPath(currentData, loopPath.slice(2))
        if (Array.isArray(data)) {
          const newContent = data.map(newData => applyTemplate(/** @type {HTMLTemplateElement} */ (currentElement), newData))
          currentElement.replaceWith(...newContent)
          return
        }
      }
    }
  }
  for (const { name, value } of currentElement.attributes) {
    if (value.startsWith('$.')) {
      const newValue = normalizeValue(getFromStringPath(currentData, value.slice(2)))
      currentElement.setAttribute(name, newValue)
    } else if (value.startsWith('$?.')) {
      const newValue = !!getFromStringPath(currentData, value.slice(3))
      if (newValue) {
        currentElement.setAttribute(name, '')
      } else {
        currentElement.removeAttribute(name)
      }
    } else if (value.startsWith('$$')) {
      currentElement.setAttribute(name, value.slice(1))
    }
  }

  for (const child of currentElement.children) {
    applyTemplateAux(child, currentData)
  }
}

/**
 * Trims document fragment of whitespace characters of text nodes
 * from the beginning and end of the document fragment
 * @param {DocumentFragment} documentFragment - target document fragment
 */
function trimDocumentFragment(documentFragment){
  const {lastChild, firstChild} = documentFragment
  if(lastChild?.nodeType === document.TEXT_NODE){
    const trimmedText = lastChild.nodeValue?.trimEnd() ?? ''
    if(trimmedText){
      lastChild.textContent = trimmedText
    } else {
      lastChild.remove()
    }
  }
  if(firstChild?.nodeType === document.TEXT_NODE){
    const trimmedText = firstChild.nodeValue?.trimStart() ?? ''
    if(trimmedText){
      firstChild.textContent = trimmedText
    } else {
      firstChild.remove()
    }
  }
}

/**
 * Create a DOM tree based on the structure in <template>
 * and the data sent to generate it
 *
 * @param {HTMLTemplateElement} template - template source
 * @param {Record<string, unknown>} data - data to apply
 * @returns {DocumentFragment} Create document fragment
 */
export function applyTemplate (template, data) {
  const clone = /** @type {DocumentFragment} */(template.content.cloneNode(true))
  for (const child of [...clone.children]) {
    applyTemplateAux(child, data)
  }
  trimDocumentFragment(clone)
  return clone
}
