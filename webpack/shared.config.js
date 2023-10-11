import svgs from '../bin/svgs.js'
import { execSync } from 'child_process'
import { themes } from '../src/routes/_static/themes.js'

export const inlineSvgs = svgs.filter(_ => _.inline).map(_ => `#${_.id}`)
export const mode = process.env.NODE_ENV || 'production'
export const dev = mode === 'development'

export const resolve = {
  extensions: ['.js', '.json', '.html'],
  mainFields: ['svelte', 'module', 'browser', 'main'],
  alias: {
    // All browsers we target support Intl.PluralRules (or it's polyfilled).
    // So format-message-interpret can fall back to that. This file is pretty big (9.83kB) and it's not needed.
    './plurals': 'lodash.noop',
    'lookup-closest-locale': 'lodash.noop', // small, but also not needed
    'svelte/store.umd.js': 'svelte/store.js' // have to use UMD for Mocha, but in Webpack we can use the ESM version
  }
}

const commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim()) - 2701
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
export const version = 'v' + commitCount + '-' + commitHash
export const inlineThemeColors = Object.fromEntries(themes.map(_ => ([_.name, _.color])))
export const isUpstream = process.env.GITHUB_REPOSITORY === 'easrng/enafore'
