import { test } from '../../test-utils/unit/test.util.js'
import { IterableWeakMap, IterableWeakSet } from './iterable-weak-struct.js'

test('IterableWeakMap - iterates over entries', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { hello: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  expect([...map.entries()]).toEqual([[key1, 'test value'], [key2, 'test value 2']])
})

test('IterableWeakSet - iterates over entries', ({ expect }) => {
  const set = new IterableWeakSet()
  const key1 = { hello: 'world' }
  const key2 = { lorem: 'ipsum' }
  set.add(key1)
  set.add(key2)
  expect([...set.entries()]).toEqual([key1, key2])
})

test('IterableWeakMap - iterates over keys', ({ expect }) => {
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  const map = new IterableWeakMap([
    [key1, 'test value'],
    [key2, 'test value 2']
  ])
  expect([...map.keys()]).toEqual([key1, key2])
})

test('IterableWeakSet - iterates over keys, being the same as values', ({ expect }) => {
  const key1 = { hello: 'world' }
  const key2 = { lorem: 'ipsum' }
  const set = new IterableWeakSet([key1, key2])
  expect([...set.keys()]).toEqual([key1, key2])
})

test('IterableWeakMap - iterates over values', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  expect([...map.values()]).toEqual(['test value', 'test value 2'])
})

test('IterableWeakSet - iterates over values', ({ expect }) => {
  const set = new IterableWeakSet()
  const entry1 = { hello: 'world' }
  const entry2 = { lorem: 'ipsum' }
  set.add(entry1)
  set.add(entry2)
  expect([...set.values()]).toEqual([entry1, entry2])
})

test('IterableWeakMap - iterates with for...of', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  const result = []
  for (const entry of map) {
    result.push(entry)
  }
  expect(result).toEqual([[key1, 'test value'], [key2, 'test value 2']])
})

test('IterableWeakSet - iterates with for...of', ({ expect }) => {
  const set = new IterableWeakSet()
  const entry1 = { hello: 'world' }
  const entry2 = { lorem: 'ipsum' }
  set.add(entry1)
  set.add(entry2)
  const result = []
  for (const entry of set) {
    result.push(entry)
  }
  expect(result).toEqual([entry1, entry2])
})

test('IterableWeakMap - iterates with forEach', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  const result = []
  map.forEach((...args) => result.push(args))
  expect(result).toEqual([
    ['test value', key1, map],
    ['test value 2', key2, map]
  ])
})

test('IterableWeakSet - iterates with forEach', ({ expect }) => {
  const set = new IterableWeakSet()
  const entry1 = { hello: 'world' }
  const entry2 = { lorem: 'ipsum' }
  set.add(entry1)
  set.add(entry2)
  const result = []
  set.forEach((...args) => result.push(args))
  expect(result).toEqual([
    [entry1, entry1, set],
    [entry2, entry2, set]
  ])
})

test('IterableWeakMap - can set the value again', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  map.set(key1, 'test value 4')
  expect([...map.entries()]).toEqual([
    [key1, 'test value 4'],
    [key2, 'test value 2']
  ])
})

test('IterableWeakSet - adding the same entry does nothing', ({ expect }) => {
  const set = new IterableWeakSet()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  set.add(key1)
  set.add(key2)
  set.add(key1)
  expect([...set.entries()]).toEqual([key1, key2])
})

test('IterableWeakMap - can delete entries', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  map.delete(key1)
  expect([...map.entries()]).toEqual([
    [key2, 'test value 2']
  ])
})

test('IterableWeakSet - can delete entries', ({ expect }) => {
  const set = new IterableWeakSet()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  set.add(key1)
  set.add(key2)
  set.delete(key1)
  expect([...set.entries()]).toEqual([key2])
})

test('IterableWeakMap - deleting entries that does not exist does nothing', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  map.delete(null)
  expect([...map.entries()]).toEqual([
    [key1, 'test value'],
    [key2, 'test value 2']
  ])
})

test('IterableWeakSet - deleting entries that does not exist does nothing', ({ expect }) => {
  const set = new IterableWeakSet()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  set.add(key1)
  set.add(key2)
  set.delete(null)
  expect([...set.entries()]).toEqual([key1, key2])
})

test('IterableWeakMap - can clear entries', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  map.clear()
  expect([...map.entries()]).toEqual([])
})

