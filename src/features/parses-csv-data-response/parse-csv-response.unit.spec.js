import { test, expect } from '#unit-test'
import { parseCSVResponse } from './parse-csv-response.js'

test('parseCSVResponse - throws Error if input is not an CSV response', async () => {
  const examples = [null, undefined, Response.json({})]
  for (const input of examples) {
    await expect(() => parseCSVResponse(input)).rejects.toThrow(Error('Not an CSV response'))
  }
})

test('parseCSVResponse - return a parsed response with no navigation', async () => {
  const csvText = `value,text
1,hello world
2,test 1`
  const response = new Response(csvText, {
    headers: new Headers({
      'Content-Type': 'text/csv',
    })
  })

  await expect(parseCSVResponse(response)).resolves.toEqual({
    data: [
      { value: '1', text: 'hello world' },
      { value: '2', text: 'test 1' },
    ],
    hasMore: false,
  })
})

test('parseCSVResponse - return a parsed response with link navigation', async () => {
  const csvText = `value,text
1,hello world
2,test 1`
  const response = new Response(csvText, {
    headers: new Headers({
      'Content-Type': 'text/csv',
      Link: '<https//example.com/test?cursor=test_cursor>; rel="next"',
    })
  })

  await expect(parseCSVResponse(response)).resolves.toEqual({
    data: [
      { value: '1', text: 'hello world' },
      { value: '2', text: 'test 1' },
    ],
    hasMore: true,
    navigationMode: 'link',
    href: 'https//example.com/test?cursor=test_cursor',
  })
})

test('parseCSVResponse - return a parsed response with "after value" navigation', async () => {
  const csvText = `value,text
1,hello world
2,test 1`
  const response = new Response(csvText, {
    headers: new Headers({
      'Content-Type': 'text/csv',
      'Has-More': true
    })
  })

  await expect(parseCSVResponse(response)).resolves.toEqual({
    data: [
      { value: '1', text: 'hello world' },
      { value: '2', text: 'test 1' },
    ],
    hasMore: true,
    navigationMode: 'after_value',
  })
})
