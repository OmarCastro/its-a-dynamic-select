import { test } from '../../../test-utils/unit/test.util.js'
import { dataLoaderOf } from './fetch-data.js'

test('dataLoaderOf - calling on the same element returns the same object', async ({ expect, dom }) => {
  const { body } = dom.document
  body.innerHTML = '<div class="test"></div>'
  const element = body.querySelector('.test')

  expect(dataLoaderOf(element)).toBe(dataLoaderOf(element))
})

test('dataLoaderOf - fetching data without any defined endpoint returns an empty result', async ({ expect, dom }) => {
  const { body } = dom.document
  body.innerHTML = '<div class="test"></div>'
  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [], hasMore: false })
})

test('dataLoaderOf - fetching data with a valid endpoint return an valid result', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  fetch.mock(/.*test/, Response.json([
    { id: 'sdsd', text: 'hello world' }
  ]))
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="/test"></div>'
  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [{ id: 'sdsd', text: 'hello world' }], hasMore: false })
})

test('dataLoaderOf - for first query, use the defined url in data-src when requesting data', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  const response = Response.json([
    { id: 'sdsd', text: 'hello world' }
  ])
  fetch.mock(/.*test/, response)
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="/test"></div>'
  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [{ id: 'sdsd', text: 'hello world' }], hasMore: false })
  expect(fetch.fetchHistory.inputHrefs).toEqual([
    'https://example.com/test'
  ])
})

test('dataLoaderOf - when query has filter, add filter as query param on when requesting data', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  const response = Response.json([
    { id: 'sdsd', text: 'hello world' }
  ])
  fetch.mock(/.*test/, response)
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="/test" data-filter="hello"></div>'
  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [{ id: 'sdsd', text: 'hello world' }], hasMore: false })
  expect(fetch.fetchHistory.inputHrefs).toEqual([
    'https://example.com/test?q=hello'
  ])
})

test('dataLoaderOf - error fetching data will propagate the error', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  fetch.mock(/.*test/, Error('example error'))
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="/test"></div>'
  const loader = dataLoaderOf(body.querySelector('.test'))

  await expect(() => loader.fetchData()).rejects.toThrow(Error('example error'))
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

test('dataLoaderOf - uses link pagination when response contains a "Link" header', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="test"></div>'
  const response1 = Response.json([{ id: '1', text: 'hello world' }])
  response1.headers.append('Link', '<https//example.com/test?cursor=test_cursor>; rel="next"')
  fetch.mock(/.*test/, response1)
  const response2 = Response.json([{ id: '2', text: 'hello werl' }])

  fetch.mock(/.*cursor=test_cursor/, response2)

  const element = body.querySelector('.test')
  const data1 = await dataLoaderOf(element).fetchData()
  const data2 = await dataLoaderOf(element).fetchNextData()
  const data3 = await dataLoaderOf(element).fetchNextData()

  expect(data1).toEqual({
    data: [{ id: '1', text: 'hello world' }],
    hasMore: true,
    navigationMode: 'link',
    href: 'https//example.com/test?cursor=test_cursor',
  })
  expect(data2).toEqual({
    data: [{ id: '2', text: 'hello werl' }],
    hasMore: false
  })
  expect(data3).toEqual({ data: [], hasMore: false })

  expect(fetch.fetchHistory.inputHrefs).toEqual([
    'https://example.com/test',
    'https//example.com/test?cursor=test_cursor'
  ])
})
