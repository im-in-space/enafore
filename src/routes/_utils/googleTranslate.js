import getGoogleTranslateHTML from './googleTranslateHTML.js'
import { languageList } from 'lingva-scraper/dist/utils/language.js'
export const languageNames = languageList.all
export const translate = getGoogleTranslateHTML(async function translate (text, to, from) {
  const data = await (await fetch('https://simplytranslate.org/api/translate?' + new URLSearchParams({
    text,
    from,
    to,
    engine: 'google'
  }))).json()
  return {
    detected: data.source_language,
    text: data.translated_text,
    to,
    from
  }
})
