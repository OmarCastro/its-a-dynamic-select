import { IterableWeakMap, IterableWeakSet } from './iterable-weak-struct.js'

const portraitMobileMatchMedia = window.matchMedia('(max-width: 576px) and (orientation: portrait)')
const landscapeMobileMatchMedia = window.matchMedia('(max-width: 768px) and (orientation: landscape)')

export const hasTouchScreen = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export const isPortraitMobile = () => portraitMobileMatchMedia.matches && hasTouchScreen()
export const isLandscapeMobile = () => landscapeMobileMatchMedia.matches && hasTouchScreen()

export const isMobile = () => isPortraitMobile() || isLandscapeMobile()

const observerData = new IterableWeakMap()

/**
 *
 */
function updateData () {
  const isNowMobile = isMobile()
  for (const data of observerData.values()) {
    const { currentIsMobile, observingElements, callback } = data
    if (currentIsMobile === isNowMobile) { continue }
    data.currentIsMobile = isNowMobile
    const events = Iterator.from(observingElements).map(element => ({
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
  constructor (callback) {
    observerData.set(this, {
      callback,
      observingElements: new IterableWeakSet(),
      currentIsMobile: null
    })
  }

  observe (element) {
    observeMatchMedia()
    const data = observerData.get(this)
    if (data.currentIsMobile === null) {
      data.currentIsMobile = isMobile()
    }
    const { currentIsMobile, callback, observingElements } = data
    observingElements.add(element)
    callback([{
      target: element,
      isMobile: currentIsMobile
    }])
  }
}
