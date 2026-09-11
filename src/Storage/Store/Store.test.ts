import { COLLECTION_ANIMATION_MS, COLLISION_ANIMATION_MS, SCORE_ANIMATION_MS, Store } from "./Store"
import { applySit } from "./applyers/applySit"
import { rotateLeft } from "./applyers/rotate"
import { nextMove } from "./applyers/nextMove"
import { PlayerId, RouteTiles, StoneId, StoneType } from "../../types"
import { runInAction } from "mobx"

let stores: Store[] = []
const createStore = () => {
    const store = new Store()
    stores.push(store)
    return store
}

beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
})

afterEach(() => {
    stores.forEach(store => store.dispose())
    stores = []
    jest.useRealTimers()
    jest.restoreAllMocks()
})

test("a crossroad survives saving and reloading before placement", () => {
    const store = createStore()
    store.playerMove = [PlayerId.Player1, "c", 0]
    const restored = createStore()
    runInAction(() => { restored.hoveredId = "1,0" })
    applySit(restored)()
    expect(restored.tiles["1,0"].tile).toBe(RouteTiles.c)
    expect(restored.playerMove[0]).toBe(PlayerId.Player2)
    expect(restored.stones.e0[1]).toBe(1)
    expect(restored.stones.s[1]).toBe(0)
})

test.each([
    [3, PlayerId.Player2, PlayerId.Player3],
    [4, PlayerId.Player4, PlayerId.Player1],
] as const)("a %i-player game advances turns through every selected player", (count, current, next) => {
    const store = createStore()
    store.playersStore.setPlayerCount(count)
    store.playerMove = [current, "c", 0]
    nextMove(store)
    expect(store.playersStore.players).toHaveLength(count)
    expect(store.playerMove[0]).toBe(next)
})

test("a collision holds the impact frame before removing both gems", () => {
    const store = createStore()
    runInAction(() => {
        store.tiles["-3,1"].tile = RouteTiles.c
        store.tiles["-1,1"].tile = RouteTiles.c
        store.stones.a0 = [StoneType.amber, -3, 1, 0]
        store.stones.a1 = [StoneType.amber, -1, 1, 3]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-2,1"
    })
    applySit(store)()
    expect(store.collisions).toEqual([])
    jest.advanceTimersByTime(250)
    expect(store.collisions).toEqual([{ stoneIds: [StoneId.amber0, StoneId.amber1], q: -2, r: 1 }])
    expect(store.animatedStones).not.toBeNull()
    jest.advanceTimersByTime(COLLISION_ANIMATION_MS)
    expect(store.collisions).toEqual([])
    expect(store.animatedStones).toBeNull()
})

test.each([
    [3, [PlayerId.Player2, PlayerId.Player3]],
    [4, [PlayerId.Player3, PlayerId.Player4]],
] as const)("a shared gateway awards both owners in a %i-player game", (count, expectedOwners) => {
    const store = createStore()
    store.playersStore.setPlayerCount(count)
    runInAction(() => {
        store.stones.a0 = [StoneType.amber, -3, 1, 3]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-4,1"
    })
    applySit(store)()
    expect(store.pendingAwards).toEqual(expectedOwners.map(playerId => ({ playerId, stoneId: StoneId.amber0 })))
    expect(store.playersStore.players.filter(player => player.stones.includes(StoneId.amber0)).map(player => player.id)).toEqual(expectedOwners)
})

test("a move saves one complete snapshot and reload during animation resumes its final state", () => {
    const store = createStore()
    store.playerMove = [PlayerId.Player1, "c", 0]
    runInAction(() => { store.hoveredId = "1,0" })
    const write = jest.spyOn(Storage.prototype, "setItem")
    applySit(store)()
    expect(write).toHaveBeenCalledTimes(1)
    expect(store.animatedStones).not.toBeNull()
    const saved = localStorage.getItem("game-v2")
    const restored = createStore()
    expect(JSON.stringify(restored.stones)).toBe(JSON.stringify(store.stones))
    expect(restored.playerMove).toEqual(store.playerMove)
    expect(restored.animatedStones).toBeNull()
    expect(localStorage.getItem("game-v2")).toBe(saved)
})

