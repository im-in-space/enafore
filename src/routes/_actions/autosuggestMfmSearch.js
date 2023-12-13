import { store } from '../_store/store.js'
import { scheduleIdleTask } from '../_utils/scheduleIdleTask.js'

const MFM_TAGS = ['tada', 'jelly', 'twitch', 'shake', 'spin', 'jump', 'bounce', 'flip', 'x2', 'x3', 'x4', 'scale', 'position', 'fg', 'bg', 'font', 'blur', 'rainbow', 'sparkle', 'rotate'].map(tag => ({ name: tag }))

export function doMfmSearch (searchText) {
  let canceled = false

  scheduleIdleTask(async () => {
    if (canceled) {
      return
    }
    const results = MFM_TAGS.filter(tag => tag.name.startsWith(searchText.slice(2)))
    if (canceled) {
      return
    }
    store.setForCurrentAutosuggest({
      autosuggestType: 'mfm',
      autosuggestSelected: 0,
      autosuggestSearchResults: results
    })
  })

  return {
    cancel: () => {
      canceled = true
    }
  }
}
