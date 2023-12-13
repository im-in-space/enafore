import { getEmojiRegex } from './emojiRegex.js'

// replace emoji in HTML with something else, safely skipping HTML tags
export function replaceEmoji (string, replacer) {
  const emojiRegex = getEmojiRegex()
  return string.replace(emojiRegex, replacer)
}
