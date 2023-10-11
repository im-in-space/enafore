import { pickBy, get } from '../../_utils/lodash-lite.js'
import { getFirstIdFromItemSummaries } from '../../_utils/getIdFromItemSummaries.js'

function reorder (timelineName, summaries) {
  const backupSummaries = summaries
  try {
    if (!timelineName.startsWith('status/')) {
      return summaries
    }
    const replyChildren = {}
    for (const summary of summaries) {
      delete summary.subtree
      if (summary.replyId) {
        replyChildren[summary.replyId] = replyChildren[summary.replyId] || []
        replyChildren[summary.replyId].push(summary)
      }
    }
    function flatten (summary, level = 0) {
      const subtree = summary.id === timelineName.slice('status/'.length)
      if (subtree) {
        level = 0
      }
      const statuses = [{ ...summary, level }, ...(replyChildren[summary.id] || []).map(e => flatten(e, level + 1))].flat()
      if (subtree) {
        statuses[0].subtree = statuses[0].subtree || {}
        statuses[0].subtree.start = true
        statuses[statuses.length - 1].subtree = statuses[statuses.length - 1].subtree || {}
        statuses[statuses.length - 1].subtree.end = true
      }
      return statuses
    }
    const reordered = summaries.length > 0 ? flatten(summaries[0]) : []
    const reorderedIds = new Set(reordered.map(e => e.id))
    const floating = []
    for (const summary of summaries) {
      if (!reorderedIds.has(summary.id)) {
        floating.push(summary)
        console.warn('reorder is missing a status. this could be a bug or it could not be. who knows.', { summary, summaries, reordered, timelineName, replyChildren })
      }
    }
    return [...reordered, ...floating]
  } catch (e) {
    console.error(e)
    return backupSummaries
  }
}

export function timelineMixins (Store) {
  Store.prototype.setForTimeline = function (instanceName, timelineName, obj) {
    const valuesToSet = {}
    for (const key of Object.keys(obj)) {
      if (key === 'timelineItemSummaries') {
        obj[key] = reorder(timelineName, obj[key])
      }
      const rootKey = `timelineData_${key}`
      const root = this.get()[rootKey] || {}
      const instanceData = root[instanceName] = root[instanceName] || {}
      instanceData[timelineName] = obj[key]
      valuesToSet[rootKey] = root
    }

    this.set(valuesToSet)
  }

  Store.prototype.getForTimeline = function (instanceName, timelineName, key) {
    const rootKey = `timelineData_${key}`
    const root = this.get()[rootKey]
    return get(root, [instanceName, timelineName])
  }

  Store.prototype.getAllTimelineData = function (instanceName, key) {
    const root = this.get()[`timelineData_${key}`] || {}
    return root[instanceName] || {}
  }

  Store.prototype.getFirstTimelineItemId = function (instanceName, timelineName) {
    const summaries = this.getForTimeline(instanceName, timelineName, 'timelineItemSummaries')
    return getFirstIdFromItemSummaries(summaries)
  }

  Store.prototype.setForCurrentTimeline = function (obj) {
    const { currentInstance, currentTimeline } = this.get()
    this.setForTimeline(currentInstance, currentTimeline, obj)
  }

  Store.prototype.getThreads = function (instanceName) {
    const instanceData = this.getAllTimelineData(instanceName, 'timelineItemSummaries')

    return pickBy(instanceData, (value, key) => {
      return key.startsWith('status/')
    })
  }

  Store.prototype.clearTimelineDataForInstance = function (instanceName) {
    const changes = {}
    Object.entries(this.get()).forEach(([key, value]) => {
      if (key.startsWith('timelineData_') && value) {
        delete value[instanceName]
        changes[key] = value
      }
    })
    this.set(changes)
  }
}
