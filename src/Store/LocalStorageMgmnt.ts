export interface iLocalStorageMgmnt<K, V> {
  get(key: K, fallback?: V): any | null

  set(key: K, value: V): void

  getOrApply<T>(key: K, callback: () => T): T

  destroy(): void
}

export class LocalStorageMgmnt<K, V> implements iLocalStorageMgmnt<K, V> {

  constructor(
    private storageName: string,
  ) {
  }

  get(key: K, fallback?: V) {
    const data = localStorage.getItem(this.storageName)

    if (data !== null) {
      const d = JSON.parse(data)
      return d[key] === undefined ? fallback || null : d[key]
    }

    return fallback || null
  }

  getOrApply<T>(key: K, callback: () => T): T {
    if (this.get(key) !== null) {
      return this.get(key)
    }
    const res = callback()
    // @ts-ignore TODO
    this.set(key, res)
    return res
  }

  set(key: K, value: V) {
    const data = localStorage.getItem(this.storageName)

    if (data === null) {
      localStorage.setItem(this.storageName, JSON.stringify({
        // @ts-ignore FIXME
        [key]: value,
      }))
    } else {
      const d = JSON.parse(data)
      d[key] = value
      localStorage.setItem(this.storageName, JSON.stringify(d))
    }
  }

  destroy() {
    localStorage.removeItem(this.storageName)
  }

}
