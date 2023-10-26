// Some functions from Lodash that are a bit heavyweight and which
// we can just do in idiomatic ES2015+

export function get (obj, keys, defaultValue) {
  for (const key of keys) {
    if (obj && key in obj) {
      obj = obj[key]
    } else {
      return defaultValue
    }
  }
  return obj
}

export function pickBy (obj, predicate) {
  const res = {}
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key)) {
      res[key] = value
    }
  }
  return res
}

export function padStart (string, length, chars) {
  while (string.length < length) {
    string = chars + string
  }
  return string
}

export function sum (list) {
  let total = 0
  for (const item of list) {
    total += item
  }
  return total
}

export function times (n, func) {
  const res = []
  for (let i = 0; i < n; i++) {
    res.push(func(i))
  }
  return res
}

export function noop () {}

export function cloneDeep (obj) {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj))
}

export function uniqById (arr) {
  const ids = new Set()
  return arr.filter(obj => obj && obj.id && !ids.has(obj.id) && (ids.add(obj.id), true))
}

export function isEqual (value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true
  }
  if (typeof value !== 'object' || typeof other !== 'object') {
    return false
  }
  return JSON.stringify(value) === JSON.stringify(other)
}

export function difference (arr, toRemove) {
  toRemove = new Set(toRemove)
  return arr.filter(item => !toRemove.has(item))
}
