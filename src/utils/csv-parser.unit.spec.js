import { test } from '../../test-utils/unit/test.util.js'
import { parseCSV } from './csv-parser.js'

test('parseCSV - parses strings', ({ expect }) => {
  const result = parseCSV('name,age\nJohn,30\nJane,25')
  expect([...result]).toEqual([{
    name: 'John',
    age: '30'
  }, {
    name: 'Jane',
    age: '25'
  }])
})

test('parseCSV - parses array of lines', ({ expect }) => {
  const lines = ['name,age\n', 'Josh,31\n', 'Jeanne,28']
  const result = parseCSV(lines)
  expect([...result]).toEqual([{
    name: 'Josh',
    age: '31'
  }, {
    name: 'Jeanne',
    age: '28'
  }])
})

test('parseCSV - parses CSV from async string iterables', async ({ expect }) => {
  async function * chunks () {
    yield 'name,age,job\nJo'
    yield 'hn,50,medic\nMa'
    yield 'ria,39,nurse\n'
  }
  const result = parseCSV(chunks())
  expect(await Array.fromAsync(result)).toEqual([{
    name: 'John',
    age: '50',
    job: 'medic',
  }, {
    name: 'Maria',
    age: '39',
    job: 'nurse'
  }])
})

test('parseCSV - throw error on invalid type', async ({ expect }) => {
  expect(() => parseCSV(123)).toThrow(TypeError('Input must be a string, Iterable, or AsyncIterable'))
})

test('parseCSV - trims lines', async ({ expect }) => {
  const result = parseCSV('name,age\n\n\nJohn,30\n  \nJane,25')
  expect([...result]).toEqual([{
    name: 'John',
    age: '30'
  }, {
    name: 'Jane',
    age: '25'
  }])
})

test('parseCSV - trims lines, async version', async ({ expect }) => {
  async function * chunks () {
    yield 'name,age\n\n'
    yield '\nJohn'
    yield ',30\n  \nJane,25'
  }

  const result = parseCSV(chunks())
  expect(await Array.fromAsync(result)).toEqual([{
    name: 'John',
    age: '30'
  }, {
    name: 'Jane',
    age: '25'
  }])
})

test('parseCSV - escapes double quote lines', async ({ expect }) => {
  const result = parseCSV('name,age,quote\n\n\nJohn,30,"I love dogs"\n  \nJane,25,"there are temporary and ""temporary"" solutions"')
  expect([...result]).toEqual([{
    name: 'John',
    age: '30',
    quote: 'I love dogs',

  }, {
    name: 'Jane',
    age: '25',
    quote: 'there are temporary and "temporary" solutions',

  }])
})
