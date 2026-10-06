import { runInAction } from "mobx"
import { Store } from "../Storage/Store/Store"
import { applySit } from "../Storage/Store/applyers/applySit"
import { tileNameToAngle } from "../Storage/Store/maps/TileNameToAngle"
import { rotateRight } from "../Storage/Store/applyers/rotate"
import { placementError } from "../game/rules"
import { PlayerId, RouteTiles } from "../types"
import { OnlineSession } from "./OnlineSession"
import { clone, isSnapshot, publicSnapshot, restoreSnapshot, snapshot } from "./snapshot"
import { Channel, PeerEndpoint, PeerFactory } from "./transport"

class MemoryStorage {
    values = new Map<string, string>()
    get length() { return this.values.size }
    key = (index: number) => Array.from(this.values.keys())[index] ?? null
    getItem = (key: string) => this.values.get(key) ?? null
    setItem = (key: string, value: string) => { this.values.set(key, value) }
    removeItem = (key: string) => { this.values.delete(key) }
}

class Events {
    handlers: Record<string, ((data?: any) => void)[]> = {}
    on(event: string, callback: (data?: any) => void) { (this.handlers[event] ||= []).push(callback) }
    emit(event: string, data?: any) { this.handlers[event]?.forEach(callback => callback(data)) }
}

class FakeChannel extends Events implements Channel {
    open = false
    other!: FakeChannel
    sent: any[] = []
    constructor(public peer: string, private hub: Hub) { super() }
    send(data: unknown) {
        if (!this.open) throw new Error("closed")
        this.sent.push(clone(data))
        this.hub.queue.push(() => { if (this.other.open) this.other.emit("data", clone(data)) })
    }
    close() {
        if (!this.open) return
        this.open = this.other.open = false
        this.emit("close")
        this.other.emit("close")
    }
}

class FakePeer extends Events implements PeerEndpoint {
    channels: FakeChannel[] = []
    constructor(public id: string, private hub: Hub) { super() }
    connect(id: string) {
        const remote = this.hub.peers.get(id)!
        const localChannel = new FakeChannel(id, this.hub)
        const remoteChannel = new FakeChannel(this.id, this.hub)
        localChannel.other = remoteChannel
        remoteChannel.other = localChannel
        this.channels.push(localChannel)
        remote.channels.push(remoteChannel)
        this.hub.queue.push(() => {
            remote.emit("connection", remoteChannel)
            localChannel.open = remoteChannel.open = true
            remoteChannel.emit("open")
            localChannel.emit("open")
        })
        return localChannel
    }
    destroy() {
        this.channels.forEach(channel => channel.close())
        this.hub.peers.delete(this.id)
    }
}

class Hub {
    peers = new Map<string, FakePeer>()
    queue: (() => void)[] = []
    sequence = 0
    factory: PeerFactory = async id => {
        const peer = new FakePeer(id || `guest-${++this.sequence}`, this)
        this.peers.set(peer.id, peer)
        this.queue.push(() => peer.emit("open", peer.id))
        return peer
    }
    async flush() {
        await Promise.resolve()
        while (this.queue.length) this.queue.shift()!()
    }
    guestChannel(index = 1) { return this.peers.get(`guest-${index}`)!.channels[0] }
}

let sessions: OnlineSession[]
let hub: Hub
let saves: Map<OnlineSession, MemoryStorage>
const board = (room: OnlineSession) => publicSnapshot(room.game!, room.remaining)
const saved = (room: OnlineSession) => JSON.parse(saves.get(room)!.getItem(`indigo-room-v2:${room.room}`)!)
const session = (storage = new MemoryStorage()) => {
    const room = new OnlineSession(hub.factory, storage)
    sessions.push(room)
    saves.set(room, storage)
    return room
}

beforeEach(() => {
    jest.useFakeTimers("modern")
    localStorage.clear()
    window.history.replaceState(null, "", "/")
    Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: true }) })
    let sequence = 0
    Object.defineProperty(window, "crypto", { configurable: true, value: {
        getRandomValues: (bytes: Uint8Array) => { bytes.fill(++sequence); return bytes },
    } })
    sessions = []
    saves = new Map()
    hub = new Hub()
})

afterEach(() => {
    sessions.forEach(room => room.dispose())
    jest.restoreAllMocks()
    jest.useRealTimers()
})

