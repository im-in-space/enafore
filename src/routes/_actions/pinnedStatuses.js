import { store } from '../_store/store.js'
import { cacheFirstUpdateAfter } from '../_utils/sync.js'
import { database } from '../_database/database.js'
import {
  getPinnedStatuses
} from '../_api/pinnedStatuses.js'
import { rehydrateStatusOrNotification } from './rehydrateStatusOrNotification.js'

// Pinned statuses aren't a "normal" timeline, so their blurhashes/plaintext need to be calculated specially
async function rehydratePinnedStatuses (statuses) {
  await Promise.all(statuses.map(status => rehydrateStatusOrNotification({ status })))
  return statuses
}

export async function updatePinnedStatusesForAccount (accountId) {
  const { currentInstance, accessToken } = store.get()

  await cacheFirstUpdateAfter(
    async () => {
      return await getPinnedStatuses(currentInstance, accessToken, accountId)
    },
    async () => {
      const pinnedStatuses = await database.getPinnedStatuses(currentInstance, accountId)
      if (!pinnedStatuses || !pinnedStatuses.every(Boolean)) {
        throw new Error('missing pinned statuses in idb')
      }
      return pinnedStatuses
    },
    statuses => database.insertPinnedStatuses(currentInstance, accountId, statuses),
    async statuses => {
      const { pinnedStatuses } = store.get()
      pinnedStatuses[currentInstance] = pinnedStatuses[currentInstance] || {}
      pinnedStatuses[currentInstance][accountId] = await rehydratePinnedStatuses(statuses)
      store.set({ pinnedStatuses })
    }
  )
}
