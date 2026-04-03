let setupCache = null

/**
 * @returns {GarbageCollectionApi}
 */
export async function setup(){
  if(setupCache){ return setupCache }
  const noopGC = async () => {}
  const isNode = globalThis.process?.versions?.node != null
  let gcMethod = noopGC
  let reason = 'Garbage collection not enabled'

  if(isNode){
    const { setFlagsFromString } = await import('node:v8')
    const { runInNewContext } = await import('node:vm')

    setFlagsFromString('--expose_gc')
    const nodeGc = runInNewContext('gc')
    if(typeof nodeGc === 'function'){
      gcMethod = async () => await nodeGc({ execution: 'async', type: 'major' })
      reason = ''
    } else {
      reason = 'Garbage collection not exposed on nodeJs'
    }
  }

  setupCache = Object.freeze({
    garbageCollect: gcMethod,
    enabled: typeof gcMethod === 'function' && gcMethod !== noopGC,
    reason,
  })
  return setupCache
}
/**
 * @typedef {object} GarbageCollectionApi
 * @property {() => Promise<void>} garbageCollect - triggers Garbage Collection (GC) if enabled, does nothing otherwise
 * @property {boolean} enabled - flag showing wether GC is enabled or not
 * @property {string} reason - reason why GC is disabled; empty string value if enabled
 */