const setup = async (count = 2) => {
    const host = session()
    host.create("Host")
    await hub.flush()
    const guests: OnlineSession[] = []
    for (let i = 1; i < count; i++) {
        const guest = session()
        guest.join(host.invitation, `Guest ${i}`)
        guests.push(guest)
        await hub.flush()
    }
    host.start()
    await hub.flush()
    return { host, guests }
}

const place = (room: OnlineSession) => {
    const store = room.game!
    const route = store.currentRoute!
    const cell = Object.keys(store.tiles).find(id => !placementError(store.tiles, id, route))!
    runInAction(() => { store.hoveredId = cell; store.preSit = true })
    applySit(store)()
    return { cell, route }
}

test("four browsers share the public board, enforce turns, commit a full round and retain local saves", async () => {
    const local = new Store()
    local.playersStore.setPlayerCount(4)
    const localSave = localStorage.getItem("game-v2")
    const { host, guests } = await setup(4)
    const all = [host, ...guests]
    expect(host.members).toHaveLength(4)
    expect(host.members.every(member => member.online)).toBe(true)
    expect(all.map(room => room.game!.canPlay)).toEqual([true, false, false, false])
    guests.forEach(guest => expect(board(guest)).toEqual(board(host)))
    for (const current of all) {
        const before = host.revision
        place(current)
        if (current !== host) {
            expect(current.pending).toBe(true)
            expect(host.revision).toBe(before)
        }
        await hub.flush()
        expect(host.revision).toBe(before + 1)
        guests.forEach(guest => expect(board(guest)).toEqual(board(host)))
    }
    expect(host.game!.playerMove[0]).toBe(PlayerId.Player1)
    host.leave()
    expect(localStorage.getItem("game-v2")).toBe(localSave)
    expect(local.canPlay).toBe(true)
    local.dispose()
})

test("deals private tiles in advance and never sends the deck or another player's hand to guests", async () => {
    const { host, guests } = await setup(4)
    const dealer = saved(host).dealer
    expect(dealer.deck).toHaveLength(50)
    for (const room of [host, ...guests]) {
        expect(room.tile).toBe(dealer.hands[room.me!])
        expect(room.game!.leftTiles).toEqual([])
        expect(room.game!.currentTileName).toBe(room === host ? room.tile : undefined)
    }
    guests.forEach((guest, index) => {
        const packet = hub.guestChannel(index + 1).other.sent.filter(data => data.type === "state").slice(-1)[0]
        expect(packet.player).toBe(guest.me)
        expect(packet.tile).toBe(guest.tile)
        expect(Object.keys(packet.game).sort()).toEqual(["players", "remaining", "routes", "stones", "treasures", "turn"])
        expect(packet.game.remaining).toBe(50)
        expect(packet).not.toHaveProperty("dealer")
        expect(packet).not.toHaveProperty("hands")
        const cache = saved(guest)
        expect(cache).not.toHaveProperty("dealer")
        expect(cache.seats).toEqual([])
        expect(cache.packet.game).not.toHaveProperty("deck")
        expect(cache.packet.game).not.toHaveProperty("move")
        expect(cache.packet.tile).toBe(guest.tile)
    })
})

test("selection and rotation stay private; placement reveals the route and immediately refills only the mover", async () => {
    const { host, guests: [guest] } = await setup()
    const guestTile = guest.tile
    const before = saved(host).dealer
    const lastPacket = clone(saved(guest).packet)
    const nextHostTile = before.deck[before.deck.length - 1]
    rotateRight(host.game!)()
    runInAction(() => { host.game!.hoveredId = "1,0"; host.game!.preSit = true })
    await hub.flush()
    expect(saved(guest).packet).toEqual(lastPacket)
    expect(guest.game!.tiles["1,0"].tile).toBeUndefined()
    const route = host.game!.currentRoute!
    applySit(host.game!)()
    await hub.flush()
    expect(guest.game!.tiles["1,0"].tile).toBe(route)
    expect(host.tile).toBe(nextHostTile)
    expect(guest.tile).toBe(guestTile)
    expect(host.remaining).toBe(51)
    expect(host.game!.currentTileName).toBeUndefined()
    expect(guest.game!.currentTileName).toBe(guestTile)
    expect(saved(guest).packet.lastMove.route).toBe(route)
    expect(saved(guest).packet.tile).toBe(guestTile)
    expect(saved(guest).packet.game).not.toHaveProperty("move")
})

