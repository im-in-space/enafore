import { store } from '../store.js'
import { doEmojiSearch } from '../../_actions/autosuggestEmojiSearch.js'
import { doAccountSearch } from '../../_actions/autosuggestAccountSearch.js'
import { doHashtagSearch } from '../../_actions/autosuggestHashtagSearch.js'
import { doMfmSearch } from '../../_actions/autosuggestMfmSearch.js'

function resetAutosuggest () {
  store.setForCurrentAutosuggest({
    autosuggestSelected: 0,
    autosuggestSearchResults: []
  })
}

export function autosuggestObservers () {
  let lastSearch

  store.observe('autosuggestSearchText', async autosuggestSearchText => {
    // cancel any inflight XHRs or other operations
    if (lastSearch) {
      lastSearch.cancel()
      lastSearch = null
    }
    // autosuggestSelecting indicates that the user has pressed Enter or clicked on an item
    // and the results are being processed. Returning early avoids a flash of searched content.
    const { composeFocused, currentComposeData, currentComposeRealm, currentLastContentType } = store.get()
    const composeData = currentComposeData[currentComposeRealm] || {}
    const autosuggestSelecting = store.getForCurrentAutosuggest('autosuggestSelecting')
    if (!composeFocused || !autosuggestSearchText || autosuggestSelecting) {
      resetAutosuggest()
      return
    }

    if (autosuggestSearchText.startsWith('$[')) { // mfm
      if ((typeof composeData.contentType === 'undefined' ? currentLastContentType : composeData.contentType) === 'text/x.misskeymarkdown') {
        lastSearch = doMfmSearch(autosuggestSearchText)
      } else {
        resetAutosuggest()
      }
    } else if (autosuggestSearchText.startsWith(':')) { // emoji
      lastSearch = doEmojiSearch(autosuggestSearchText)
    } else if (autosuggestSearchText.startsWith('#')) { // hashtag
      lastSearch = doHashtagSearch(autosuggestSearchText)
    } else { // account
      lastSearch = doAccountSearch(autosuggestSearchText)
    }
  })
}
