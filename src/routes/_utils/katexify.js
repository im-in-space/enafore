import { importKatex } from './asyncModules/importKatex.js'

export function katexify (node) {
  const toKatexify = node.querySelectorAll('.to-katexify')
  if (toKatexify.length) {
    return importKatex().then(katex => {
      for (const node of toKatexify) {
        const content = node.textContent
        const displayMode = node.tagName === 'PRE'
        const span = document.createElement('span')
        node.replaceWith(span)
        span.textContent = content
        katex.render(content, span, {
          throwOnError: false,
          displayMode
        })
      }
    })
  }
}