test("a guest cannot play a different tile type or request another player's private tile", async () => {
    const { host, guests: [guest] } = await setup()
    place(host)
    await hub.flush()
    const revision = host.revision
    const tile = guest.tile
    const channel = hub.guestChannel()
    channel.send({ type: "sync", player: PlayerId.Player1 })
    channel.send({ type: "move", revision, moveId: "ef".repeat(16), cell: "1,0", route: tile === "c" ? RouteTiles["h-0"] : RouteTiles.c })
    await hub.flush()
    expect(host.revision).toBe(revision)
    expect(guest.tile).toBe(tile)
    const packets = channel.other.sent.filter(data => data.type === "state" && data.started)
    expect(packets.every(data => data.player === guest.me && data.tile === tile)).toBe(true)
})

test("host rejects forged ownership, illegal tile type and stale/duplicate moves", async () => {
    const { host, guests: [guest] } = await setup()
    const channel = hub.guestChannel()
    const move = { type: "move", revision: host.revision, moveId: "ab".repeat(16), cell: "-4,1", route: host.game!.currentRoute }
    channel.send({ ...move, player: PlayerId.Player1 })
    await hub.flush()
    expect(host.revision).toBe(move.revision)
    place(host)
    await hub.flush()
    const before = host.revision
    channel.send({ ...move, revision: before, route: 999 })
    await hub.flush()
    expect(host.revision).toBe(before)
    const placement = place(guest)
    const original = channel.sent.filter(data => data.type === "move").slice(-1)[0]
    await hub.flush()
    const accepted = board(host)
    expect(host.game!.tiles[placement.cell].tile).toBe(placement.route)
    channel.send(original)
    await hub.flush()
    expect(board(host)).toEqual(accepted)
    expect(host.revision).toBe(before + 1)
})

test("guest reload reclaims the same seat and receives confirmed state without preview changes", async () => {
    const host = session()
    host.create("Host")
    await hub.flush()
    const persistence = new MemoryStorage()
    const guest = session(persistence)
    guest.join(host.invitation, "Ada")
    await hub.flush()
    host.start()
    await hub.flush()
    place(host)
    await hub.flush()
    runInAction(() => { guest.game!.playerMove = [PlayerId.Player2, "h", 120] })
    const room = host.room
    guest.dispose()
    expect(host.allOnline).toBe(false)
    expect(host.game!.canPlay).toBe(false)
    const restored = session(persistence)
    restored.join(room, "Ada")
    await hub.flush()
    expect(restored.me).toBe(PlayerId.Player2)
    expect(host.members).toHaveLength(2)
    expect(board(restored)).toEqual(board(host))
    expect(restored.tile).toBe(guest.tile)
    expect(restored.game!.currentTileName).toBe(guest.tile)
    expect(restored.game!.canPlay).toBe(true)
})

test("host reload restores its saved party and pauses until the existing guest reconnects", async () => {
    const persistence = new MemoryStorage()
    const host = session(persistence)
    host.create("Host")
    await hub.flush()
    const guest = session()
    guest.join(host.invitation, "Guest")
    await hub.flush()
    host.start()
    await hub.flush()
    place(host)
    await hub.flush()
    const state = board(host)
    const hostTile = host.tile
    const guestTile = guest.tile
    const room = host.room
    host.dispose()
    expect(guest.status).toBe("disconnected")
    const restored = session(persistence)
    restored.join(room, "Host")
    await hub.flush()
    expect(restored.role).toBe("host")
    expect(board(restored)).toEqual(state)
    expect(restored.tile).toBe(hostTile)
    expect(restored.allOnline).toBe(false)
    await guest.connect()
    await hub.flush()
    expect(restored.allOnline).toBe(true)
    expect(board(guest)).toEqual(state)
    expect(guest.tile).toBe(guestTile)
    expect(guest.game!.canPlay).toBe(true)
})

test("started games reject new players without adding seats", async () => {
    const { host } = await setup(4)
    const extra = session()
    extra.join(host.invitation, "Extra")
    await hub.flush()
    expect(extra.status).toBe("error")
    expect(host.members).toHaveLength(4)
    expect(extra.me).toBeNull()
})

