/**
 * Traverse up in the document DOM closest element by passing shadow DOM
 * @param {Element} targetElement - first element to yield from the generator
 * @yields {Element} one element for each subsequent ancestor
 */
export function * traverseUpDom (targetElement) {
  let el = targetElement
  while (el != null) {
    yield el
    const { parentNode, parentElement } = el
    if (parentNode instanceof ShadowRoot) {
      el = parentNode.host
      continue
    }
    if (parentNode instanceof Document || parentElement == null) {
      return
    }
    el = parentElement
  }
}
