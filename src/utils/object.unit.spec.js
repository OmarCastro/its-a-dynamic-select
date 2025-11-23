import { test } from '../../test-utils/unit/test.util.js'
import { isPlainObject } from './object.js'

test('isPlainObject - returns true for a simple object literal', ({ expect }) => {
  expect(isPlainObject({})).toBe(true)
  expect(isPlainObject({ a: 1, b: 2 })).toBe(true)
})

test('isPlainObject - returns true for objects created with Object.create(null)', ({ expect }) => {
  const obj = Object.create(null)
  obj.x = 42
  expect(isPlainObject(obj)).toBe(true)
})

test('isPlainObject - returns false for arrays', ({ expect }) => {
  expect(isPlainObject([])).toBe(false)
  expect(isPlainObject([1, 2, 3])).toBe(false)
})

test('isPlainObject - returns false for functions', ({ expect }) => {
  expect(isPlainObject(function () {})).toBe(false)
  expect(isPlainObject(() => {})).toBe(false)
})

test('isPlainObject - returns false for null and undefined', ({ expect }) => {
  expect(isPlainObject(null)).toBe(false)
  expect(isPlainObject(undefined)).toBe(false)
  expect(isPlainObject()).toBe(false)
})

test('isPlainObject - returns false for primitives', ({ expect }) => {
  expect(isPlainObject(123)).toBe(false)
  expect(isPlainObject('hello')).toBe(false)
  expect(isPlainObject(true)).toBe(false)
  // eslint-disable-next-line symbol-description
  expect(isPlainObject(Symbol())).toBe(false)
})

test('isPlainObject - returns false for Date objects', ({ expect }) => {
  expect(isPlainObject(new Date())).toBe(false)
})

test('isPlainObject - returns false for RegExp objects', ({ expect }) => {
  expect(isPlainObject(/abc/)).toBe(false)
})

test('isPlainObject - returns false for Map and Set', ({ expect }) => {
  expect(isPlainObject(new Map())).toBe(false)
  expect(isPlainObject(new Set())).toBe(false)
})

test('isPlainObject - returns false for class instances', ({ expect }) => {
  class Foo {}
  expect(isPlainObject(new Foo())).toBe(false)
})

test('isPlainObject - returns true for objects created with new Object()', ({ expect }) => {
  // eslint-disable-next-line no-object-constructor
  expect(isPlainObject(new Object())).toBe(true)
})

test('isPlainObject - returns false for objects with modified [[Prototype]] not equal to Object.prototype', ({ expect }) => {
  const proto = { custom: true }
  const obj = Object.create(proto)
  expect(isPlainObject(obj)).toBe(false)
})

test('returns true for objects with no prototype only if allowed by implementation', ({ expect }) => {
  const obj = Object.create(null)
  expect(isPlainObject(obj)).toBe(true)
})

test('returns false for Error objects', ({ expect }) => {
  expect(isPlainObject(new Error('oops'))).toBe(false)
})
