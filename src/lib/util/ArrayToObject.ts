
export default function<T>(keys: string[], items: T[], toKey: (item: T) => string): { [key: string]: T } {
  // { key: null, ... }
  const map = Object.fromEntries((keys || []).map(key => [key, null]))

  // attach item
  for (const item of items) {
    const key = toKey(item)
    if (key) {
      map[key] = item
    }
  }

  return map
}
