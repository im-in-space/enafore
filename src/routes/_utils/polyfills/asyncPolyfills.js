export const importRequestIdleCallback = () => import(
  /* webpackChunkName: '$polyfill$-requestidlecallback' */ 'requestidlecallback'
)

export const importFocusVisible = () => import(
  /* webpackChunkName: '$polyfill$-focus-visible' */ 'focus-visible'
)

export const importIntlLocale = () => import(
  /* webpackChunkName: '$polyfill$-intl-locale' */ '@formatjs/intl-locale/polyfill.js'
)

export const importIntlPluralRules = async () => { // has to be imported serially
  await import(
    /* webpackChunkName: '$polyfill$-intl-pluralrules' */ '@formatjs/intl-pluralrules/polyfill.js'
  )
  await import(
    /* webpackChunkName: '$polyfill$-intl-pluralrules' */ '@formatjs/intl-pluralrules/locale-data/en.js'
  )
}

export const importIntlRelativeTimeFormat = async () => { // has to be imported serially
  await import(
    /* webpackChunkName: '$polyfill$-intl-relativetimeformat' */ '@formatjs/intl-relativetimeformat/polyfill.js'
  )
  await import(
    /* webpackChunkName: '$polyfill$-intl-relativetimeformat' */ '@formatjs/intl-relativetimeformat/locale-data/en.js'
  )
}

export const importIntlListFormat = async () => { // has to be imported serially
  await import(
    /* webpackChunkName: '$polyfill$-intl-listformat' */ '@formatjs/intl-listformat/polyfill.js'
  )
  await import(
    /* webpackChunkName: '$polyfill$-intl-listformat' */ '@formatjs/intl-listformat/locale-data/en.js'
  )
}

export const importDynamicViewportUnitsPolyfill = () => import(
  /* webpackChunkName: '$polyfill$-dynamic-viewport-units' */ '../../_thirdparty/large-small-dynamic-viewport-units-polyfill/dynamic-viewport-utils-polyfill.js'
)
