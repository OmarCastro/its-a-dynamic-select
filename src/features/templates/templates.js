import { computeOnce } from '../../utils/memoization'
import defaultTemplatesHtml from './default-select-templates.inline.html'

/**
 * @typedef {object} MutableTemplates
 * @property {HTMLTemplateElement} option - option template in the dropdown and button
 * @property {HTMLTemplateElement} singleSelectInput - single select button template
 * @property {HTMLTemplateElement} multiSelectInput - multi select button template
 */

/**
 * @typedef {Readonly<MutableTemplates>} Templates
 */

/**
 * @returns {Templates} default templates to use as fallback
 */
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

  const templates = Object.freeze({
    option: query('option'),
    singleSelectInput: query('single-select-input'),
    multiSelectInput: query('multi-select-input'),
  })
  return templates
})

/**
 * @param {HTMLElement} element - target element
 * @returns {Templates} templates object of `element`
 */
export function templatesOf (element) {
  return {
    get option () {
      const scopedTemplate = element.querySelector(':scope > template[data-for="option"]')
      if (scopedTemplate) return scopedTemplate
      return loadSelectDefaultTemplates().option
    },
    get singleSelectInput () {
      return loadSelectDefaultTemplates().singleSelectInput
    },
    get multiSelectInput () {
      return loadSelectDefaultTemplates().multiSelectInput
    }
  }
}
