import { store } from '../_store/store.js'
import { toast } from '../_components/toast/toast.js'
import { postStatus as postStatusToServer, putStatus as putStatusToServer } from '../_api/statuses.js'
import { addStatusOrNotification } from './addStatusOrNotification.js'
import { database } from '../_database/database.js'
import { emit } from '../_utils/eventBus.js'
import { putMediaMetadata } from '../_api/media.js'
import { scheduleIdleTask } from '../_utils/scheduleIdleTask.js'
import { uniqById } from '../_utils/lodash-lite.js'
import { formatIntl } from '../_utils/formatIntl.js'
import { rehydrateStatusOrNotification } from './rehydrateStatusOrNotification.js'

export async function insertHandleForReply (statusId) {
  const { currentInstance } = store.get()
  const status = await database.getStatus(currentInstance, statusId)
  const { currentVerifyCredentials } = store.get()
  const originalStatus = status.reblog || status
  let accounts = [originalStatus.account].concat(originalStatus.mentions || [])
    .filter(account => account.id !== currentVerifyCredentials.id)
  // Pleroma includes account in mentions as well, so make uniq
  accounts = uniqById(accounts)
  if (!store.getComposeData(statusId, 'text') && accounts.length) {
    store.setComposeData(statusId, {
      text: accounts.map(account => `@${account.acct} `).join('')
    })
  }
}

export async function postStatus (realm, text, inReplyToId, mediaIds,
  sensitive, spoilerText, visibility,
  mediaDescriptions, inReplyToUuid, poll, mediaFocalPoints, contentType, quoteId, localOnly, editId) {
  const { currentInstance, accessToken, online } = store.get()

  if (!online) {
    /* no await */ toast.say('intl.cannotPostOffline')
    return
  }

  text = text || ''

  const mediaMetadata = (mediaIds || []).map((mediaId, idx) => {
    return {
      description: mediaDescriptions && mediaDescriptions[idx],
      focalPoint: mediaFocalPoints && mediaFocalPoints[idx]
    }
  })

  store.set({ postingStatus: true })
  try {
    await Promise.all(mediaMetadata.map(async ({ description, focalPoint }, i) => {
      description = description || ''
      focalPoint = focalPoint || [0, 0]
      focalPoint[0] = focalPoint[0] || 0
      focalPoint[1] = focalPoint[1] || 0
      if (description || focalPoint[0] || focalPoint[1]) {
        return putMediaMetadata(currentInstance, accessToken, mediaIds[i], description, focalPoint)
      }
    }))
    if (editId) {
      const status = await putStatusToServer(currentInstance, accessToken, editId, text,
        inReplyToId, mediaIds, sensitive, spoilerText, visibility, poll, contentType, quoteId, localOnly)
      await database.insertStatus(currentInstance, status)
      await rehydrateStatusOrNotification({ status })
      emit('statusUpdated', status)
      emit('postedStatus', realm, inReplyToUuid)
    } else {
      const status = await postStatusToServer(currentInstance, accessToken, text,
        inReplyToId, mediaIds, sensitive, spoilerText, visibility, poll, contentType, quoteId, localOnly)
      addStatusOrNotification(currentInstance, 'home', status)
      emit('postedStatus', realm, inReplyToUuid)
    }
    store.clearComposeData(realm)
    scheduleIdleTask(() => (mediaIds || []).forEach(mediaId => database.deleteCachedMediaFile(mediaId))) // clean up media cache
  } catch (e) {
    console.error(e)
    /* no await */ toast.say(formatIntl('intl.unableToPost', { error: (e.message || '') }))
  } finally {
    store.set({ postingStatus: false })
  }
}

export function setReplySpoiler (realm, spoiler) {
  const contentWarning = store.getComposeData(realm, 'contentWarning')
  const contentWarningShown = store.getComposeData(realm, 'contentWarningShown')
  if (typeof contentWarningShown !== 'undefined' || contentWarning) {
    return // user has already interacted with the CW
  }
  store.setComposeData(realm, {
    contentWarning: spoiler,
    contentWarningShown: true
  })
}

const PRIVACY_LEVEL = {
  direct: 1,
  private: 2,
  unlisted: 3,
  public: 4
}

export function setReplyVisibility (realm, replyVisibility) {
  // return the most private between the user's preferred default privacy
  // and the privacy of the status they're replying to
  const postPrivacy = store.getComposeData(realm, 'postPrivacy')
  if (typeof postPrivacy !== 'undefined') {
    return // user has already set the postPrivacy
  }
  const { currentVerifyCredentials } = store.get()
  const defaultVisibility = currentVerifyCredentials.source.privacy
  const visibility = PRIVACY_LEVEL[replyVisibility] < PRIVACY_LEVEL[defaultVisibility]
    ? replyVisibility
    : defaultVisibility
  store.setComposeData(realm, { postPrivacy: visibility })
}
