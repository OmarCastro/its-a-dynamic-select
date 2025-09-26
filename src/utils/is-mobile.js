const portraitMobileMatchMedia = window.matchMedia('(max-width: 576px) and (orientation: portrait)')
const landscapeMobileMatchMedia = window.matchMedia('(max-width: 768px) and (orientation: landscape)')

export const hasTouchScreen = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export const isPortraitMobile = () => portraitMobileMatchMedia.matches && hasTouchScreen()
export const isLandscapeMobile = () => landscapeMobileMatchMedia.matches && hasTouchScreen()

export const isMobile = () => isPortraitMobile() || isLandscapeMobile()
