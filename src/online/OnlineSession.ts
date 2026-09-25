import { makeAutoObservable, observable, runInAction } from "mobx"
import { Store } from "../Storage/Store/Store"
import { commitMove } from "../Storage/Store/applyers/applySit"
import { tileNameToAngle } from "../Storage/Store/maps/TileNameToAngle"
import { resolveMove } from "../game/rules"
import { PlayerId, RouteTiles } from "../types"
import { Channel, createPeer, PeerEndpoint, PeerFactory } from "./transport"
import { clone, GameSnapshot, isRecord, isSnapshot, playerIds, restoreSnapshot, snapshot } from "./snapshot"
import { i18n } from "../i18n/i18n"

const PROTOCOL = 1
const HEARTBEAT_MS = 3000
const TIMEOUT_MS = 15000
const key = (room: string) => `indigo-room-v1:${room}`
const browserStorage = {
    getItem: (name: string) => localStorage.getItem(name),
    setItem: (name: string, value: string) => localStorage.setItem(name, value),
}
export const validRoom = (room: string) => /^[a-f0-9]{32}$/.test(room)
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("")
const cleanName = (name: string) => name.trim().replace(/\s+/g, " ").slice(0, 24) || i18n("online.player")

export interface Member { id: PlayerId, name: string, online: boolean }
interface Seat { id: PlayerId, token: string }
interface Move { type: "move", revision: number, moveId: string, cell: string, route: RouteTiles }
interface Packet {
    type: "state"
    protocol: number
    room: string
    revision: number
    started: boolean
    members: Member[]
    game: GameSnapshot | null
    lastMove?: { cell: string, route: RouteTiles, moveId: string }
}
interface SavedRoom { role: "host" | "guest", token: string, name: string, seats: Seat[], packet: Packet }
interface Link { channel: Channel, seen: number, player: PlayerId | null }

const isPacket = (data: unknown, room: string): data is Packet => {
    if (!isRecord(data)) return false
    return data.type === "state" && data.protocol === PROTOCOL && data.room === room &&
        Number.isSafeInteger(data.revision) && data.revision >= 0 && typeof data.started === "boolean" &&
        Array.isArray(data.members) && data.members.length >= 1 && data.members.length <= 4 &&
        data.members.every((m, i) => isRecord(m) && m.id === playerIds[i] && typeof m.name === "string" &&
            m.name.length <= 24 && typeof m.online === "boolean") &&
        (data.started ? isSnapshot(data.game) && data.game.players.length === data.members.length : data.game === null)
}

export class OnlineSession {
    setup = false
    inviteRoom = ""
    room = ""
    role: "host" | "guest" = "guest"
    me: PlayerId | null = null
    game: Store | null = null
    members: Member[] = []
    started = false
    status: "connecting" | "connected" | "disconnected" | "error" = "disconnected"
    error = ""
    saveFailed = false
    pending = false
    revision = 0
    resumeRoom = ""

    private token = ""
    private name = ""
    private seats: Seat[] = []
    private state: GameSnapshot | null = null
    private lastMove: Packet["lastMove"]
    private peer: PeerEndpoint | null = null
    private links = new Map<Channel, Link>()
    private host: Channel | null = null
    private timer: ReturnType<typeof setInterval> | undefined
    private retry: ReturnType<typeof setTimeout> | undefined
    private generation = 0
    private openedAt = 0
    private pendingAt = 0

    constructor(private factory: PeerFactory = createPeer, private persistence: Pick<Storage, "getItem" | "setItem"> = browserStorage) {
        makeAutoObservable<this, "factory" | "persistence" | "peer" | "links" | "host" | "timer" | "retry" | "generation" | "openedAt" | "pendingAt" | "state" | "seats" | "token" | "name" | "lastMove">(this, {
            game: observable.ref, factory: false, persistence: false, peer: false, links: false, host: false, timer: false, retry: false,
            generation: false, openedAt: false, pendingAt: false, state: false, seats: false, token: false, name: false, lastMove: false,
        }, { autoBind: true })
        try { this.resumeRoom = this.persistence.getItem("indigo-last-room") || "" } catch { /* Storage may be unavailable. */ }
    }

