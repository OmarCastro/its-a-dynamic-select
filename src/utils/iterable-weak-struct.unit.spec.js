import { test } from '../../test-utils/unit/test.util.js'
import { IterableWeakMap, IterableWeakSet } from './iterable-weak-struct.js'

test('IterableWeakMap - iterates over entries', async ({ expect }) => {
  const map = new IterableWeakMap()
  const key1 = { hello: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.set(key1, 'test value')
  map.set(key2, 'test value 2')
  expect([...map.entries()]).toEqual([[key1, 'test value'], [key2, 'test value 2']])
})

test('IterableWeakSet - iterates over entries', async ({ expect }) => {
  const map = new IterableWeakSet()
  const key1 = { hello: 'world' }
  const key2 = { lorem: 'ipsum' }
  map.add(key1)
  map.add(key2)
  expect([...map.entries()]).toEqual([key1, key2])
})

const isNode = globalThis.process?.versions?.node != null
if (isNode) {
  /** @type {NodeJS.GCFunction} */
  let gc = async (...args) => {
    const { setFlagsFromString } = await import('node:v8')
    const { runInNewContext } = await import('node:vm')

    setFlagsFromString('--expose_gc')
    const nodeGc = runInNewContext('gc')
    gc = async (...args) => await nodeGc(...args)
    return await nodeGc(...args)
  }

  test('IterableWeakMap - cleans up garbage collected keys', async ({ expect }) => {
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

    // removes key1 & key3, making its previous value ready to be CG
    key1 = undefined
    key3 = undefined

    await gc({ execution: 'async', type: 'major' })
    expect([...map.entries()]).toEqual([[key2, 'test value 2']])
  })

  test('IterableWeakMap - size property updates on garbage collection', async ({ expect }) => {
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

  test('IterableWeakSet - cleans up garbage collected keys', async ({ expect }) => {
    const set = new IterableWeakSet()

    let key1 = { hello: 'world' }
    const key2 = { lorem: 'ipsum' }
    let key3 = { banana: 'land' }

    set.add(key1)
    set.add(key2)
    set.add(key3)

    expect(set.size).toBe(3)

    // compare to copies of the keys as they are going to be saved for test reporting,
    // preventing them from being CG
    expect([...set.entries()]).toEqual([{ ...key1 }, { ...key2 }, { ...key3 }])

    // removes key1 & key3, making its previous value ready to be CG
    key1 = undefined
    key3 = undefined

    await gc({ execution: 'async', type: 'major' })

    expect(set.size).toBe(1)
    expect([...set.entries()]).toEqual([key2])
  })

  test('IterableWeakSet - size property updates on garbage collection', async ({ expect }) => {
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
