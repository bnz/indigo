import { PlayerId, RouteTiles, TileName } from "../types"
import { clone, GameSnapshot, isPublicSnapshot, isRecord, isSnapshot, isTileName, playerIds, PublicGameSnapshot } from "./snapshot"

export const PROTOCOL = 2
export interface Member { id: PlayerId, name: string, online: boolean }
export interface Seat { id: PlayerId, token: string }
export interface DealerState { deck: TileName[], hands: Partial<Record<PlayerId, TileName | null>> }
export interface Packet {
    type: "state"
    protocol: number
    room: string
    revision: number
    started: boolean
    members: Member[]
    game: PublicGameSnapshot | null
    player: PlayerId | null
    tile: TileName | null
    lastMove?: { cell: string, route: RouteTiles, moveId: string }
}
export interface SavedRoom {
    role: "host" | "guest"
    token: string
    name: string
    seats: Seat[]
    packet: Packet
    // Never included in a state message or in a guest's saved room.
    dealer?: DealerState | null
}

export const validRoom = (room: string) => /^[a-f0-9]{32}$/.test(room)
const validMembers = (members: unknown): members is Member[] => Array.isArray(members) &&
    members.length >= 1 && members.length <= 4 && members.every((m, i) => isRecord(m) && m.id === playerIds[i] &&
        typeof m.name === "string" && m.name.length <= 24 && typeof m.online === "boolean")

export const isPacket = (data: unknown, room: string): data is Packet => {
    if (!isRecord(data)) return false
    return data.type === "state" && data.protocol === PROTOCOL && data.room === room &&
        !["deck", "dealer", "hands"].some(key => key in data) &&
        Number.isSafeInteger(data.revision) && data.revision >= 0 && typeof data.started === "boolean" &&
        validMembers(data.members) && (data.player === null || data.members.some(m => m.id === data.player)) &&
        (data.tile === null || (data.player !== null && isTileName(data.tile))) &&
        (data.started ? isPublicSnapshot(data.game) && data.game.players.length === data.members.length : data.game === null && data.tile === null)
}

export const isSavedRoom = (data: unknown, room: string): data is SavedRoom => {
    if (!isRecord(data) || !["host", "guest"].includes(data.role) || typeof data.token !== "string" ||
        !validRoom(data.token) || typeof data.name !== "string" || !isPacket(data.packet, room) ||
        !Array.isArray(data.seats) || !data.seats.every(s => isRecord(s) && playerIds.includes(s.id) &&
            typeof s.token === "string" && validRoom(s.token))) return false
    if (data.role === "guest") return data.dealer === undefined && data.seats.length === 0
    if (data.seats.length !== data.packet.members.length || data.seats[0]?.token !== data.token ||
        data.seats.some((s, i) => s.id !== playerIds[i])) return false
    if (!data.packet.started) return !data.dealer
    const dealer = data.dealer
    return isRecord(dealer) && Array.isArray(dealer.deck) && dealer.deck.every(isTileName) &&
        dealer.deck.length === data.packet.game!.remaining && isRecord(dealer.hands) &&
        Object.keys(dealer.hands).length === data.packet.members.length &&
        data.packet.members.every(m => dealer.hands[m.id] === null || isTileName(dealer.hands[m.id]))
}

// Preserve the current tile when dealing a new party or migrating an existing open-hand party.
export const dealHands = (state: GameSnapshot, shuffleRemaining = false): DealerState => {
    const deck = [...state.deck]
    if (shuffleRemaining) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[deck[i], deck[j]] = [deck[j], deck[i]]
        }
    }
    const finished = Object.values(state.stones).every(stone => stone[4])
    const hands: DealerState["hands"] = {}
    state.players.forEach(player => {
        hands[player.id] = finished ? null : player.id === state.move[0] ? state.move[1] ?? null : deck.pop() ?? null
    })
    return { deck, hands }
}

// Keep v1 saves intact, but only the host may migrate the shared deck to private hands.
// Guests retain their identity and public board, then receive their own tile on reconnect.
export const migrateSavedRoom = (data: unknown, room: string): SavedRoom | null => {
    if (!isRecord(data) || !isRecord(data.packet)) return null
    const old = data.packet
    if (old.protocol !== 1 || old.room !== room || !validMembers(old.members) ||
        (old.started ? !isSnapshot(old.game) : old.game !== null)) return null
    const full = old.game as GameSnapshot | null
    const dealer = data.role === "host" && full ? dealHands(full, true) : null
    let game: PublicGameSnapshot | null = null
    if (full) {
        const { move, deck, ...board } = full
        game = { ...board, turn: move[0], remaining: dealer ? dealer.deck.length : deck.length }
    }
    const saved = {
        role: data.role, token: data.token, name: data.name, seats: data.seats,
        packet: { ...old, protocol: PROTOCOL, game, player: data.role === "host" ? PlayerId.Player1 : null,
            tile: dealer?.hands[PlayerId.Player1] ?? null },
        ...(data.role === "host" ? { dealer } : {}),
    }
    return isSavedRoom(saved, room) ? clone(saved) : null
}
