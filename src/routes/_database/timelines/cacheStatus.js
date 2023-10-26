import {
  accountsCache, setInCache, statusesCache
} from '../cache.js'
import { cloneDeep } from '../../_utils/lodash-lite.js'

export function cacheStatus (status, instanceName) {
  setInCache(statusesCache, instanceName, status.id, cloneDeep(status))
  setInCache(accountsCache, instanceName, status.account.id, status.account)
  if (status.reblog) {
    setInCache(accountsCache, instanceName, status.reblog.account.id, status.reblog.account)
  }
}
