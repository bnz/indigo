import { runInAction } from "mobx"
import { Store } from "../Storage/Store/Store"
import { generateTiles } from "../Storage/Store/applyers/generateTiles"
import { saveTiles } from "../Storage/Store/applyers/saveTiles"
import { gateways } from "../Storage/Store/constants/gateways"
import { HexType, PlayerId, PlayerMove, Players, RouteTiles, StoneId, Stones, TileItems, TileName, TreasureTiles } from "../types"

export interface GameSnapshot {
    players: Players
    move: PlayerMove
    deck: TileName[]
    stones: Stones
    routes: TileItems<RouteTiles>
    treasures: TileItems<TreasureTiles>
}

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

export const snapshot = (store: Store): GameSnapshot => clone({
    players: store.playersStore.players,
    move: store.playerMove,
    deck: store.leftTiles,
    stones: store.stones,
    routes: Object.values(store.tiles).filter(tile => tile.type === HexType.route).map(tile =>
        tile.tile === undefined ? [tile.hex.q, tile.hex.r] : [tile.hex.q, tile.hex.r, tile.tile]) as TileItems<RouteTiles>,
    treasures: Object.values(store.tiles).filter(tile => tile.type === HexType.treasure).map(tile =>
        [tile.hex.q, tile.hex.r, tile.tile]) as TileItems<TreasureTiles>,
})

// Layout/orientation, language and theme belong to the device, not the room.
export const restoreSnapshot = (store: Store, source: GameSnapshot) => runInAction(() => {
    const state = clone(source)
    store.stopAnimation()
    store.storage.transaction(() => {
        store.playersStore.players = state.players
        store.playersStore.generatePlayersGateways()
        store.storage.set("players", state.players)
        store.playerMove = state.move
        store.leftTiles = state.deck
        store.storage.set("tiles-left", state.deck)
        store.stones = state.stones
        store.storage.set("stones", state.stones)
        store.tiles = {
            ...generateTiles(gateways, HexType.gateway),
            ...generateTiles(state.routes, HexType.route),
            ...generateTiles(state.treasures, HexType.treasure),
        }
        saveTiles(store)
    })
    store.preSit = false
    store.hoveredId = null
    store.error = null
    store.saveFailed = store.storage.failed
})

export const isRecord = (value: unknown): value is Record<string, any> =>
    value !== null && typeof value === "object" && !Array.isArray(value)

const names = ["s", "c", "t", "l", "h"]
const angles = [0, 60, 120, 180, 240, 300]
const coord = (n: unknown) => typeof n === "number" && Number.isInteger(n) && Math.abs(n) <= 5

export const isSnapshot = (value: unknown): value is GameSnapshot => {
    if (!isRecord(value)) return false
    const { players, move, deck, stones, routes, treasures } = value
    return Array.isArray(players) && players.length >= 2 && players.length <= 4 &&
        players.every((p, i) => isRecord(p) && p.id === `p-${i + 1}` &&
            (p.name === undefined || (typeof p.name === "string" && p.name.length <= 24)) &&
            Array.isArray(p.stones) && p.stones.length <= 12 && new Set(p.stones).size === p.stones.length &&
            p.stones.every((id: unknown) => Object.values(StoneId).includes(id as StoneId))) &&
        Array.isArray(move) && move.length >= 1 && move.length <= 5 && players.some(p => p.id === move[0]) &&
        (move.length === 1 || (names.includes(move[1]) && angles.includes(move[2]))) &&
        Array.isArray(deck) && deck.length <= 54 && deck.every(name => names.includes(name)) &&
        isRecord(stones) && Object.keys(stones).length === 12 && Object.values(StoneId).every(id => {
            const s = stones[id]
            return Array.isArray(s) && s.length >= 4 && s.length <= 5 && [0, 1, 2].includes(s[0]) &&
                coord(s[1]) && coord(s[2]) && Number.isInteger(s[3]) && s[3] >= 0 && s[3] <= 5 &&
                (s.length === 4 || typeof s[4] === "boolean")
        }) &&
        Array.isArray(routes) && routes.length === 54 && new Set(routes.map(t => Array.isArray(t) && `${t[0]},${t[1]}`)).size === 54 &&
        routes.every(t => Array.isArray(t) && coord(t[0]) && coord(t[1]) &&
            (t.length === 2 || (t.length === 3 && Number.isInteger(t[2]) && t[2] >= 25 && t[2] <= 39))) &&
        Array.isArray(treasures) && treasures.length === 7 && treasures.every(t =>
            Array.isArray(t) && t.length === 3 && coord(t[0]) && coord(t[1]) && Number.isInteger(t[2]) && t[2] >= 0 && t[2] <= 6)
}

export const playerIds = Object.values(PlayerId)