test("extra input during animation cannot place another tile, rotate or draw again", () => {
    const store = createStore()
    store.playerMove = [PlayerId.Player1, "c", 0]
    runInAction(() => { store.hoveredId = "1,0" })
    applySit(store)()
    const saved = localStorage.getItem("game-v2")
    runInAction(() => { store.hoveredId = "0,1" })
    rotateLeft(store)()
    applySit(store)()
    expect(store.tiles["0,1"].tile).toBeUndefined()
    expect(localStorage.getItem("game-v2")).toBe(saved)
    jest.runAllTimers()
    expect(store.canPlay).toBe(true)
})

test("restart cancels pending animation without changing the new game's state", () => {
    const store = createStore()
    store.playerMove = [PlayerId.Player1, "c", 0]
    runInAction(() => { store.hoveredId = "1,0" })
    applySit(store)()
    store.reset()
    const saved = localStorage.getItem("game-v2")
    jest.runAllTimers()
    expect(store.animatedStones).toBeNull()
    expect(store.tiles["1,0"].tile).toBeUndefined()
    expect(store.stones.e0.slice(1, 3)).toEqual([0, 0])
    expect(store.playersStore.players.every(player => !player.stones.length)).toBe(true)
    expect(localStorage.getItem("game-v2")).toBe(saved)
})

test("the last gem ends the game, is awarded once and prevents further moves", () => {
    const store = createStore()
    runInAction(() => {
        Object.values(store.stones).forEach(stone => { stone[4] = true })
        store.stones.a0 = [StoneType.amber, -3, 1, 3]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-4,1"
    })
    applySit(store)()
    expect(store.finished).toBe(true)
    expect(store.winners.map(player => player.id)).toEqual([PlayerId.Player2])
    expect(store.playersStore.players[1].stones).toEqual(["a0"])
    expect(store.playerMove).toEqual([PlayerId.Player1])
    jest.runAllTimers()
    runInAction(() => { store.hoveredId = "1,0" })
    applySit(store)()
    expect(store.tiles["1,0"].tile).toBeUndefined()
    expect(store.playersStore.players[1].stones).toEqual(["a0"])
    const restored = createStore()
    expect(restored.finished).toBe(true)
})

test("a rejected move changes neither the board, the deck nor the saved game", () => {
    const store = createStore()
    store.playerMove = [PlayerId.Player1, "s", 60]
    runInAction(() => { store.hoveredId = "-3,-1" })
    const saved = localStorage.getItem("game-v2")
    applySit(store)()
    expect(store.error).toBe("gateBlocked")
    expect(store.tiles["-3,-1"].tile).toBeUndefined()
    expect(localStorage.getItem("game-v2")).toBe(saved)
})

test("old game data is retained separately instead of loading an incompatible board", () => {
    localStorage.setItem("game", JSON.stringify({ "player-move": ["p-3", "c", null] }))
    const legacy = localStorage.getItem("game")
    const store = createStore()
    expect(store.isNewGame).toBe(true)
    expect(store.playersStore.players).toHaveLength(2)
    expect(localStorage.getItem("game")).toBe(legacy)
})

