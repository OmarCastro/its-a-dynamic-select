import { test } from '../../test-utils/unit/test.util.js'
import { linkHeaderOf, toTextStream, parseHasMoreHeader } from './response.js'

test('linkHeaderOf - returns parsed header from string', ({ expect }) => {
  const linkHeaderContent = '<https://api.example.com/issues?page=2>; param1="val1", <https://api.example.com/issues?page=4>, <https://api.example.com/issues?page=10> ;param2="val2", <https://api.example.com/issues?page=1>; rel="first"'

  const entries = [
    { params: { param1: 'val1' }, url: 'https://api.example.com/issues?page=2' },
    { params: { }, url: 'https://api.example.com/issues?page=4' },
    { params: { param2: 'val2' }, url: 'https://api.example.com/issues?page=10' },
    { params: { rel: 'first' }, url: 'https://api.example.com/issues?page=1' }
  ]
  expect(linkHeaderOf(linkHeaderContent)).toEqual({
    byRel: {
      first: [entries[3]],
    },
    entries
  })
})

test('linkHeaderOf - adds to byRel if contains "rel" param', ({ expect }) => {
  const linkHeaderContent = '<https://api.example.com/issues?page=2>; rel="prev"; param1="val1", <https://api.example.com/issues?page=4>; rel="next", <https://api.example.com/issues?page=10>; rel="last";param2="val2", <https://api.example.com/issues?page=1>; rel="first"'

  const entries = [
    { params: { rel: 'prev', param1: 'val1' }, url: 'https://api.example.com/issues?page=2' },
    { params: { rel: 'next' }, url: 'https://api.example.com/issues?page=4' },
    { params: { rel: 'last', param2: 'val2' }, url: 'https://api.example.com/issues?page=10' },
    { params: { rel: 'first' }, url: 'https://api.example.com/issues?page=1' }
  ]
  expect(linkHeaderOf(linkHeaderContent)).toEqual({
    byRel: {
      prev: [entries[0]],
      next: [entries[1]],
      first: [entries[3]],
      last: [entries[2]],
    },
    entries
  })
})

test('linkHeaderOf - returns parsed header from Response', ({ expect }) => {
  const linkHeaderContent = '<https://api.example.com/issues?page=2>; rel="prev"; param1="val1", <https://api.example.com/issues?page=4>; rel="next", <https://api.example.com/issues?page=10>; rel="last";param2="val2", <https://api.example.com/issues?page=1>; rel="first"'
  const response = Response.json([
    { id: 'id1', text: 'hello' },
    { id: 'id2', text: 'world' },
  ])
  response.headers.append('Link', linkHeaderContent)
  const entries = [
    { params: { rel: 'prev', param1: 'val1' }, url: 'https://api.example.com/issues?page=2' },
    { params: { rel: 'next' }, url: 'https://api.example.com/issues?page=4' },
    { params: { rel: 'last', param2: 'val2' }, url: 'https://api.example.com/issues?page=10' },
    { params: { rel: 'first' }, url: 'https://api.example.com/issues?page=1' }
  ]
  expect(linkHeaderOf(response)).toEqual({
    byRel: {
      prev: [entries[0]],
      next: [entries[1]],
      first: [entries[3]],
      last: [entries[2]],
    },
    entries
  })
})

test('linkHeaderOf - returns empty header if invalid', ({ expect }) => {
  const emptyHeader = {
    byRel: {},
    entries: []
  }
  expect(linkHeaderOf('  ')).toEqual(emptyHeader)
  expect(linkHeaderOf(null)).toEqual(emptyHeader)
  expect(linkHeaderOf({})).toEqual(emptyHeader)
})

test('toTextStream - returns string value', async ({ expect }) => {
  const obj = [
    { id: 'id1', text: 'hello' },
    { id: 'id2', text: 'world' },
  ]
  const response = Response.json(obj)
  const result = (await Array.fromAsync(toTextStream(response))).join('')

  expect(result).toEqual(JSON.stringify(obj))
})

test('toTextStream - returns empty if no body', async ({ expect }) => {
  const response = new Response()
  const result = await Array.fromAsync(toTextStream(response))

  expect(result).toEqual([])
})

test('parseHasMoreHeader - returns false if no "has-more" header is defined', async ({ expect }) => {
  const response = new Response()
  const result = parseHasMoreHeader(response)
  expect(result).toBe(false)
})

test('parseHasMoreHeader - returns false if no "has-more" header is invalid', async ({ expect }) => {
  const response = new Response()
  response.headers.set('has-more', 'fdsfsdf')
  const result = parseHasMoreHeader(response)
  expect(result).toBe(false)
})

test('parseHasMoreHeader - returns false if no "has-more" header is false', async ({ expect }) => {
  const response = new Response()
  response.headers.set('has-more', 'false')
  const result = parseHasMoreHeader(response)
  expect(result).toBe(false)
})

test('parseHasMoreHeader - returns true if no "has-more" header is true', async ({ expect }) => {
  const response = new Response()
  response.headers.set('has-more', 'true')
  const result = parseHasMoreHeader(response)
  expect(result).toBe(true)
})

test('parseHasMoreHeader - header and value are case-insensitive', async ({ expect }) => {
  const response = new Response()
  response.headers.set('HaS-More', 'TruE')
  const result = parseHasMoreHeader(response)
  expect(result).toBe(true)
})

test('parseHasMoreHeader - uses "X-has-more" as fallback', async ({ expect }) => {
  const response1 = new Response()
  response1.headers.set('X-HaS-More', 'TruE')

  const response2 = new Response()
  response2.headers.set('X-HaS-More', 'TruE')
  response2.headers.set('has-more', 'false')

  const response3 = new Response()
  response3.headers.set('X-HaS-More', 'TruE')
  response3.headers.set('has-more', 'faddasd')

  expect(parseHasMoreHeader(response1)).toBe(true)
  expect(parseHasMoreHeader(response2)).toBe(false)
  expect(parseHasMoreHeader(response3)).toBe(false) // ignore falback header even if it is invalid
})
