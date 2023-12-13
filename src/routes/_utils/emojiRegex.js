import emojiRegex from 'emojibase-regex/emoji-loose.js'
import { thunk } from './thunk.js'

export const getEmojiRegex = thunk(() => {
  if (!emojiRegex.global) {
    return new RegExp(emojiRegex.source, emojiRegex.flags + 'g')
  }
  return emojiRegex
})
