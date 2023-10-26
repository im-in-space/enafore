import { thunk } from './thunk.js'
import { supportsSelector } from './supportsSelector.js'

export const supportsFocusVisible = thunk(() => supportsSelector(':focus-visible'))
