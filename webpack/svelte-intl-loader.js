// Inject intl statements into a Svelte v2 HTML file as well as some JS files like timeago.js
// We do this for perf reasons, to make the output smaller and avoid needing to have a huge JSON file of translations
import { getIntl } from '../bin/getIntl.js'

export default function (source) {
  const res = source
    .replace(/['"]intl\.([^'"]+)['"]/g, (match, p1) => {
      return JSON.stringify(getIntl(p1))
    })
  return res
}
