import { mark, stop } from './marks.js'

// mentions like "@foo" have to be expanded to "@foo@example.com"
function massageMentions (doc, mentions) {
  const anchors = doc.querySelectorAll('a.mention')
  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i]
    const href = anchor.getAttribute('href')
    const mention = mentions.find(mention => mention.url === href)
    if (mention) {
      anchor.textContent = `@${mention.acct}`
    }
  }
}

// paragraphs should be separated by double newlines
// single <br/>s should become single newlines
function innerTextRetainingNewlines (ele) {
  const brs = ele.querySelectorAll('br')
  for (let j = 0; j < brs.length; j++) {
    const br = brs[j]
    br.parentNode.replaceChild(document.createTextNode('\n'), br)
  }
  return [].map.call(ele.childNodes, e => e.textContent).join('\n\n')
}

export function statusHtmlToPlainText (html, mentions) {
  if (!html) {
    return ''
  }
  mark('statusHtmlToPlainText')
  const doc = document.createElement('template')
  doc.innerHTML = html
  if (mentions) massageMentions(doc, mentions)
  const res = innerTextRetainingNewlines(doc)
  stop('statusHtmlToPlainText')
  return res
}