test("awards are saved immediately but revealed only after their flight to the player", () => {
    const store = createStore()
    runInAction(() => {
        store.stones.a0 = [StoneType.amber, -3, 1, 3]
        store.stones.a1 = [StoneType.amber, -3, 0, 4]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-4,1"
    })
    applySit(store)()
    const saved = localStorage.getItem("game-v2")
    expect(store.playersStore.players[1].stones).toEqual(["a0", "a1"])
    expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual([])
    expect(store.pendingAwards).toHaveLength(2)
    expect(store.collecting).toBe(false)
    jest.advanceTimersByTime(750)
    expect(store.collecting).toBe(true)
    expect(store.canPlay).toBe(false)
    expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual([])
    jest.advanceTimersByTime(COLLECTION_ANIMATION_MS - 1)
    expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual([])
    jest.advanceTimersByTime(1)
    expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual(["a0", "a1"])
    expect(store.collecting).toBe(false)
    expect(store.pendingAwards).toEqual([])
    expect(store.scoreChanges).toEqual([{ playerId: PlayerId.Player2, from: 0, to: 2 }])
    expect(store.canPlay).toBe(false)
    jest.advanceTimersByTime(SCORE_ANIMATION_MS - 1)
    expect(store.canPlay).toBe(false)
    jest.advanceTimersByTime(1)
    expect(store.scoreChanges).toEqual([])
    expect(store.canPlay).toBe(true)
    expect(localStorage.getItem("game-v2")).toBe(saved)
})

test("reload and restart during collection never replay or duplicate an award", () => {
    const store = createStore()
    runInAction(() => {
        store.stones.a0 = [StoneType.amber, -3, 1, 3]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-4,1"
    })
    applySit(store)()
    jest.advanceTimersByTime(750)
    expect(store.collecting).toBe(true)
    const restored = createStore()
    expect(restored.collecting).toBe(false)
    expect(restored.pendingAwards).toEqual([])
    expect(restored.visiblePlayerStones(PlayerId.Player2)).toEqual(["a0"])
    store.reset()
    const saved = localStorage.getItem("game-v2")
    jest.runAllTimers()
    expect(store.collecting).toBe(false)
    expect(store.pendingAwards).toEqual([])
    expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual([])
    expect(localStorage.getItem("game-v2")).toBe(saved)
})

test("reduced motion reveals awards immediately without delaying the next turn", () => {
    const matchMedia = window.matchMedia
    window.matchMedia = jest.fn().mockReturnValue({ matches: true })
    try {
        const store = createStore()
        runInAction(() => {
            store.stones.a0 = [StoneType.amber, -3, 1, 3]
            store.playerMove = [PlayerId.Player1, "c", 0]
            store.hoveredId = "-4,1"
        })
        applySit(store)()
        expect(store.animatedStones).toBeNull()
        expect(store.pendingAwards).toEqual([])
        expect(store.scoreChanges).toEqual([])
        expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual(["a0"])
        expect(store.canPlay).toBe(true)
    } finally {
        window.matchMedia = matchMedia
    }
})

test("score animation retains the previous total and is not replayed after reload or restart", () => {
    const store = createStore()
    runInAction(() => {
        Object.values(store.stones).forEach(stone => { stone[4] = true })
        store.playersStore.players[1].stones.push(StoneId.emerald0)
        store.stones.s = [StoneType.sapphire, -3, 1, 3]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-4,1"
    })
    applySit(store)()
    const saved = localStorage.getItem("game-v2")
    jest.advanceTimersByTime(750 + COLLECTION_ANIMATION_MS)
    expect(store.scoreChanges).toEqual([{ playerId: PlayerId.Player2, from: 2, to: 5 }])
    expect(store.finished).toBe(true)
    expect(store.animatedStones).not.toBeNull()
    expect(localStorage.getItem("game-v2")).toBe(saved)
    const restored = createStore()
    expect(restored.finished).toBe(true)
    expect(restored.scoreChanges).toEqual([])
    expect(restored.animatedStones).toBeNull()
    store.reset()
    const resetSave = localStorage.getItem("game-v2")
    jest.runAllTimers()
    expect(store.scoreChanges).toEqual([])
    expect(store.visiblePlayerStones(PlayerId.Player2)).toEqual([])
    expect(localStorage.getItem("game-v2")).toBe(resetSave)
})