test('IterableWeakSet - can clear entries', ({ expect }) => {
  const set = new IterableWeakSet()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  set.add(key1)
  set.add(key2)
  set.clear()
  expect([...set.entries()]).toEqual([])
})

test('IterableWeakMap - get key value', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  expect(map.get(key1)).toEqual('test value')
  expect(map.get('not in map')).toEqual(undefined)
})

test('IterableWeakMap - has entry with key', ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  expect(map.has(key1)).toBe(true)
  expect(map.has('not in map')).toBe(false)
})

test('IterableWeakSet - has entry', ({ expect }) => {
  const set = new IterableWeakSet()
  const key1 = { test: 'world' }
  const key2 = { lorem: 'ipsum' }
  set.add(key1)
  set.add(key2)
  expect(set.has(key1)).toBe(true)
  expect(set.has('not in map')).toBe(false)
})

const isNode = globalThis.process?.versions?.node != null
if (isNode) {
  test('IterableWeakMap - cleans up garbage collected entries', async ({ expect, gc }) => {
    const map = new IterableWeakMap()

    let key1 = { hello: 'world' }
    const key2 = { lorem: 'ipsum' }
    let key3 = { banana: 'land' }

    map.set(key1, 'test value')
    map.set(key2, 'test value 2')
    map.set(key3, 'test value 3')

    // compare to copies of the keys as they are going to be saved for test reporting,
    // preventing them from being CG
    expect([...map.entries()]).toEqual([
      [{ ...key1 }, 'test value'],
      [{ ...key2 }, 'test value 2'],
      [{ ...key3 }, 'test value 3'],
    ])
    expect([...map.keys()]).toEqual([{ ...key1 }, { ...key2 }, { ...key3 }])
    expect([...map.values()]).toEqual(['test value', 'test value 2', 'test value 3'])

    // removes key1 & key3, making its previous value ready to be CG
    key1 = undefined
    key3 = undefined

    await gc({ execution: 'async', type: 'major' })
    expect([...map.entries()]).toEqual([[key2, 'test value 2']])
    expect([...map.keys()]).toEqual([key2])
    expect([...map.values()]).toEqual(['test value 2'])
  })

  test('IterableWeakSet - cleans up garbage collected entries', async ({ expect, gc }) => {
    const set = new IterableWeakSet()

    let key1 = { hello: 'world' }
    const key2 = { lorem: 'ipsum' }
    let key3 = { banana: 'land' }

    set.add(key1)
    set.add(key2)
    set.add(key3)

    // compare to copies of the keys as they are going to be saved for test reporting,
    // preventing them from being CG
    expect([...set.entries()]).toEqual([{ ...key1 }, { ...key2 }, { ...key3 }])
    expect([...set.keys()]).toEqual([{ ...key1 }, { ...key2 }, { ...key3 }])
    expect([...set.values()]).toEqual([{ ...key1 }, { ...key2 }, { ...key3 }])

    // removes key1 & key3, making its previous value ready to be CG
    key1 = undefined
    key3 = undefined

    await gc({ execution: 'async', type: 'major' })

    expect([...set.entries()]).toEqual([key2])
    expect([...set.keys()]).toEqual([key2])
    expect([...set.values()]).toEqual([key2])
  })

  test('IterableWeakMap - size property updates on garbage collection', async ({ expect, gc }) => {
    const map = new IterableWeakMap()

    let key1 = { hello: 'world' }
    const key2 = { lorem: 'ipsum' }
    let key3 = { banana: 'land' }

    map.set(key1, 'test value')
    map.set(key2, 'test value 2')
    map.set(key3, 'test value 3')

    expect(map.size).toBe(3)

    // removes key1 & key3, making its previous value ready to be CG
    key1 = undefined
    key3 = undefined

    await gc({ execution: 'async', type: 'major' })
    expect(map.size).toBe(1)
  })

  test('IterableWeakSet - size property updates on garbage collection', async ({ expect, gc }) => {
    const set = new IterableWeakSet()

    let key1 = { hello: 'world' }
    const key2 = { lorem: 'ipsum' }
    let key3 = { banana: 'land' }

    set.add(key1)
    set.add(key2)
    set.add(key3)

    expect(set.size).toBe(3)
    // removes key1 & key3, making its previous value ready to be CG
    key1 = undefined
    key3 = undefined

    await gc({ execution: 'async', type: 'major' })

    expect(set.size).toBe(1)
  })
}
