import { mark, stop } from './marks.js'
import { compareTimelineItemSummaries } from './statusIdSorting.js'

export function sortItemSummariesForThread (_summaries, statusId) {
  mark('sortItemSummariesForThread')
  try {
    const summariesById = new Map()
    const summariesByParentId = new Map()
    const summaries = []
    for (const _summary of _summaries) {
      const summary = { ..._summary }
      summaries.push(summary)
      summary.start = false
      summary.end = false
      summariesById.set(summary.id, summary)
      if (summary.replyId) {
        if (summariesByParentId.has(summary.replyId)) {
          summariesByParentId.get(summary.replyId).push(summary)
        } else {
          summariesByParentId.set(summary.replyId, [summary])
        }
      }
    }

    const status = summariesById.get(statusId)
    if (!status) {
      // bail out, for some reason we can't find the status (should never happen)
      console.warn(`couldn't find status ${statusId} in`, _summaries)
      return _summaries
    }

    let orphans = []
    for (const summary of summaries) {
      if (!summariesById.has(summary.replyId)) {
        orphans.push(summary)
      }
    }
    function treeify (summary) {
      summary.replies = (summariesByParentId.get(summary.id) || []).map(treeify.bind(summary))
      summary.parent = this
      return summary
    }
    orphans = orphans.map(treeify.bind(null)).sort(compareTimelineItemSummaries)
    const ancestors = []
    let top = status
    while (top.parent) {
      top = top.parent
      top.depth = 0
      ancestors.unshift(top)
    }
    function flatten (summary) {
      summary.depth = summary.parent ? summary.parent.depth + 1 : 0
      return [summary, ...summary.replies.sort(compareTimelineItemSummaries).map(flatten)].flat()
    }
    status.start = true
    status.depth = 0
    const subtree = [status, ...status.replies.map(flatten)].flat()
    subtree[subtree.length - 1].end = true
    const newSummaries = orphans.map(summary => summary.id === top.id
      ? [...ancestors.map((summary, i) => {
          summary.depth = i
          return summary
        }), ...subtree]
      : flatten(summary)).flat().map((summary) => {
      delete summary.parent
      delete summary.replies
      return summary
    })
    newSummaries.byId = summariesById
    _summaries = newSummaries
  } catch (e) {
    console.warn('failed to sortItemSummariesForThread', e)
  }
  stop('sortItemSummariesForThread')
  return _summaries
}
