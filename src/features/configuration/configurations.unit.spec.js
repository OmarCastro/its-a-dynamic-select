import { test } from '../../../test-utils/unit/test.util.js'
import { configurationOf, defaultValues } from './configuration.js'

test('configurationOf - configurations have default values', ({ expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <dynamic-select class="target"></dynamic-select>
  `
  const elem = document.body.querySelector('.target')

  expect(configurationOf(elem).minQueryLength).toBe(defaultValues.minQueryLength)
  expect(configurationOf(elem).debounceQueryDuration).toBe(defaultValues.debounceQueryDuration)
})

test('configurationOf - has valid data-min-query-length defined in component', ({ expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <dynamic-select data-min-query-length="5" class="target"></dynamic-select>
  `
  const elem = document.body.querySelector('.target')

  expect(configurationOf(elem).minQueryLength).toBe(5)
  expect(configurationOf(elem).debounceQueryDuration).toBe(defaultValues.debounceQueryDuration)
})

test('configurationOf - has invalid data-min-query-length defined in component', ({ expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <dynamic-select data-min-query-length="-1" class="target1"></dynamic-select>
    <dynamic-select data-min-query-length="hello" class="target2"></dynamic-select>
    <dynamic-select data-min-query-length="1.2" class="target3"></dynamic-select>
  `
  const elem1 = document.body.querySelector('.target1')
  const elem2 = document.body.querySelector('.target2')
  const elem3 = document.body.querySelector('.target3')

  expect(configurationOf(elem1).minQueryLength).toBe(defaultValues.minQueryLength)
  expect(configurationOf(elem2).minQueryLength).toBe(defaultValues.minQueryLength)
  expect(configurationOf(elem3).minQueryLength).toBe(defaultValues.minQueryLength)
})
