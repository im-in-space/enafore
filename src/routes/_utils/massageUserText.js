import { emojifyText } from './emojifyText.js'

export function massageUserText (text, emojis, $autoplayGifs, $disableDecomojiConverter) {
  text = text || ''
  text = emojifyText(text, emojis, $autoplayGifs, $disableDecomojiConverter)
  return text
}