test("a full lobby rejects a fifth player and incompatible protocol", async () => {
    const host = session()
    host.create("Host")
    await hub.flush()
    for (let i = 0; i < 4; i++) {
        session().join(host.invitation, `Guest ${i}`)
        await hub.flush()
    }
    expect(host.started).toBe(false)
    expect(host.members).toHaveLength(4)
    expect(sessions[4].status).toBe("error")
    const rogue = await hub.factory()
    await hub.flush()
    const connection = rogue.connect(`indigo-${host.room}`) as FakeChannel
    await hub.flush()
    connection.send({ type: "hello", protocol: 999, token: "ab".repeat(16), name: "Old client" })
    await hub.flush()
    expect(connection.other.sent.some(data => data.type === "rejected")).toBe(true)
    expect(host.members).toHaveLength(4)
    rogue.destroy()
})

test("heartbeat detects silent disconnection and locks every player's board", async () => {
    const { host, guests: [guest] } = await setup()
    hub.guestChannel().send = () => {} // Transport silently stops delivering guest traffic.
    for (let i = 0; i < 6; i++) {
        jest.advanceTimersByTime(3000)
        await hub.flush()
    }
    expect(host.members[1].online).toBe(false)
    expect(host.game!.canPlay).toBe(false)
    expect(guest.game!.canPlay).toBe(false)
})

test("missed move acknowledgement is recovered by sync without replaying the move", async () => {
    const { host, guests: [guest] } = await setup()
    place(host)
    await hub.flush()
    place(guest)
    // Deliver command to the host, then simulate a lost state response.
    hub.queue.shift()!()
    hub.queue = []
    expect(guest.pending).toBe(true)
    const state = board(host)
    jest.advanceTimersByTime(9000)
    await hub.flush()
    expect(guest.pending).toBe(false)
    expect(board(guest)).toEqual(state)
})

test.each([false, true])("host closure notifies everyone and stops reconnection (started: %s)", async started => {
    const host = session()
    host.create("Host")
    await hub.flush()
    const guest = session()
    guest.join(host.invitation, "Guest")
    await hub.flush()
    if (started) { host.start(); await hub.flush() }
    const room = host.room
    const oldState = clone(saved(guest).packet)
    const hostChannel = hub.guestChannel().other
    host.closeRoom()
    // The transport must remain alive until the terminal message is delivered.
    expect(hostChannel.open).toBe(true)
    expect(host.game!.canPlay).toBe(false)
    await hub.flush()
    for (const member of [host, guest]) {
        expect(member.status).toBe("closed")
        expect(member.pending).toBe(false)
        expect(member.resumeRoom).toBe("")
        expect(saves.get(member)!.getItem(`indigo-room-v2:${room}`)).toBeNull()
        expect(saves.get(member)!.getItem(`indigo-room-closed:${room}`)).toBe("1")
    }
    expect(hub.peers.size).toBe(0)
    const connectionCount = hub.sequence
    hostChannel.other.emit("data", oldState)
    jest.advanceTimersByTime(30000)
    await hub.flush()
    expect(hub.sequence).toBe(connectionCount)
    expect(guest.status).toBe("closed")
    expect(saves.get(guest)!.getItem(`indigo-room-v2:${room}`)).toBeNull()
    await guest.connect()
    expect(hub.peers.size).toBe(0)
})

test("guests cannot terminate a room by calling the action or forging a close message", async () => {
    const { host, guests: [guest] } = await setup()
    const before = board(host)
    guest.closeRoom()
    hub.guestChannel().send({ type: "room-closed", protocol: 2, room: host.room })
    await hub.flush()
    expect(host.status).toBe("connected")
    expect(guest.status).toBe("connected")
    expect(board(host)).toEqual(before)
    expect(host.game!.canPlay).toBe(true)
})

