function normalizeHashtag (hashtag) {
  return (
    hashtag && hashtag.startsWith('#') ? hashtag.slice(1) : hashtag
  ).normalize('NFKC')
}

function isNodeLinkHashtag (element) {
  return (
    element.tagName === 'A' &&
    // it may be a <a> starting with a hashtag
    (element.textContent?.[0] === '#' ||
      // or a #<a>
      element.previousSibling?.textContent?.[
        element.previousSibling.textContent.length - 1
      ] === '#')
  )
}

/**
 * Removes duplicates from an hashtag list, case-insensitive, keeping only the best one
 * "Best" here is defined by the one with the more casing difference (ie, the most camel-cased one)
 * @param hashtags The list of hashtags
 * @returns The input hashtags, but with only 1 occurence of each (case-insensitive)
 */
function uniqueHashtagsWithCaseHandling (hashtags) {
  const groups = hashtags.reduce((obj, tag) => {
    const normalizedTag = tag.normalize('NFKD').toLowerCase();
    (obj[normalizedTag] = obj[normalizedTag] || []).push(tag)
    return obj
  }, {})

  return Object.values(groups).map((tags) => tags[0])
}

// Create the collator once, this is much more efficient
const collator = new Intl.Collator(undefined, {
  sensitivity: 'base' // we use this to emulate the ASCII folding done on the server-side, hopefuly more efficiently
})

function localeAwareInclude (collection, value) {
  const normalizedValue = value.normalize('NFKC')

  return !!collection.find(
    (item) => collator.compare(item.normalize('NFKC'), normalizedValue) === 0
  )
}

export function computeHashtagBarForStatus (status) {
  let statusContent = status.content

  const tagNames = status.tags.map((tag) => tag.name)

  // this is returned if we stop the processing early, it does not change what is displayed
  const defaultResult = {
    statusContent,
    hashtagsInBar: []
  }

  // return early if this status does not have any tags
  if (tagNames.length === 0) return defaultResult

  const template = document.createElement('template')
  template.innerHTML = statusContent.trimEnd()

  const normalizedTagNames = tagNames.map((tag) => tag.normalize('NFKC'))
  const isValidNode = node => {
    if (!node) {
      return false
    }
    if (isNodeLinkHashtag(node) && node.textContent) {
      const normalized = normalizeHashtag(node.textContent)
      if (!localeAwareInclude(normalizedTagNames, normalized)) {
        // stop here, this is not a real hashtag, so consider it as text
        return false
      }
      return normalized
    } else if (node.nodeType !== 3 || node.nodeValue?.trim()) {
      // not a space
      return false
    } else {
      // spaces
      return true
    }
  }

  let lastChild = template.content.lastChild
  if (isValidNode(lastChild)) {
    const wrap = document.createElement('template')
    while (lastChild && isValidNode(lastChild)) {
      const previousSibling = lastChild.previousSibling
      wrap.appendChild(lastChild)
      lastChild = previousSibling
    }
    if (lastChild && lastChild.tagName === 'BR') {
      lastChild.remove()
    }
    lastChild = wrap
  }

  if (!lastChild) return defaultResult

  lastChild.remove()
  if (!lastChild.firstElementChild) {
    const wrap = document.createElement('template')
    wrap.appendChild(lastChild)
    lastChild = wrap
  }
  const contentWithoutLastLine = template

  // First, try to parse
  const contentHashtags = Array.from(
    contentWithoutLastLine.content.querySelectorAll('a[href]')
  ).reduce((result, link) => {
    if (isNodeLinkHashtag(link)) {
      if (link.textContent) result.push(normalizeHashtag(link.textContent))
    }
    return result
  }, [])

  // Now we parse the last line, and try to see if it only contains hashtags
  const lastLineHashtags = []
  // try to see if the last line is only hashtags
  let onlyHashtags = true

  for (const node of lastChild.childNodes) {
    const tag = isValidNode(node)
    if (typeof tag === 'string') {
      lastLineHashtags.push(tag)
    } else if (!tag) {
      onlyHashtags = false
    }
  }

  const hashtagsInBar = tagNames.filter((tag) => {
    const normalizedTag = tag.normalize('NFKC')
    // the tag does not appear at all in the status content, it is an out-of-band tag
    return (
      !localeAwareInclude(contentHashtags, normalizedTag) &&
      !localeAwareInclude(lastLineHashtags, normalizedTag)
    )
  })

  const isOnlyOneLine = contentWithoutLastLine.content.childElementCount === 0
  const hasMedia = status.media_attachments && status.media_attachments.length > 0
  const hasSpoiler = !!status.spoiler_text

  if (onlyHashtags && ((hasMedia && !hasSpoiler) || !isOnlyOneLine)) {
    // if the last line only contains hashtags, and we either:
    // - have other content in the status
    // - dont have other content, but a media and no CW. If it has a CW, then we do not remove the content to avoid having an empty content behind the CW button
    statusContent = contentWithoutLastLine.innerHTML
    // and add the tags to the bar
    hashtagsInBar.push(...lastLineHashtags)
  }

  return {
    statusContent,
    hashtagsInBar: uniqueHashtagsWithCaseHandling(hashtagsInBar)
  }
}
