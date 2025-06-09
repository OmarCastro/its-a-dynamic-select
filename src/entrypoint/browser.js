import { DynamicSelect as Element } from '../web-component/dynamic-select.element.js'
const url = new URL(import.meta.url)
const tagName = url.searchParams.get('named')?.trim()
tagName && customElements.define(tagName, Element)
export const DynamicSelect = Element
export default DynamicSelect