test("forget removes current and legacy saves for only the selected room", async () => {
    const host = session()
    host.create("Host")
    await hub.flush()
    const room = host.room
    const persistence = saves.get(host)!
    const unrelatedRoom = "ef".repeat(16)
    persistence.setItem(`indigo-room-v1:${room}`, "legacy")
    persistence.setItem(`game-online-v1:${room}:old-token`, "old view")
    persistence.setItem(`game-online-v2:${room}:new-token`, "new view")
    persistence.setItem(`indigo-room-v2:${unrelatedRoom}`, "other room")
    persistence.setItem(`game-online-v2:${unrelatedRoom}:token`, "other view")
    persistence.setItem("game-v2", "local game")
    persistence.setItem("ui", "settings")
    host.leave()
    expect(host.resumeRoom).toBe(room)
    expect(persistence.getItem(`indigo-room-v2:${room}`)).not.toBeNull()
    host.forgetRoom()
    expect(host.resumeRoom).toBe("")
    expect(persistence.getItem("indigo-last-room")).toBeNull()
    expect(Array.from(persistence.values.keys()).some(name => name.includes(room))).toBe(false)
    expect(persistence.getItem(`indigo-room-v2:${unrelatedRoom}`)).toBe("other room")
    expect(persistence.getItem(`game-online-v2:${unrelatedRoom}:token`)).toBe("other view")
    expect(persistence.getItem("game-v2")).toBe("local game")
    expect(persistence.getItem("ui")).toBe("settings")
    expect(session(persistence).resumeRoom).toBe("")
})

test("forget while connected leaves the room without deleting other players' saves", async () => {
    const { host, guests: [guest] } = await setup()
    const room = guest.room
    const hostState = board(host)
    guest.forgetRoom()
    await hub.flush()
    expect(guest.active).toBe(false)
    expect(guest.resumeRoom).toBe("")
    expect(saves.get(guest)!.getItem(`indigo-room-v2:${room}`)).toBeNull()
    expect(saves.get(guest)!.getItem(`indigo-room-closed:${room}`)).toBeNull()
    expect(host.status).toBe("connected")
    expect(host.allOnline).toBe(false)
    expect(board(host)).toEqual(hostState)
    expect(saved(host).packet.started).toBe(true)
})

test("closed room markers prevent reopening via a link, resume, or a legacy backup", async () => {
    const { host, guests: [guest] } = await setup()
    const room = host.room
    const persistence = saves.get(host)!
    const original = persistence.getItem(`indigo-room-v2:${room}`)!
    host.closeRoom()
    await hub.flush()
    host.leave()
    persistence.setItem(`indigo-room-v2:${room}`, original)
    persistence.setItem(`indigo-room-v1:${room}`, "old backup")
    persistence.setItem("indigo-last-room", room)
    const restored = session(persistence)
    expect(restored.resumeRoom).toBe("")
    expect(persistence.getItem(`indigo-room-v2:${room}`)).toBeNull()
    expect(persistence.getItem(`indigo-room-v1:${room}`)).toBeNull()
    window.history.replaceState(null, "", `#/room/${room}`)
    restored.boot()
    expect(restored.status).toBe("closed")
    expect(restored.game).toBeNull()
    await restored.connect()
    restored.join(room, "Host")
    expect(restored.status).toBe("closed")
    expect(hub.peers.size).toBe(0)
    expect(guest.status).toBe("closed")
})

test("closing waits only a bounded time for peers that do not acknowledge", async () => {
    const { host } = await setup()
    const channel = hub.guestChannel()
    channel.send = () => {}
    host.closeRoom()
    await hub.flush()
    expect(host.status).toBe("closed")
    jest.advanceTimersByTime(2600)
    expect(channel.open).toBe(false)
    expect(hub.peers.size).toBe(0)
})

test("browser storage cleanup removes rendered room state without touching the local game", async () => {
    const local = new Store()
    const localSave = localStorage.getItem("game-v2")
    const host = new OnlineSession(hub.factory)
    sessions.push(host)
    host.create("Host")
    await hub.flush()
    const room = host.room
    expect(Object.keys(localStorage).some(name => name.startsWith(`game-online-v2:${room}:`))).toBe(true)
    host.forgetRoom()
    expect(Object.keys(localStorage).some(name => name.includes(room))).toBe(false)
    expect(localStorage.getItem("game-v2")).toBe(localSave)
    local.dispose()
})

test("storage errors are reported instead of pretending that forget succeeded", async () => {
    const host = session()
    host.create("Host")
    await hub.flush()
    const room = host.room
    saves.get(host)!.removeItem = () => { throw new Error("Storage blocked") }
    host.forgetRoom()
    expect(host.saveFailed).toBe(true)
    expect(host.setup).toBe(true)
    expect(host.error).toContain("Не удалось удалить")
    expect(host.resumeRoom).toBe(room)
})