    get active() { return this.setup || !!this.room }
    get invitation() { return `${window.location.origin}${window.location.pathname}#/room/${this.room}` }
    get allOnline() { return this.members.length >= 2 && this.members.every(member => member.online) }
    get canPlay() {
        return this.status === "connected" && this.started && this.allOnline && !this.pending &&
            this.me !== null && this.game?.playerMove[0] === this.me
    }

    boot() {
        const match = window.location.hash.match(/^#\/room\/([a-f0-9]{32})$/)
        if (!match) return
        this.inviteRoom = match[1]
        const saved = this.readSaved(match[1])
        if (saved) this.enter(match[1], saved.role, saved.name, saved)
        else this.setup = true
    }

    openSetup() { this.setup = true }

    create(name: string) {
        this.enter(uid(), "host", name)
    }

    join(roomOrLink: string, name: string) {
        const room = roomOrLink.trim().split("/room/").pop() || ""
        if (!validRoom(room)) { this.error = i18n("online.invalidLink"); return }
        const saved = this.readSaved(room)
        this.enter(room, saved?.role || "guest", name, saved || undefined)
    }

    resume() {
        const saved = this.readSaved(this.resumeRoom)
        if (saved) this.enter(this.resumeRoom, saved.role, saved.name, saved)
        else this.error = i18n("online.noSaved")
    }

    private readSaved(room: string): SavedRoom | null {
        try {
            const saved = JSON.parse(this.persistence.getItem(key(room)) || "null")
            if (!isRecord(saved) || !["host", "guest"].includes(saved.role) || typeof saved.token !== "string" ||
                !validRoom(saved.token) || typeof saved.name !== "string" || !isPacket(saved.packet, room) ||
                !Array.isArray(saved.seats) || !saved.seats.every(s => isRecord(s) && playerIds.includes(s.id) &&
                    typeof s.token === "string" && validRoom(s.token))) return null
            return saved as unknown as SavedRoom
        } catch { return null }
    }

    private enter(room: string, role: "host" | "guest", name: string, saved?: SavedRoom) {
        this.stopTransport()
        this.game?.dispose()
        this.room = room
        this.role = role
        this.token = saved?.token || uid()
        this.name = cleanName(name)
        this.me = role === "host" ? PlayerId.Player1 : null
        this.setup = false
        this.error = ""
        this.pending = false
        this.started = saved?.packet.started || false
        this.revision = saved?.packet.revision ?? 0
        this.state = saved?.packet.game || null
        this.lastMove = undefined
        this.seats = saved?.seats || [{ id: PlayerId.Player1, token: this.token }]
        this.members = saved?.packet.members.map(member => ({ ...member, online: false })) ||
            [{ id: PlayerId.Player1, name: this.name, online: false }]
        this.game = new Store(`game-online-v1:${room}:${this.token}`)
        this.game.online = this
        if (this.state) restoreSnapshot(this.game, this.state)
        this.resumeRoom = room
        window.history.replaceState(null, "", `#/room/${room}`)
        this.persist()
        void this.connect()
    }

    private packet(): Packet {
        return clone({ type: "state", protocol: PROTOCOL, room: this.room, revision: this.revision,
            started: this.started, members: this.members, game: this.state, lastMove: this.lastMove })
    }

    private persist() {
        try {
            this.persistence.setItem(key(this.room), JSON.stringify({ role: this.role, token: this.token, name: this.name,
                seats: this.role === "host" ? this.seats : [], packet: this.packet() }))
            this.persistence.setItem("indigo-last-room", this.room)
            this.saveFailed = false
        } catch { this.saveFailed = true }
    }

    private send(channel: Channel, message: unknown) {
        try { if (channel.open) channel.send(message) } catch { this.drop(channel) }
    }

    private publish() {
        this.revision++
        this.persist()
        const packet = this.packet()
        this.links.forEach(link => { if (link.player) this.send(link.channel, packet) })
    }

    async connect() {
        this.stopTransport()
        if (!this.room) return
        this.status = "connecting"
        this.error = ""
        this.pending = false
        this.members = this.members.map(m => ({ ...m, online: false }))
        this.openedAt = Date.now()
        const generation = this.generation
        this.timer = setInterval(this.tick, HEARTBEAT_MS)
        try {
            const peer = await this.factory(this.role === "host" ? `indigo-${this.room}` : undefined)
            if (this.generation !== generation) { peer.destroy(); return }
            runInAction(() => { this.peer = peer })
            const current = () => this.generation === generation
            peer.on("open", () => {
                if (!current()) return
                runInAction(() => {
                    if (this.role === "host") {
                        this.status = "connected"
                        this.members[0].online = true
                        this.publish()
                    } else this.attach(peer.connect(`indigo-${this.room}`), true)
                })
            })
            peer.on("connection", channel => {
                if (current() && this.role === "host") this.attach(channel, false)
                else channel.close()
            })
            peer.on("error", error => {
                if (!current()) return
                const fatal = error?.type === "unavailable-id" || error?.type === "browser-incompatible"
                this.disconnect(i18n(fatal ? "online.unavailable" : "online.connectFailed"), !fatal)
            })
            peer.on("disconnected", () => { if (current()) this.disconnect(i18n("online.signalLost"), true) })
            peer.on("close", () => { if (current()) this.disconnect(i18n("online.closed"), true) })
        } catch {
            if (this.generation === generation) this.disconnect(i18n("online.loadFailed"), true)
        }
    }

    private attach(channel: Channel, host: boolean) {
        const generation = this.generation
        this.links.set(channel, { channel, player: null, seen: Date.now() })
        if (host) this.host = channel
        channel.on("open", () => {
            if (generation !== this.generation) return
            if (host) this.send(channel, { type: "hello", protocol: PROTOCOL, token: this.token, name: this.name })
        })
        channel.on("data", data => {
            if (generation !== this.generation || !this.links.has(channel)) return
            this.receive(channel, data)
        })
        channel.on("close", () => { if (generation === this.generation) this.drop(channel) })
        channel.on("error", () => { if (generation === this.generation) this.drop(channel) })
    }

    private receive(channel: Channel, data: unknown) {
        const link = this.links.get(channel)
        if (!link || !isRecord(data)) return
        link.seen = Date.now()
        if (data.type === "ping") { this.send(channel, { type: "pong" }); return }
        if (data.type === "pong") return
        if (this.role === "host") {
            if (data.type === "hello") {
                if (data.protocol !== PROTOCOL || typeof data.token !== "string" || !validRoom(data.token) || typeof data.name !== "string") {
                    this.send(channel, { type: "rejected", reason: "online.version" }); return
                }
                if (link.player) return
                let seat = this.seats.find(s => s.token === data.token)
                if (seat?.id === PlayerId.Player1) {
                    this.send(channel, { type: "rejected", reason: "online.hostTaken" }); return
                }
                if (!seat) {
                    if (this.started || this.members.length >= 4) {
                        this.send(channel, { type: "rejected", reason: this.started ? "online.started" : "online.full" }); return
                    }
                    seat = { id: playerIds[this.members.length], token: data.token }
                    this.seats.push(seat)
                    this.members.push({ id: seat.id, name: cleanName(data.name), online: true })
                }
                const previous = Array.from(this.links.values()).find(other => other !== link && other.player === seat!.id)
                if (previous) { previous.player = null; previous.channel.close(); this.links.delete(previous.channel) }
                link.player = seat.id
                const member = this.members.find(m => m.id === seat!.id)!
                member.online = true
                if (!this.started) member.name = cleanName(data.name)
                this.send(channel, { type: "welcome", player: seat.id })
                this.publish()
            } else if (link.player && data.type === "sync") this.send(channel, this.packet())
            else if (link.player && data.type === "move") this.acceptMove(link.player, data, channel)
        } else if (channel === this.host) {
            if (data.type === "welcome" && playerIds.slice(1).includes(data.player)) this.me = data.player
            else if (data.type === "rejected") this.disconnect(i18n(["online.version", "online.hostTaken", "online.started", "online.full"].includes(data.reason) ? data.reason : "online.denied"), false)
            else if (data.type === "move-error") {
                this.pending = false
                this.error = i18n("online.moveRejected")
                this.send(channel, { type: "sync" })
            } else if (isPacket(data, this.room) && this.me) this.applyPacket(data)
        }
    }

    private applyPacket(packet: Packet) {
        if (packet.revision < this.revision || !this.game) return
        const changedGame = JSON.stringify(packet.game) !== JSON.stringify(this.state)
        let animation: ReturnType<typeof resolveMove> | null = null
        if (changedGame && this.state && packet.lastMove && packet.revision === this.revision + 1) {
            try { animation = resolveMove(this.game.tiles, this.game.stones, packet.lastMove.cell, packet.lastMove.route, this.game.playersStore.gateways) } catch { /* Reconnection uses a complete snapshot. */ }
        }
        if (packet.game && (changedGame || this.pending || this.status !== "connected")) {
            restoreSnapshot(this.game, packet.game)
            if (animation) this.game.animate(animation.frames, animation.awards, animation.collisions)
        }
        this.state = clone(packet.game)
        this.members = clone(packet.members)
        this.started = packet.started
        this.revision = packet.revision
        this.pending = false
        this.status = "connected"
        this.persist()
    }

    start() {
        if (this.role !== "host" || this.status !== "connected" || this.started || !this.allOnline || !this.game) return
        this.game.reset()
        this.game.playersStore.setPlayerCount(this.members.length as 2 | 3 | 4)
        this.members.forEach(member => this.game!.playersStore.setPlayerName(member.id, member.name))
        this.state = snapshot(this.game)
        this.started = true
        this.publish()
    }

    submit(cell: string, route: RouteTiles) {
        if (!this.canPlay || !this.game || this.game.animatedStones !== null) return
        const move: Move = { type: "move", revision: this.revision, moveId: uid(), cell, route }
        this.error = ""
        if (this.role === "host") this.acceptMove(PlayerId.Player1, move)
        else if (this.host?.open) {
            this.pending = true
            this.pendingAt = Date.now()
            this.send(this.host, move)
        }
    }

    private acceptMove(player: PlayerId, data: Record<string, any>, channel?: Channel) {
        const reject = () => {
            if (channel) { this.send(channel, { type: "move-error" }); this.send(channel, this.packet()) }
            else this.error = i18n("online.moveRejected")
        }
        const tile = this.state?.move[1]
        const allowed = tile ? tileNameToAngle[tile].map(angle => tile === "c" ? RouteTiles.c : RouteTiles[`${tile}-${angle}` as keyof typeof RouteTiles]) : []
        if (!this.game || !this.started || !this.allOnline || this.status !== "connected" ||
            this.state?.move[0] !== player || data.revision !== this.revision || typeof data.moveId !== "string" ||
            !validRoom(data.moveId) || typeof data.cell !== "string" || !allowed.includes(data.route)) { reject(); return }
        try {
            // Discard local previews. Only confirmed state and the authenticated sender determine the move.
            restoreSnapshot(this.game, this.state!)
            commitMove(this.game, data.cell, data.route)
            this.state = snapshot(this.game)
            this.lastMove = { cell: data.cell, route: data.route, moveId: data.moveId }
            this.publish()
        } catch { reject() }
    }

    private drop(channel: Channel) {
        const link = this.links.get(channel)
        if (!link) return
        this.links.delete(channel)
        channel.close()
        if (this.role === "guest" && channel === this.host) {
            this.disconnect(i18n("online.hostLost"), true)
        } else if (link.player) {
            const member = this.members.find(m => m.id === link.player)
            if (member) member.online = false
            this.publish()
        }
    }

    private tick() {
        const now = Date.now()
        if (this.status === "connecting" && now - this.openedAt > TIMEOUT_MS) {
            this.disconnect(i18n("online.timeout"), true)
            return
        }
        this.links.forEach(link => {
            if (now - link.seen > TIMEOUT_MS) this.drop(link.channel)
            else this.send(link.channel, { type: "ping" })
        })
        if (this.pending && now - this.pendingAt > 8000 && this.host) {
            this.pendingAt = now
            this.send(this.host, { type: "sync" })
        }
    }

    private disconnect(message: string, retry: boolean) {
        this.stopTransport()
        this.status = retry ? "disconnected" : "error"
        this.error = message
        this.pending = false
        this.members = this.members.map(m => ({ ...m, online: false }))
        if (retry) this.retry = setTimeout(() => { void this.connect() }, 4000)
    }

    private stopTransport() {
        this.generation++
        clearInterval(this.timer)
        clearTimeout(this.retry)
        this.links.forEach(link => link.channel.close())
        this.links.clear()
        this.peer?.destroy()
        this.peer = null
        this.host = null
    }

    leave() {
        this.stopTransport()
        this.game?.dispose()
        this.game = null
        this.room = ""
        this.inviteRoom = ""
        this.setup = false
        this.status = "disconnected"
        this.error = ""
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }

    dispose() {
        this.stopTransport()
        this.status = "disconnected"
        this.pending = false
        this.game?.dispose()
    }
}
