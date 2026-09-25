import { runInAction } from "mobx"
import { Store } from "../Storage/Store/Store"
import { applySit } from "../Storage/Store/applyers/applySit"
import { tileNameToAngle } from "../Storage/Store/maps/TileNameToAngle"
import { placementError } from "../game/rules"
import { PlayerId, RouteTiles } from "../types"
import { OnlineSession } from "./OnlineSession"
import { clone, isSnapshot, restoreSnapshot, snapshot } from "./snapshot"
import { Channel, PeerEndpoint, PeerFactory } from "./transport"

class MemoryStorage {
    values = new Map<string, string>()
    getItem = (key: string) => this.values.get(key) ?? null
    setItem = (key: string, value: string) => { this.values.set(key, value) }
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
const session = (storage = new MemoryStorage()) => {
    const room = new OnlineSession(hub.factory, storage)
    sessions.push(room)
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

test("four browsers share one deck, enforce turns, commit a full round and retain local saves", async () => {
    const local = new Store()
    local.playersStore.setPlayerCount(4)
    const localSave = localStorage.getItem("game-v2")
    const { host, guests } = await setup(4)
    const all = [host, ...guests]
    expect(host.members).toHaveLength(4)
    expect(host.members.every(member => member.online)).toBe(true)
    expect(all.map(room => room.game!.canPlay)).toEqual([true, false, false, false])
    guests.forEach(guest => expect(snapshot(guest.game!)).toEqual(snapshot(host.game!)))
    for (const current of all) {
        const before = host.revision
        place(current)
        if (current !== host) {
            expect(current.pending).toBe(true)
            expect(host.revision).toBe(before)
        }
        await hub.flush()
        expect(host.revision).toBe(before + 1)
        guests.forEach(guest => expect(snapshot(guest.game!)).toEqual(snapshot(host.game!)))
    }
    expect(host.game!.playerMove[0]).toBe(PlayerId.Player1)
    host.leave()
    expect(localStorage.getItem("game-v2")).toBe(localSave)
    expect(local.canPlay).toBe(true)
    local.dispose()
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
    const accepted = snapshot(host.game!)
    expect(host.game!.tiles[placement.cell].tile).toBe(placement.route)
    channel.send(original)
    await hub.flush()
    expect(snapshot(host.game!)).toEqual(accepted)
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
    expect(snapshot(restored.game!)).toEqual(snapshot(host.game!))
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
    const state = snapshot(host.game!)
    const room = host.room
    host.dispose()
    expect(guest.status).toBe("disconnected")
    const restored = session(persistence)
    restored.join(room, "Host")
    await hub.flush()
    expect(restored.role).toBe("host")
    expect(snapshot(restored.game!)).toEqual(state)
    expect(restored.allOnline).toBe(false)
    await guest.connect()
    await hub.flush()
    expect(restored.allOnline).toBe(true)
    expect(snapshot(guest.game!)).toEqual(state)
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
    const state = snapshot(host.game!)
    jest.advanceTimersByTime(9000)
    await hub.flush()
    expect(guest.pending).toBe(false)
    expect(snapshot(guest.game!)).toEqual(state)
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
        guests.forEach(guest => expect(snapshot(guest.game!)).toEqual(state))
    }
    all.forEach(room => {
        expect(room.game!.finished).toBe(true)
        expect(room.game!.canPlay).toBe(false)
        expect(room.game!.winners).toEqual(host.game!.winners)
    })
})
