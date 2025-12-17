import { test } from '../../../test-utils/unit/test.util.js'
import { dataLoaderOf } from './fetch-data.js'

test('dataLoaderOf - calling on the same element returns the same object', async ({ expect, dom }) => {
  const { body } = dom.document
  body.innerHTML = '<div class="test"></div>'
  const element = body.querySelector('.test')

  expect(dataLoaderOf(element)).toBe(dataLoaderOf(element))
})

test('dataLoaderOf - without any defined endpoint return an empty result', async ({ expect, dom }) => {
  const { body } = dom.document
  body.innerHTML = '<div class="test"></div>'
  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [], hasMore: false })
})

test('dataLoaderOf - without a endpoint return an valid result', async ({ expect, dom, fetch }) => {
  fetch.mock(/.*test/, Response.json([
    { id: 'sdsd', text: 'sss' }
  ]))
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="/test"></div>'
  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [{ id: 'sdsd', text: 'sss' }], hasMore: false })
})

test('dataLoaderOf - fetching next data when hasMore is false returns an empty result', async ({ expect, dom }) => {
  const { body } = dom.document
  body.innerHTML = '<div class="test"></div>'

  const element = body.querySelector('.test')

  const data1 = await dataLoaderOf(element).fetchData()
  const data2 = await dataLoaderOf(element).fetchNextData()

  expect(data1).toEqual({ data: [], hasMore: false })
  expect(data2).toEqual({ data: [], hasMore: false })
})
