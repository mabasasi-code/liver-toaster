
export default function<T>(keys: string[], items: T[] = null, toKey: (item: T) => string): { [key: string]: T } {
  // { key: null, ... }
  const map = Object.fromEntries((keys || []).map(key => [key, null]))

  // attach item
  if (items) {
    for (const item of items) {
      if (item) {
        const key = toKey(item)
        if (key) {
          map[key] = item
        }
      }
    }
  }

  return map
}
