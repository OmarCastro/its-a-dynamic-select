import { getFromStringPath } from './string-path'

/**
 * Converts `string` to a property path array.
 *
 * @param {Element} currentElement The string to convert.
 * @param {Record<string, any>} currentData The string to convert.
 */
function applyTemplateAux (currentElement, currentData) {
  switch (currentElement.tagName) {
    case 'SLOT': {
      const name = currentElement.getAttribute('name') ?? ''
      if (name.startsWith('$.')) {
        currentElement.removeAttribute('name')
        const content = String(getFromStringPath(currentData, name.slice(2)))
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
      const newValue = String(getFromStringPath(currentData, value.slice(2)))
      currentElement.setAttribute(name, newValue)
    } else if (value.startsWith('$$')) {
      currentElement.setAttribute(name, value.slice(1))
    }
  }

  for (const child of currentElement.children) {
    applyTemplateAux(child, currentData)
  }
}

/**
 * Converts `string` to a property path array.
 *
 * @param {HTMLTemplateElement} template The string to convert.
 * @param {Record<string, any>} data The string to convert.
 * @returns {DocumentFragment} Returns the property path array.
 */
export function applyTemplate (template, data) {
  const clone = /** @type {DocumentFragment} */(template.content.cloneNode(true))
  for (const child of clone.children) {
    applyTemplateAux(child, data)
  }

  return clone
}