test("snapshots round-trip game data while keeping device orientation and settings local", () => {
    const first = new Store("test-first")
    first.playersStore.setPlayerCount(4)
    const state = snapshot(first)
    expect(isSnapshot(state)).toBe(true)
    const other = new Store("test-other")
    const orientation = other.orientation
    restoreSnapshot(other, state)
    expect(snapshot(other)).toEqual(state)
    expect(other.orientation).toBe(orientation)
    expect(isSnapshot({ ...state, stones: {} })).toBe(false)
    expect(isSnapshot({ ...state, routes: [[0, 0, RouteTiles.c]] })).toBe(false)
    first.dispose()
    other.dispose()
})

test("migrates v1 host and guest saves without losing the board, seat identities or local saves", async () => {
    const room = "ab".repeat(16)
    const hostToken = "cd".repeat(16)
    const guestToken = "ef".repeat(16)
    const legacy = new Store("legacy-fixture")
    const original = snapshot(legacy)
    const packet = { type: "state", protocol: 1, room, revision: 5, started: true, game: original,
        members: original.players.map(player => ({ id: player.id, name: player.id, online: true })) }
    const hostCache = new MemoryStorage()
    const guestCache = new MemoryStorage()
    hostCache.setItem(`indigo-room-v1:${room}`, JSON.stringify({ role: "host", token: hostToken, name: "Host",
        seats: [{ id: PlayerId.Player1, token: hostToken }, { id: PlayerId.Player2, token: guestToken }], packet }))
    guestCache.setItem(`indigo-room-v1:${room}`, JSON.stringify({ role: "guest", token: guestToken, name: "Guest", seats: [], packet }))
    const oldHostSave = hostCache.getItem(`indigo-room-v1:${room}`)
    const host = session(hostCache)
    host.join(room, "Host")
    await hub.flush()
    const guest = session(guestCache)
    guest.join(room, "Guest")
    await hub.flush()
    expect(host.role).toBe("host")
    expect(guest.me).toBe(PlayerId.Player2)
    expect(host.members).toHaveLength(2)
    expect(host.tile).toBe(original.move[1])
    expect(guest.tile).toBeTruthy()
    expect(board(guest)).toEqual(board(host))
    expect(board(host).routes).toEqual(original.routes)
    expect(board(host).stones).toEqual(original.stones)
    expect(hostCache.getItem(`indigo-room-v1:${room}`)).toBe(oldHostSave)
    expect(saved(guest).packet.protocol).toBe(2)
    expect(saved(guest).packet.game).not.toHaveProperty("deck")
    place(host)
    await hub.flush()
    expect(guest.game!.canPlay).toBe(true)
    legacy.dispose()
})

test.each([2, 3, 4])("a %i-player online game ends with matching stones, scores and winners in every browser", async count => {
    let seed = count
    jest.spyOn(Math, "random").mockImplementation(() => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed / 4294967296
    })
    const { host, guests } = await setup(count)
    const all = [host, ...guests]
    for (let turn = 0; turn < 54 && !host.game!.finished; turn++) {
        const current = all.find(room => room.me === host.game!.playerMove[0])!
        const game = current.game!
        const name = game.currentTileName!
        const options: [string, RouteTiles][] = []
        Object.keys(game.tiles).forEach(id => tileNameToAngle[name].forEach(angle => {
            const route = name === "c" ? RouteTiles.c : RouteTiles[`${name}-${angle}` as keyof typeof RouteTiles]
            if (!placementError(game.tiles, id, route)) options.push([id, route])
        }))
        expect(options.length).toBeGreaterThan(0)
        expect(current.canPlay).toBe(true)
        current.submit(...options[Math.floor(Math.random() * options.length)])
        await hub.flush()
        const state = snapshot(host.game!)
        expect(isSnapshot(state)).toBe(true)
        guests.forEach(guest => expect(board(guest)).toEqual(board(host)))
        const dealer = saved(host).dealer
        const held = Object.values(dealer.hands).filter(Boolean).length
        const placed = board(host).routes.filter(tile => tile.length > 2).length
        expect(dealer.deck.length + held + placed).toBe(54)
    }
    all.forEach(room => {
        expect(room.game!.finished).toBe(true)
        expect(room.game!.canPlay).toBe(false)
        expect(room.game!.winners).toEqual(host.game!.winners)
    })
})
