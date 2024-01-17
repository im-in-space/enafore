import { get, DEFAULT_TIMEOUT, post, WRITE_TIMEOUT, put, del } from '../_utils/ajax.js'
import { auth, basename } from './utils.js'

export async function getFilters (instanceName, accessToken) {
  const url = `${basename(instanceName)}/api/v1/filters`
  const filters = await get(url, auth(accessToken), { timeout: DEFAULT_TIMEOUT })
  // work around gotosocial bug
  return Array.isArray(filters) ? filters : []
}

export function createFilter (instanceName, accessToken, filter) {
  const url = `${basename(instanceName)}/api/v1/filters`
  return post(url, filter, auth(accessToken), { timeout: WRITE_TIMEOUT })
}

export function updateFilter (instanceName, accessToken, filter) {
  const url = `${basename(instanceName)}/api/v1/filters/${filter.id}`
  return put(url, filter, auth(accessToken), { timeout: WRITE_TIMEOUT })
}

export function deleteFilter (instanceName, accessToken, id) {
  const url = `${basename(instanceName)}/api/v1/filters/${id}`
  return del(url, auth(accessToken), { timeout: WRITE_TIMEOUT })
}
