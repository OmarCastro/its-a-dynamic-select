import { IterableWeakMap, IterableWeakSet } from './iterable-weak-struct.js'

const portraitMobileMatchMedia = window.matchMedia('(max-width: 576px) and (orientation: portrait)')
const landscapeMobileMatchMedia = window.matchMedia('(max-width: 768px) and (orientation: landscape)')

export const hasTouchScreen = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export const isPortraitMobile = () => portraitMobileMatchMedia.matches && hasTouchScreen()
export const isLandscapeMobile = () => landscapeMobileMatchMedia.matches && hasTouchScreen()

export const isMobile = () => isPortraitMobile() || isLandscapeMobile()

/**
 * Map of created observers with its data
 * @type {IterableWeakMap<MobileDetectionObserverCallback, MobileDetectionObserverData>}
 */
const observerData = new IterableWeakMap()

/**
 *
 */
function updateData () {
  const isNowMobile = isMobile()
  for (const [callback, data] of observerData.entries()) {
    const { currentIsMobile, observingNodes } = data
    if (currentIsMobile === isNowMobile) { continue }
    data.currentIsMobile = isNowMobile
    const events = Iterator.from(observingNodes).map(element => ({
      target: element,
      isMobile: isNowMobile,
    })).toArray()
    callback(events)
  }
}

let observeMatchMedia = () => {
  portraitMobileMatchMedia.addEventListener('change', updateData)
  landscapeMobileMatchMedia.addEventListener('change', updateData)
  observeMatchMedia = () => {}
}


/**
 * @param {MobileDetectionObserverCallback} callback - mutation callback
 * @returns {MobileDetectionObserver} - observer
 */
export function MobileDetectionObserver (callback) {
  const data = observerData.getOrInsertComputed(callback, () => ({
    observingNodes: new IterableWeakSet(),
    currentIsMobile: undefined,
  }))

  return Object.freeze({

    observe (node) {
      observeMatchMedia()
      data.currentIsMobile ??= isMobile()
      const { currentIsMobile, observingNodes } = data
      if (observingNodes.has(node)) { return }
      observingNodes.add(node)
      callback([{
        target: node,
        isMobile: currentIsMobile,
      }])
    },

  })
}

/**
 * @typedef {object} MobileDetectionObserver
 * @property {(node: Node) => void} observe - observer callback
 */

/**
 * @typedef {object} MobileDetectionObserverData
 * @property {boolean} [currentIsMobile] - flag saved on observer to determine if the mode changed
 * @property {IterableWeakSet<Node>} observingNodes - observer callback
 */

/**
 * @callback MobileDetectionObserverCallback
 * @param {MobileStateMutationRecord[]} mutations - mutations happened for each observing element
 */

/**
 * @typedef {object} MobileStateMutationRecord
 * @property {Node} target - observing element
 * @property {boolean} isMobile - flag to determine if it's on mobile mode
 */
