import Database from 'emoji-picker-element/database.js'
import { lifecycle } from './lifecycle.js'
import { emojiPickerLocale, emojiPickerDataSource } from '../_static/emojiPickerIntl.js'

let database

function applySkinToneToEmoji (emoji, skinTone) {
  if (!emoji || emoji.url) { // nonexistent or custom emoji
    return emoji
  }
  const res = {
    unicode: emoji.unicode,
    shortcodes: emoji.shortcodes
  }
  if (skinTone > 0 && emoji.skins) { // non-default skin tone
    const tone = emoji.skins.find(_ => _.tone === skinTone)
    if (tone) {
      res.unicode = tone.unicode
    }
  }
  return res
}

export function init () {
  if (!database) {
    database = new Database({
      locale: emojiPickerLocale,
      dataSource: emojiPickerDataSource
    })
  }
}

export function setCustomEmoji (customEmoji) {
  init()
  database.customEmoji = customEmoji
}

export async function findByUnicodeOrName (unicodeOrName) {
  init()
  return database.getEmojiByUnicodeOrName(unicodeOrName)
}

export async function findBySearchQuery (query) {
  init()
  const [emojis, skinTone] = await Promise.all([
    database.getEmojiBySearchQuery(query),
    database.getPreferredSkinTone()
  ])
  return emojis.map(emoji => applySkinToneToEmoji(emoji, skinTone))
}

if (process.browser) {
  lifecycle.addEventListener('statechange', event => {
    if (event.newState === 'frozen' && database) { // page is frozen, close IDB connections
      console.log('closed emoji DB')
      database.close()
    }
  })
}
