import { importGoogleTranslate } from '../_utils/asyncModules/importGoogleTranslate.js'
import { store } from '../_store/store.js'
import { massageUserText } from '../_utils/massageUserText.js'
import escapeHtml from 'escape-html'
async function translate (html, to, from) {
  const { languageNames, translate } = await importGoogleTranslate()
  return { content: await translate(html, to, from), languageNames }
}
const defaultLanguage = process.env.LOCALE.split('-')[0]
export function translateStatus (
  status,
  currentInstance,
  to = defaultLanguage,
  from = 'auto'
) {
  const id = currentInstance + '-' + status.id
  const {
    statusTranslations,
    statusTranslationContents,
    autoplayGifs,
    disableDecomojiConverter
  } = store.get()
  statusTranslations[id] = statusTranslations[id] || {}
  statusTranslations[id].show = true
  if (
    !(
      statusTranslations[id].loading ||
      (statusTranslationContents[id] &&
        statusTranslationContents[id].to === to &&
        statusTranslationContents[id].from === from)
    )
  ) {
    statusTranslations[id].loading = true
    statusTranslations[id].error = false
    translate(
      (status.spoiler_text
        ? massageUserText(
          '<span class="spoiler_text">' +
            escapeHtml(status.spoiler_text) +
            '\n\n</span>',
          status.emojis || [],
          autoplayGifs,
          disableDecomojiConverter
        )
        : '') + status.content,
      to,
      from
    )
      .then(({ content, languageNames }) => {
        const { statusTranslations, statusTranslationContents } = store.get()
        statusTranslations[id].loading = false
        statusTranslations[id].languageNames = languageNames
        statusTranslationContents[id] = content
        store.set({ statusTranslations, statusTranslationContents })
      })
      .catch(err => {
        console.error('error translating status', err)
        const { statusTranslations, statusTranslationContents } = store.get()
        statusTranslations[id].loading = false
        statusTranslations[id].error = true
        delete statusTranslationContents[id]
        store.set({ statusTranslations, statusTranslationContents })
      })
  }
  store.set({ statusTranslations })
}
