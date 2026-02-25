import { test } from '#unit-test'
import { stringToPath, getFromStringPath } from './string-path.js'

test('stringToPath - should convert a string to a path', async ({ expect }) => {
  expect(stringToPath('')).toStrictEqual([])
  expect(stringToPath('a.b.c')).toStrictEqual(['a', 'b', 'c'])
  expect(stringToPath('a[0].b.c')).toStrictEqual(['a', '0', 'b', 'c'])
})

test('stringToPath - should handle complex paths', async ({ expect }) => {
  const actual = stringToPath('a[-1.23]["[\\"b\\"]"].c[\'[\\\'d\\\']\'][\ne\n][f].ddd fsds.g')
  expect(actual).toStrictEqual(['a', '-1.23', '["b"]', 'c', "['d']", '\ne\n', 'f', 'ddd fsds', 'g'])
})

test('stringToPath - should handle consecutive empty brackets and dots', async ({ expect }) => {
  let expected = ['', 'a']
  expect(stringToPath('.a')).toStrictEqual(expected)
  expect(stringToPath('[].a')).toStrictEqual(expected)

  expected = ['', '', 'a']

  expect(stringToPath('..a')).toStrictEqual(expected)
  expect(stringToPath('[][].a')).toStrictEqual(expected)

  expected = ['a', '', 'b']
  expect(stringToPath('a..b')).toStrictEqual(expected)
  expect(stringToPath('a[].b')).toStrictEqual(expected)

  expected = ['a', '', '', 'b']

  expect(stringToPath('a...b')).toStrictEqual(expected)
  expect(stringToPath('a[][].b')).toStrictEqual(expected)

  expected = ['a', '']

  expect(stringToPath('a.')).toStrictEqual(expected)
  expect(stringToPath('a[]')).toStrictEqual(expected)

  expected = ['a', '', '']

  expect(stringToPath('a..')).toStrictEqual(expected)
  expect(stringToPath('a[].')).toStrictEqual(expected)
})

test('stringToPath - should memoize the result', async ({ expect }) => {
  expect(stringToPath('a.b.c')).toBe(stringToPath('a.b.c'))
})

test('stringToPath - should make the result immutable', async ({ expect }) => {
  const actual = stringToPath('a.b.c')
  expect(Object.isFrozen(actual)).toBe(true)
})

test('getFromStringPath - should pass on shallow path', async ({ expect }) => {
  const data = {
    prop1: ['aa', 'bb'],
    prop2: 'lorem ipsum'
  }
  const actual = getFromStringPath(data, 'prop1')
  expect(actual).toBe(data.prop1)
})

test('getFromStringPath - should pass on deep path', async ({ expect }) => {
  const data = {
    prop1: ['aa', 'bb'],
    prop2: {
      propA: {
        banana: 2
      }
    }
  }
  const actual = getFromStringPath(data, 'prop2.propA.banana')
  expect(actual).toBe(2)
})

test('getFromStringPath - should return undefined if not found', async ({ expect }) => {
  const data = {
    prop1: ['aa', 'bb'],
    prop2: {
      propA: {
        banana: 2
      }
    }
  }
  const actual = getFromStringPath(data, 'propFail.props.tomato')
  expect(actual).toBe(undefined)
})
