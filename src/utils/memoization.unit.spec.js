import { test } from '../../test-utils/unit/test.util.js'
import { computeOnce } from './memoization.js'

test('computeOnce - computes only once', async ({ expect }) => {
  let val = 0
  const incVal = () => ++val
  const memoized = computeOnce(incVal)

  const result1 = memoized()
  const result2 = memoized()
  expect(result1).toBe(1)
  expect(result2).toBe(1)
  expect(val).toBe(1)
})

test('computeOnce - computes only once even with null values', async ({ expect }) => {
  let val = 0
  const incVal = () => { ++val }
  const memoized = computeOnce(incVal)

  const result1 = memoized()
  const result2 = memoized()
  expect(result1).toBe(undefined)
  expect(result2).toBe(undefined)
  expect(val).toBe(1)
})
