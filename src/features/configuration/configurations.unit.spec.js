import { test } from '../../../test-utils/unit/test.util.js'
import { configurationOf } from './configuration.js'

test('configurationOf - configurations have default values', ({ step, expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <dynamic-select class="target"></dynamic-select>
  `
  const elem = document.body.querySelector('.target')

  expect(configurationOf(elem).minQueryLength).toBe(3)
  expect(configurationOf(elem).debounceQueryDuration).toBe(250)
})
