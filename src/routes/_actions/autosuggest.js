import { store } from '../_store/store.js'

const mappers = {
  emoji: emoji => emoji.unicode ? emoji.unicode : `:${emoji.shortcodes[0]}:`,
  hashtag: hashtag => `#${hashtag.name}`,
  account: account => `@${account.acct}`,
  mfm: tag => `$[${tag.name}`
}

async function insertTextAtPosition (realm, text, startIndex, endIndex) {
  const { currentInstance } = store.get()
  const oldText = store.getComposeData(realm, 'text')
  const pre = oldText.substring(0, startIndex)
  const post = oldText.substring(endIndex)
  const newText = `${pre}${text} ${post}`
  store.setComposeData(realm, { text: newText })
  store.setForAutosuggest(currentInstance, realm, { autosuggestSearchResults: [] })
}

async function clickSelectedItem (realm, resultMapper) {
  const {
    composeSelectionStart,
    autosuggestSearchText,
    autosuggestSelected,
    autosuggestSearchResults
  } = store.get()
  const result = autosuggestSearchResults[autosuggestSelected]
  const startIndex = composeSelectionStart - autosuggestSearchText.length
  const endIndex = composeSelectionStart
  await insertTextAtPosition(realm, resultMapper(result), startIndex, endIndex)
}

export async function clickSelectedAutosuggestion (realm, type) {
  return clickSelectedItem(realm, mappers[type])
}

export function selectAutosuggestItem (item, type) {
  const {
    currentComposeRealm,
    composeSelectionStart,
    autosuggestSearchText
  } = store.get()
  const startIndex = composeSelectionStart - autosuggestSearchText.length
  const endIndex = composeSelectionStart
  /* no await */ insertTextAtPosition(currentComposeRealm, mappers[type](item), startIndex, endIndex)
}
