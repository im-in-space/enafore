export function canonicalStatusUrl (status) {
  const fallbackUrl = new URL(status.url)
  return `/statuses/${status.id}/${fallbackUrl.hostname}${fallbackUrl.pathname}`
}
