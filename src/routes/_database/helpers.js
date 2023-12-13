import { dbPromise, getDatabase } from './databaseLifecycle.js'
import { getInCache, hasInCache, setInCache } from './cache.js'
import {
  ACCOUNT_ID, REBLOG_ID, STATUS_ID, TIMESTAMP, USERNAME_LOWERCASE, CURRENT_TIME
} from './constants.js'

export async function getGenericEntityWithId (store, cache, instanceName, id) {
  if (hasInCache(cache, instanceName, id)) {
    return getInCache(cache, instanceName, id)
  }
  const db = await getDatabase(instanceName)
  const result = await dbPromise(db, store, 'readonly', (store, callback) => {
    store.get(id).onsuccess = (e) => callback(e.target.result)
  })
  setInCache(cache, instanceName, id, result)
  return result
}

export async function setGenericEntityWithId (store, cache, instanceName, entity) {
  setInCache(cache, instanceName, entity.id, entity)
  const db = await getDatabase(instanceName)
  return dbPromise(db, store, 'readwrite', (store) => {
    store.put(entity)
  })
}

const preserve = new Set(['reactions', 'emoji_reactions', 'quote'])
export function cloneForStorage (obj) {
  const res = {}
  const keys = Object.keys(obj)
  for (const key of keys) {
    const value = obj[key]
    if (preserve.has(key)) {
      res[key] = value
      continue
    }
    // save storage space by skipping nulls, 0s, falses, empty strings, and empty arrays
    if (!value || (Array.isArray(value) && value.length === 0)) {
      continue
    }
    switch (key) {
      case 'account':
        res[ACCOUNT_ID] = value.id
        break
      case 'status':
        res[STATUS_ID] = value.id
        break
      case 'reblog':
        res[REBLOG_ID] = value.id
        break
      case 'acct':
        res[key] = value
        res[USERNAME_LOWERCASE] = value.toLowerCase()
        break
      default:
        res[key] = value
        break
    }
  }
  res[TIMESTAMP] = CURRENT_TIME.now()
  return res
}
