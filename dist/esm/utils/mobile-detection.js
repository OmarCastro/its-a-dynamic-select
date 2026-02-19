import { IterableWeakMap, IterableWeakSet } from './iterable-weak-struct.js'

const portraitMobileMatchMedia = window.matchMedia('(max-width: 576px) and (orientation: portrait)')
const landscapeMobileMatchMedia = window.matchMedia('(max-width: 768px) and (orientation: landscape)')

export const hasTouchScreen = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export const isPortraitMobile = () => portraitMobileMatchMedia.matches && hasTouchScreen()
export const isLandscapeMobile = () => landscapeMobileMatchMedia.matches && hasTouchScreen()

export const isMobile = () => isPortraitMobile() || isLandscapeMobile()

/**
 * Map of created observers with its data
 * @type {IterableWeakMap<MobileDetectionObserver, MobileDetectionObserverData>}
 */
const observerData = new IterableWeakMap()

/**
 *
 */
function updateData () {
  const isNowMobile = isMobile()
  for (const data of observerData.values()) {
    const { currentIsMobile, observingNodes, callback } = data
    if (currentIsMobile === isNowMobile) { continue }
    data.currentIsMobile = isNowMobile
    const events = Iterator.from(observingNodes).map(element => ({
      target: element,
      isMobile: isNowMobile
    })).toArray()
    callback(events)
  }
}

let observeMatchMedia = () => {
  portraitMobileMatchMedia.addEventListener('change', updateData)
  landscapeMobileMatchMedia.addEventListener('change', updateData)
  observeMatchMedia = () => {}
}

export class MobileDetectionObserver {
  /** @type {MobileDetectionObserverData} */
  #data
  /**
   * @param {MobileDetectionObserverCallback} callback - observer callback
   */
  constructor (callback) {
    this.#data = {
      callback,
      observingNodes: new IterableWeakSet(),
      currentIsMobile: undefined
    }
    observerData.set(this, this.#data)
  }

  /**
   * @param {Node} node - target element to observe
   */
  observe (node) {
    observeMatchMedia()
    const data = this.#data
    if (data.currentIsMobile === undefined) {
      data.currentIsMobile = isMobile()
    }
    const { currentIsMobile, callback, observingNodes } = data
    observingNodes.add(node)
    callback([{
      target: node,
      isMobile: currentIsMobile
    }])
  }
}

/**
 * @typedef {object} MobileDetectionObserverData
 * @property {boolean} [currentIsMobile] - flag saved on observer to determine if the mode changed
 * @property {MobileDetectionObserverCallback} callback - observer callback
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
