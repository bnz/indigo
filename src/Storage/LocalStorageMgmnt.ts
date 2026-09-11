export interface iLocalStorageMgmnt<K, V> {
    get(key: K, fallback?: V): any | null
    set(key: K, value: V): void
    getOrApply<T>(key: K, callback: () => T): T
    destroy(): void
}

export class LocalStorageMgmnt<K, V> implements iLocalStorageMgmnt<K, V> {

    failed = false
    private memory: Record<string, V> = {}
    private pending: Record<string, V> | null = null

    constructor(
        private storageName: string,
    ) {
    }

    get(key: K, fallback?: V) {
        return this.read()[String(key)] ?? fallback ?? null
    }

    private read(): Record<string, V> {
        if (this.pending) return this.pending
        if (this.failed) return this.memory
        try {
            const data = JSON.parse(localStorage.getItem(this.storageName) || "{}")
            if (!data || typeof data !== "object" || Array.isArray(data)) return {}
            return data
        } catch {
            this.failed = true
            return this.memory
        }
    }

    getOrApply<T>(key: K, callback: () => T): T {
        const existing = this.get(key)
        if (existing !== null) {
            return existing as unknown as T
        }
        const res = callback()
        this.set(key, res as unknown as V)
        return res
    }

    set(key: K, value: V) {
        const data = { ...this.read(), [String(key)]: value }
        if (this.pending) this.pending = data
        else this.write(data)
    }

    private write(data: Record<string, V>) {
        const serialized = JSON.stringify(data)
        this.memory = JSON.parse(serialized)
        try {
            localStorage.setItem(this.storageName, serialized)
            this.failed = false
        } catch {
            this.failed = true
        }
    }

    transaction(callback: () => void) {
        this.pending = { ...this.read() }
        try {
            callback()
            this.write(this.pending)
        } finally {
            this.pending = null
        }
    }

    destroy() {
        this.memory = {}
        try {
            localStorage.removeItem(this.storageName)
            this.failed = false
        } catch {
            this.failed = true
        }
    }

}
