import { LocalStorageMgmnt } from "./LocalStorageMgmnt"

beforeEach(() => localStorage.clear())
afterEach(() => jest.restoreAllMocks())

test("commits multiple updates as one snapshot", () => {
    const storage = new LocalStorageMgmnt<string, number>("test")
    const write = jest.spyOn(Storage.prototype, "setItem")
    storage.transaction(() => {
        storage.set("one", 1)
        storage.set("two", 2)
        expect(localStorage.getItem("test")).toBeNull()
        expect(storage.get("one")).toBe(1)
    })
    expect(write).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem("test")!)).toEqual({ one: 1, two: 2 })
})

test("does not commit a failed transaction", () => {
    const storage = new LocalStorageMgmnt<string, number>("test")
    storage.set("one", 1)
    expect(() => storage.transaction(() => {
        storage.set("one", 2)
        throw new Error("interrupted")
    })).toThrow("interrupted")
    expect(storage.get("one")).toBe(1)
})

test("recovers from malformed JSON and preserves false and zero", () => {
    localStorage.setItem("test", "{broken")
    const storage = new LocalStorageMgmnt<string, number | boolean>("test")
    expect(storage.getOrApply("one", () => 0)).toBe(0)
    storage.set("two", false)
    expect(storage.get("two", true)).toBe(false)
    expect(storage.get("one", 1)).toBe(0)
})

test("retains in-memory progress and reports a browser storage failure", () => {
    const storage = new LocalStorageMgmnt<string, number>("test")
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded") })
    storage.set("one", 1)
    storage.transaction(() => {
        storage.set("one", 2)
        storage.set("two", 3)
    })
    expect(storage.failed).toBe(true)
    expect(storage.get("one")).toBe(2)
    expect(storage.get("two")).toBe(3)
})
