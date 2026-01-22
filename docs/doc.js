// docs/doc.js
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('pre code').forEach((el) => {
    const html = el.innerHTML
    const lines = html.split('\n')
    const minSpaces = lines.filter((line) => line.trim() !== '').reduce((acc, line) => Math.min(line.search(/\S|$/), acc), Infinity)
    el.innerHTML = lines.map((line) => line.slice(minSpaces)).join('\n').trim()
  })
})

document.querySelectorAll('.example').forEach(element => {
  const exampleObj = {}

  console.log('.example %o', element)

  element.querySelectorAll('.example__json .editor').forEach(element => {
    const lang = element.getAttribute('data-lang')
    if (!lang) { return }
    exampleObj[lang] = JSON.parse(element.textContent || '')
  })

  element.addEventListener('input', handleInput.bind(null, element))
})

/** @param {EventTarget} target - target element */
const matchesTextEdit = (target) => target.matches('.text-edit')

const BIND_SELECTOR_ATTRIBUTE = 'data-bind-selector'
const ELEMENT_TAG_NAME = 'image-comparison'

/**
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 */
function handleInput (exampleElement, event) {
  const { target } = event
  if (matchesTextEdit(target)) {
    const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || ELEMENT_TAG_NAME
    const node = exampleElement.querySelector(selector)
    if (node) { node.textContent = event.target.textContent }
  } else if (target.matches('.example-attribute-edit')) {
    const attribute = target.getAttribute('data-attribute').trim()
    reflectAttributeOnElement(exampleElement, event, attribute)
  } else if (target.matches('.example-style-edit')) {
    const cssProperty = target.getAttribute('data-style').trim()
    reflectStyleOnElement(exampleElement, event, cssProperty)
  }
}

/**
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 * @param {string} attribute - reflecting attribute
 */
function reflectAttributeOnElement (exampleElement, event, attribute) {
  const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || ELEMENT_TAG_NAME
  const node = exampleElement.querySelector(selector)
  node && node.setAttribute(attribute, event.target.textContent)
}

/**
 *
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 * @param {string} styleProperty - reflecting css property
 */
function reflectStyleOnElement (exampleElement, event, styleProperty) {
  const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || ELEMENT_TAG_NAME
  const node = exampleElement.querySelector(selector)
  node && node.style.setProperty(styleProperty, event.target.textContent)
}

/**
 * @param {Event} event - 'input' event object
 */
function reactElementNameChange (event) {
  const componentName = event.target.closest('.component-name-edit')
  if (componentName == null) { return }
  const newText = componentName.textContent
  document.body.querySelectorAll('.component-name-edit').forEach(ref => { if (componentName !== ref) ref.textContent = newText })
  document.body.querySelectorAll('.component-name-ref').forEach(ref => { ref.textContent = newText })
}

document.body.addEventListener('input', (event) => { reactElementNameChange(event) })

document.body.addEventListener('datafetch', (event) => {
  if (event.target?.matches('[data-src="example-src-1"]')) {
    event.detail.respondWith([{
      value: '1',
      text: 'option 1'
    }, {
      value: '2',
      text: 'option 2'
    }])
    return
  }

  if (event.target?.matches('[data-src="example-src-2"]')) {
    const response = new Response(`value,text
1,option 1
2,option 2
3,option 3
`)
    response.headers.set('content-type', 'text/csv')
    event.detail.respondWith(response)
    return
  }

  if (event.target?.matches('[data-src="example-src-3"]')) {
    const response = Response.json([
      { value: '1', text: 'json option 1' },
      { value: '2', text: 'json option 2' },
      { value: '3', text: 'json option 3' },
      { value: '4', text: 'json option 4' }
    ])
    event.detail.respondWith(response)
  }
})
