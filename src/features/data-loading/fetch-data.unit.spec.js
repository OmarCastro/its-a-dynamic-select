import { test } from '../../../test-utils/unit/test.util.js'
import { dataLoaderOf } from './fetch-data.js'

test('dataLoaderOf - without any defined endpoint return an empty result', async ({ expect, dom }) => {
  const { document } = dom
  const { body } = document
  body.innerHTML = `
    <div class="test">
    </div>
  `

  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  expect(data).toEqual({ data: [], hasMore: false })
})

test('dataLoaderOf - without a endpoint return an valid result', async ({ expect, dom, fetch }) => {
  const oldFetch = globalThis.fetch
  const { document } = dom
  const { body } = document
  body.innerHTML = `
    <div class="test" data-src="/test">
    </div>
  `

  fetch.mock(/.*test/, Response.json([
    { id: 'sdsd', text: 'sss' }
  ]))

  const element = body.querySelector('.test')

  const data = await dataLoaderOf(element).fetchData()

  globalThis.fetch = oldFetch

  expect(data).toEqual({ data: [{ id: 'sdsd', text: 'sss' }], hasMore: false })
})
