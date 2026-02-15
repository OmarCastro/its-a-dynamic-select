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
    new URL('/test', dom.location.href).href,
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
    new URL('/test?q=hello', dom.location.href).href,
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

test('dataLoaderOf - uses link pagination when json array response contains a "Link" header with "next" rel', async ({ expect, dom, fetch }) => {
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
    new URL('test', dom.location.href).href,
    'https//example.com/test?cursor=test_cursor'
  ])
})

test('dataLoaderOf - uses link pagination when csv response contains a "Link" header with "next" rel', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="test"></div>'
  const response1 = new Response(
`value,text
1,hello world
2,test 1`, {
  headers: new Headers({
    'Content-Type': 'text/csv',
    Link: '<https//example.com/test?cursor=test_cursor>; rel="next"',
  })
}
  )
  fetch.mock(/.*test/, response1)

  const response2 = new Response(
`value,text
3,lorem ipsum
4,test 2`, {
  headers: new Headers({
    'Content-Type': 'text/csv',
  })
})
  fetch.mock(/.*cursor=test_cursor/, response2)

  const element = body.querySelector('.test')
  const data1 = await dataLoaderOf(element).fetchData()
  const data2 = await dataLoaderOf(element).fetchNextData()
  const data3 = await dataLoaderOf(element).fetchNextData()

  expect(data1).toEqual({
    data: [
      { value: '1', text: 'hello world' },
      { value: '2', text: 'test 1' },
    ],
    hasMore: true,
    navigationMode: 'link',
    href: 'https//example.com/test?cursor=test_cursor',
  })
  expect(data2).toEqual({
    data: [
      { value: '3', text: 'lorem ipsum' },
      { value: '4', text: 'test 2' },
    ],
    hasMore: false
  })
  expect(data3).toEqual({ data: [], hasMore: false })

  expect(fetch.fetchHistory.inputHrefs).toEqual([
    new URL('test', dom.location.href).href,
    'https//example.com/test?cursor=test_cursor'
  ])
})

test('dataLoaderOf - uses link pagination when response object contains a "links" property with next field', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="test"></div>'
  const response1 = Response.json({
    links: {
      next: 'https//example.com/test?cursor=test_cursor'
    },
    records: [{ id: '1', text: 'hello world' }]
  })
  fetch.mock(/.*test/, response1)
  const response2 = Response.json({
    links: {
      next: null
    },
    records: [{ id: '2', text: 'hello werl' }]
  })

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
    new URL('test', dom.location.href).href,
    'https//example.com/test?cursor=test_cursor'
  ])
})

test('dataLoaderOf - uses "after value" pagination when response contains an "Has-More: true" header', async ({ expect, dom, fetch }) => {
  fetch.throwErrorOnNonMockedRequests()
  const { body } = dom.document
  body.innerHTML = '<div class="test" data-src="test"></div>'
  const response1 = Response.json([{ value: '1', text: 'hello world' }])
  response1.headers.append('Has-More', 'true')
  fetch.mock(/.*test/, response1)
  const response2 = Response.json([{ value: '2', text: 'hello werl' }])
  response2.headers.append('Has-More', 'false')
  fetch.mock(/.*after=1/, response2)

  const expectedData1 = {
    data: [{ value: '1', text: 'hello world' }],
    hasMore: true,
    navigationMode: 'after_value',
  }

  const expectedData2 = {
    data: [{ value: '2', text: 'hello werl' }],
    hasMore: false
  }

  const expectedData3 = {
    data: [],
    hasMore: false
  }

  const expectedFetchUrls = [
    new URL('test', dom.location.href).href,
    new URL('test?after=1', dom.location.href).href,
  ]

  const element = body.querySelector('.test')
  const data1 = await dataLoaderOf(element).fetchData()
  const data2 = await dataLoaderOf(element).fetchNextData()
  const data3 = await dataLoaderOf(element).fetchNextData()

  expect({ data1, data2, data3, fetchUrls: fetch.fetchHistory.inputHrefs }).toEqual({
    data1: expectedData1,
    data2: expectedData2,
    data3: expectedData3,
    fetchUrls: expectedFetchUrls
  })
})
