import { makeAutoObservable, observable, reaction, runInAction } from "mobx"
import { Store } from "../Storage/Store/Store"
import { commitMove } from "../Storage/Store/applyers/applySit"
import { tileNameToAngle } from "../Storage/Store/maps/TileNameToAngle"
import { placementError, resolveMove } from "../game/rules"
import { Angle, HexType, PlayerId, RouteTiles, TileName } from "../types"
import { Channel, createPeer, PeerEndpoint, PeerFactory } from "./transport"
import { clone, isRecord, playerIds, privateView, PublicGameSnapshot, publicSnapshot, restoreSnapshot, snapshot } from "./snapshot"
import { i18n } from "../i18n/i18n"
import { DealerState, dealHands, isPacket, isSavedRoom, Member, migrateSavedRoom, Packet, PROTOCOL, SavedRoom, Seat, validRoom } from "./protocol"
import { RoomMode, TableAction, TableCursor, TableView } from "./table"

const HEARTBEAT_MS = 3000
const TIMEOUT_MS = 15000
const CLOSE_TIMEOUT_MS = 2500
const key = (room: string) => `indigo-room-v2:${room}`
const closedKey = (room: string) => `indigo-room-closed:${room}`
const browserStorage = {
    getItem: (name: string) => localStorage.getItem(name),
    setItem: (name: string, value: string) => localStorage.setItem(name, value),
    removeItem: (name: string) => localStorage.removeItem(name),
    key: (index: number) => localStorage.key(index),
    get length() { return localStorage.length },
}
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("")
const cleanName = (name: string) => name.trim().replace(/\s+/g, " ").slice(0, 24) || i18n("online.player")

interface Move { type: "move", revision: number, moveId: string, cell: string, route: RouteTiles }
interface Link { channel: Channel, seen: number, player: PlayerId | null }

export class OnlineSession {
    setup = false
    inviteRoom = ""
    room = ""
    mode: RoomMode = "online"
    role: "host" | "guest" = "guest"
    me: PlayerId | null = null
    tile: TileName | null = null
    game: Store | null = null
    members: Member[] = []
    started = false
    status: "connecting" | "connected" | "disconnected" | "error" | "closed" = "disconnected"
    error = ""
    saveFailed = false
    pending = false
    revision = 0
    resumeRoom = ""
    table: TableView | null = null
    cursor: TableCursor | null = null

    private token = ""
    private name = ""
    private seats: Seat[] = []
    private state: PublicGameSnapshot | null = null
    private dealer: DealerState | null = null
    private lastMove: Packet["lastMove"]
    private peer: PeerEndpoint | null = null
    private links = new Map<Channel, Link>()
    private host: Channel | null = null
    private timer: ReturnType<typeof setInterval> | undefined
    private retry: ReturnType<typeof setTimeout> | undefined
    private closeTimer: ReturnType<typeof setTimeout> | undefined
    private generation = 0
    private openedAt = 0
    private pendingAt = 0
    private stopTableReaction: (() => void) | undefined

    constructor(private factory: PeerFactory = createPeer, private persistence: Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length"> = browserStorage) {
        makeAutoObservable<this, "factory" | "persistence" | "peer" | "links" | "host" | "timer" | "retry" | "closeTimer" | "generation" | "openedAt" | "pendingAt" | "state" | "dealer" | "seats" | "token" | "name" | "lastMove" | "stopTableReaction">(this, {
            game: observable.ref, factory: false, persistence: false, peer: false, links: false, host: false, timer: false, retry: false,
            closeTimer: false,
            stopTableReaction: false,
            generation: false, openedAt: false, pendingAt: false, state: observable.ref, dealer: false, seats: false, token: false, name: false, lastMove: false,
        }, { autoBind: true })
        try { this.resumeRoom = this.persistence.getItem("indigo-last-room") || "" } catch { /* Storage may be unavailable. */ }
        if (this.wasClosed(this.resumeRoom)) this.eraseRoom(this.resumeRoom)
    }

    get active() { return this.setup || !!this.room }
    get invitation() { return `${window.location.origin}${window.location.pathname}#/${this.isSharedTable ? "table" : "room"}/${this.room}` }
    get isSharedTable() { return this.mode === "table" }
    get isController() { return this.isSharedTable && this.role === "guest" }
    get turn() { return this.isController ? this.table?.turn ?? null : this.game?.playerMove[0] ?? null }
    get finished() { return this.isController ? this.table?.finished ?? false : this.game?.finished ?? false }
    get allOnline() { return this.members.length >= 2 && this.members.every(member => member.online) }
    get remaining() { return this.isController ? this.table?.remaining ?? 0 : this.state?.remaining ?? 0 }
    get canPlay() {
        return this.status === "connected" && this.started && this.allOnline && !this.pending &&
            this.me !== null && this.turn === this.me && (this.isController
                ? !!this.table?.hand.length && !this.table.finished && !this.table.busy
                : this.tile !== null)
    }

    boot() {
        const match = window.location.hash.match(/^#\/(room|table)\/([a-f0-9]{32})$/)
        if (!match) return
        this.mode = match[1] === "table" ? "table" : "online"
        this.inviteRoom = match[2]
        if (this.wasClosed(match[2])) { this.showClosed(match[2]); return }
        const saved = this.readSaved(match[2])
        if (saved) this.enter(match[2], saved.role, saved.name, saved)
        else this.setup = true
    }

    openSetup(mode: RoomMode = "online") { this.mode = mode; this.setup = true }

    create(name: string, mode: RoomMode = this.mode) {
        this.mode = mode
        this.enter(uid(), "host", name)
    }

    join(roomOrLink: string, name: string) {
        const input = roomOrLink.trim()
        const link = input.match(/#\/(room|table)\/([a-f0-9]{32})$/)
        const room = link?.[2] ?? input
        if (!validRoom(room)) { this.error = i18n("online.invalidLink"); return }
        if (link) this.mode = link[1] === "table" ? "table" : "online"
        if (this.wasClosed(room)) { this.showClosed(room); return }
        const saved = this.readSaved(room)
        this.enter(room, saved?.role || "guest", name, saved || undefined)
    }

    resume() {
        if (this.wasClosed(this.resumeRoom)) { this.showClosed(this.resumeRoom); return }
        const saved = this.readSaved(this.resumeRoom)
        if (saved) this.enter(this.resumeRoom, saved.role, saved.name, saved)
        else this.error = i18n("online.noSaved")
    }

    private readSaved(room: string): SavedRoom | null {
        if (this.wasClosed(room)) return null
        try {
            const saved = JSON.parse(this.persistence.getItem(key(room)) || "null")
            if (isSavedRoom(saved, room)) return saved
            if (saved !== null) return null
            return migrateSavedRoom(JSON.parse(this.persistence.getItem(`indigo-room-v1:${room}`) || "null"), room)
        } catch { return null }
    }

    private enter(room: string, role: "host" | "guest", name: string, saved?: SavedRoom) {
        this.stopTransport()
        this.stopTableReaction?.()
        this.stopTableReaction = undefined
        this.game?.dispose()
        this.room = room
        this.role = role
        this.mode = saved?.packet.mode ?? (saved ? "online" : this.mode)
        this.token = saved?.token || uid()
        this.name = cleanName(name)
        this.me = role === "host" ? (this.isSharedTable ? null : PlayerId.Player1) : saved?.packet.player ?? null
        this.tile = saved?.packet.tile ?? null
        this.table = saved?.packet.table ?? null
        this.cursor = role === "host" && this.table?.cursor ? { cell: this.table.cursor.cell, slot: this.table.cursor.slot, angle: this.table.cursor.angle } : null
        this.setup = false
        this.status = "connecting"
        this.error = ""
        this.pending = false
        this.started = saved?.packet.started || false
        this.revision = saved?.packet.revision ?? 0
        this.state = saved?.packet.game || null
        this.dealer = role === "host" ? saved?.dealer ?? null : null
        this.lastMove = undefined
        this.seats = saved?.seats || (role === "host" && !this.isSharedTable ? [{ id: PlayerId.Player1, token: this.token }] : [])
        this.members = saved?.packet.members.map(member => ({ ...member, online: false })) ||
            (this.isSharedTable ? [] : [{ id: PlayerId.Player1, name: this.name, online: false }])
        this.game = new Store(`game-online-v2:${room}:${this.token}`)
        this.game.online = this
        // The rendering store never holds the draw pile or an opponent's unplayed tile.
        this.game.leftTiles = []
        this.game.storage.set("tiles-left", [])
        if (this.state) restoreSnapshot(this.game, privateView(this.state, this.me, this.tile))
        if (this.isSharedTable && role === "host") {
            this.stopTableReaction = reaction(() => [this.game?.animatedStones !== null, this.game?.orientationType], () => {
                if (this.started && this.status === "connected") {
                    this.persist()
                    this.links.forEach(link => { if (link.player) this.send(link.channel, this.packet(link.player)) })
                }
            })
        }
        this.resumeRoom = room
        window.history.replaceState(null, "", `#/${this.isSharedTable ? "table" : "room"}/${room}`)
        this.persist()
        void this.connect()
    }

    private packet(player = this.me): Packet {
        if (this.isSharedTable) return clone({ type: "state", protocol: PROTOCOL, room: this.room, revision: this.revision,
            mode: "table", started: this.started, members: this.members, player, tile: null,
            game: this.role === "host" && player === null ? this.state : null,
            table: this.role === "host" ? this.tableView(player) : this.table ?? this.tableView(null) })
        return clone({ type: "state", protocol: PROTOCOL, room: this.room, revision: this.revision,
            started: this.started, members: this.members, game: this.state, lastMove: this.lastMove,
            player, tile: this.role === "host" ? (player && this.dealer?.hands[player]) ?? null : this.tile })
    }

    private persist() {
        if (this.status === "closed" || this.wasClosed(this.room)) return
        try {
            this.persistence.setItem(key(this.room), JSON.stringify({ role: this.role, token: this.token, name: this.name,
                seats: this.role === "host" ? this.seats : [], packet: this.packet(),
                ...(this.role === "host" ? { dealer: this.dealer } : {}) }))
            this.persistence.setItem("indigo-last-room", this.room)
            this.saveFailed = false
        } catch { this.saveFailed = true }
    }

    private send(channel: Channel, message: unknown) {
        try { if (channel.open) channel.send(message) } catch { this.drop(channel) }
    }

    private publish() {
        if (this.status === "closed") return
        this.revision++
        this.persist()
        this.links.forEach(link => { if (link.player) this.send(link.channel, this.packet(link.player)) })
    }

    async connect() {
        if (this.status === "closed") return
        if (this.wasClosed(this.room)) { this.showClosed(this.room); return }
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
                if (!current() || this.status === "closed") return
                runInAction(() => {
                    if (this.role === "host") {
                        this.status = "connected"
                        if (!this.isSharedTable) this.members[0].online = true
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
            if (this.status === "closed") this.sendClosed(channel)
            else if (host) this.send(channel, { type: "hello", protocol: PROTOCOL, mode: this.mode, token: this.token, name: this.name })
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
        if (this.role === "guest" && channel === this.host && data.type === "room-closed" &&
            data.protocol === PROTOCOL && data.room === this.room) {
            this.markClosed()
            // Let the host close the channel after receiving the acknowledgement.
            this.send(channel, { type: "room-closed-ack", protocol: PROTOCOL, room: this.room })
            return
        }
        if (this.status === "closed") {
            if (this.role === "host" && data.type === "room-closed-ack" && data.protocol === PROTOCOL && data.room === this.room) this.drop(channel)
            else if (this.role === "host" && (data.type === "hello" || data.type === "sync")) this.sendClosed(channel)
            return
        }
        if (data.type === "ping") { this.send(channel, { type: "pong" }); return }
        if (data.type === "pong") return
        if (this.role === "host") {
            if (data.type === "hello") {
                if (data.protocol !== PROTOCOL || (data.mode ?? "online") !== this.mode || typeof data.token !== "string" || !validRoom(data.token) || typeof data.name !== "string") {
                    this.send(channel, { type: "rejected", reason: "online.version" }); return
                }
                if (link.player) return
                let seat = this.seats.find(s => s.token === data.token)
                if ((!this.isSharedTable && seat?.id === PlayerId.Player1) || data.token === this.token) {
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
            } else if (link.player && data.type === "sync") this.send(channel, this.packet(link.player))
            else if (link.player && data.type === "table-command") this.acceptTableCommand(link.player, data, channel)
            else if (link.player && data.type === "move") this.acceptMove(link.player, data, channel)
        } else if (channel === this.host) {
            if (data.type === "welcome" && (this.isSharedTable ? playerIds : playerIds.slice(1)).includes(data.player)) this.me = data.player
            else if (data.type === "rejected") this.disconnect(i18n(["online.version", "online.hostTaken", "online.started", "online.full"].includes(data.reason) ? data.reason : "online.denied"), false)
            else if (data.type === "move-error") {
                this.pending = false
                this.error = i18n("online.moveRejected")
                this.send(channel, { type: "sync" })
            } else if (isPacket(data, this.room) && (data.mode ?? "online") === this.mode && this.me && data.player === this.me) this.applyPacket(data)
        }
    }

    private applyPacket(packet: Packet) {
        if (packet.revision < this.revision || !this.game) return
        if (this.isController && packet.table) {
            this.table = clone(packet.table)
            this.members = clone(packet.members)
            this.started = packet.started
            this.revision = packet.revision
            this.pending = false
            this.status = "connected"
            this.persist()
            return
        }
        const changedGame = JSON.stringify(packet.game) !== JSON.stringify(this.state)
        let animation: ReturnType<typeof resolveMove> | null = null
        if (changedGame && this.state && packet.lastMove && packet.revision === this.revision + 1) {
            try { animation = resolveMove(this.game.tiles, this.game.stones, packet.lastMove.cell, packet.lastMove.route, this.game.playersStore.gateways) } catch { /* Reconnection uses a complete snapshot. */ }
        }
        if (packet.game && (changedGame || packet.tile !== this.tile || this.pending || this.status !== "connected")) {
            restoreSnapshot(this.game, privateView(packet.game, this.me, packet.tile))
            if (animation) this.game.animate(animation.frames, animation.awards, animation.collisions)
        }
        this.state = clone(packet.game)
        this.lastMove = packet.lastMove ? clone(packet.lastMove) : undefined
        this.tile = packet.tile
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
        this.dealer = dealHands(snapshot(this.game))
        if (this.isSharedTable) {
            const initial = snapshot(this.game)
            const deck = [...initial.deck, initial.move[1]!]
            this.dealer = { deck, hands: {}, tableHands: {} }
            this.members.forEach(member => { this.dealer!.tableHands![member.id] = [deck.pop()!, deck.pop()!] })
            this.tile = null
        } else this.tile = this.dealer.hands[PlayerId.Player1] ?? null
        this.state = publicSnapshot(this.game, this.dealer.deck.length)
        restoreSnapshot(this.game, privateView(this.state, this.me, this.tile))
        if (this.isSharedTable) this.resetCursor()
        this.started = true
        this.publish()
    }

    submit(cell: string, route: RouteTiles) {
        if (this.isSharedTable) return
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
        if (this.isSharedTable) return
        const reject = () => {
            if (channel) { this.send(channel, { type: "move-error" }); this.send(channel, this.packet(player)) }
            else this.error = i18n("online.moveRejected")
        }
        const tile = this.dealer?.hands[player]
        const allowed = tile ? tileNameToAngle[tile].map(angle => tile === "c" ? RouteTiles.c : RouteTiles[`${tile}-${angle}` as keyof typeof RouteTiles]) : []
        if (!this.game || !this.started || !this.allOnline || this.status !== "connected" ||
            this.state?.turn !== player || data.revision !== this.revision || typeof data.moveId !== "string" ||
            !validRoom(data.moveId) || typeof data.cell !== "string" || !allowed.includes(data.route)) { reject(); return }
        try {
            // Discard local previews. Only confirmed state and the authenticated sender determine the move.
            restoreSnapshot(this.game, privateView(this.state!, this.me, this.tile))
            commitMove(this.game, data.cell, data.route, () => this.advanceHand(player))
            this.state = publicSnapshot(this.game, this.dealer!.deck.length)
            this.lastMove = { cell: data.cell, route: data.route, moveId: data.moveId }
            this.publish()
        } catch { reject() }
    }

    private advanceHand(player: PlayerId) {
        const game = this.game!
        const dealer = this.dealer!
        dealer.hands[player] = game.finished ? null : dealer.deck.pop() ?? null
        this.tile = dealer.hands[this.me!] ?? null
        if (game.finished) {
            game.playerMove = [player]
            return
        }
        const index = this.members.findIndex(member => member.id === player)
        const next = [...this.members.slice(index + 1), ...this.members.slice(0, index + 1)]
            .find(member => dealer.hands[member.id])?.id ?? player
        game.playerMove = next === this.me && this.tile ? [next, this.tile, 0] : [next]
    }

    private tableRoute(player: PlayerId) {
        const tile = this.dealer?.tableHands?.[player]?.[this.cursor?.slot ?? 0]
        if (!tile || !this.cursor) return undefined
        return tile === "c" ? RouteTiles.c : RouteTiles[`${tile}-${this.cursor.angle}` as keyof typeof RouteTiles]
    }

    private tableView(player: PlayerId | null): TableView {
        const finished = !!this.started && !!this.game?.finished
        const turn = this.started ? this.state?.turn ?? null : null
        const route = turn ? this.tableRoute(turn) : undefined
        return clone({
            turn, remaining: this.state?.remaining ?? 0, finished,
            busy: !!this.game?.animatedStones, orientation: this.game?.orientationType ?? "flat",
            hand: player ? this.dealer?.tableHands?.[player] ?? [] : [],
            stones: player ? this.state?.players.find(p => p.id === player)?.stones ?? [] : [],
            cursor: !finished && this.cursor && (player === null || player === turn) ? {
                ...this.cursor, valid: route !== undefined && !!this.game && !placementError(this.game.tiles, this.cursor.cell, route),
            } : null,
            results: finished ? this.state?.players ?? null : null,
        })
    }

    private resetCursor() {
        const game = this.game!
        const cell = ["1,0", ...Object.keys(game.tiles)].find(id => game.tiles[id]?.type === HexType.route && game.tiles[id].tile === undefined)
        this.cursor = !game.finished && cell ? { cell, slot: 0, angle: 0 } : null
    }

    control(action: TableAction, value = 0) {
        if (!this.isController || !this.canPlay || !this.host?.open) return
        this.pending = true
        this.pendingAt = Date.now()
        this.error = ""
        this.send(this.host, { type: "table-command", action, value, revision: this.revision, moveId: uid() })
    }

    private acceptTableCommand(player: PlayerId, data: Record<string, any>, channel: Channel) {
        if (!this.isSharedTable) return
        const reject = () => {
            this.send(channel, { type: "move-error" })
            this.send(channel, this.packet(player))
        }
        const game = this.game
        const hand = this.dealer?.tableHands?.[player]
        if (!game || !this.started || game.finished || game.animatedStones || !this.allOnline ||
            this.status !== "connected" || this.state?.turn !== player || data.revision !== this.revision ||
            typeof data.moveId !== "string" || !validRoom(data.moveId) || !this.cursor || !hand?.length) { reject(); return }
        const cursor = this.cursor
        if (data.action === "step" && Number.isInteger(data.value) && data.value >= 0 && data.value < 6) {
            const next = game.tiles[cursor.cell].hex.neighbor(data.value).id
            if ([HexType.route, HexType.treasure].includes(game.tiles[next]?.type)) this.cursor = { ...cursor, cell: next }
        } else if (data.action === "select" && Number.isInteger(data.value) && data.value >= 0 && data.value < hand.length) {
            this.cursor = { ...cursor, slot: data.value, angle: 0 }
        } else if (data.action === "rotate" && [-1, 1].includes(data.value)) {
            const angles = tileNameToAngle[hand[cursor.slot]]
            this.cursor = { ...cursor, angle: angles[(angles.indexOf(cursor.angle) + data.value + angles.length) % angles.length] as Angle }
        } else if (data.action === "place") {
            const route = this.tableRoute(player)
            if (route === undefined || placementError(game.tiles, cursor.cell, route)) { reject(); return }
            try {
                commitMove(game, cursor.cell, route, () => {
                    hand.splice(cursor.slot, 1)
                    const replacement = !game.finished ? this.dealer!.deck.pop() : undefined
                    if (replacement) hand.push(replacement)
                    const index = this.members.findIndex(member => member.id === player)
                    const next = game.finished ? player : [...this.members.slice(index + 1), ...this.members.slice(0, index + 1)]
                        .find(member => this.dealer!.tableHands![member.id]?.length)?.id ?? player
                    game.playerMove = [next]
                })
                this.state = publicSnapshot(game, this.dealer!.deck.length)
                this.resetCursor()
            } catch { reject(); return }
        } else { reject(); return }
        this.publish()
    }

    private drop(channel: Channel) {
        const link = this.links.get(channel)
        if (!link) return
        this.links.delete(channel)
        channel.close()
        if (this.status === "closed") {
            if (!this.links.size) this.stopTransport()
        } else if (this.role === "guest" && channel === this.host) {
            this.disconnect(i18n("online.hostLost"), true)
        } else if (link.player) {
            const member = this.members.find(m => m.id === link.player)
            if (member) member.online = false
            this.publish()
        }
    }

    private tick() {
        if (this.status === "closed") return
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
        if (this.status === "closed") return
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
        clearTimeout(this.closeTimer)
        this.links.forEach(link => link.channel.close())
        this.links.clear()
        this.peer?.destroy()
        this.peer = null
        this.host = null
    }

    private wasClosed(room: string) {
        if (!validRoom(room)) return false
        try { return this.persistence.getItem(closedKey(room)) !== null } catch { return false }
    }

    private eraseRoom(room: string) {
        if (!validRoom(room)) return false
        try {
            const keys = Array.from({ length: this.persistence.length }, (_, index) => this.persistence.key(index))
            keys.forEach(name => {
                if (name && (name === key(room) || name === `indigo-room-v1:${room}` ||
                    name.startsWith(`game-online-v1:${room}:`) || name.startsWith(`game-online-v2:${room}:`))) {
                    this.persistence.removeItem(name)
                }
            })
            if (this.persistence.getItem("indigo-last-room") === room) this.persistence.removeItem("indigo-last-room")
            if (this.resumeRoom === room) this.resumeRoom = ""
            return true
        } catch {
            this.error = i18n("online.forgetFailed")
            this.saveFailed = true
            return false
        }
    }

    forgetRoom() {
        const room = this.room || this.resumeRoom
        if (!validRoom(room)) return
        // Stop callbacks before deleting data so a late snapshot cannot recreate the save.
        if (room === this.room) this.leave()
        this.saveFailed = false
        if (!this.eraseRoom(room)) this.setup = true
    }

    private sendClosed(channel: Channel) {
        this.send(channel, { type: "room-closed", protocol: PROTOCOL, room: this.room })
    }

    private markClosed() {
        this.status = "closed"
        this.pending = false
        this.error = ""
        this.tile = null
        this.dealer = null
        this.state = null
        this.game?.stopAnimation()
        this.members = this.members.map(member => ({ ...member, online: false }))
        clearInterval(this.timer)
        clearTimeout(this.retry)
        let marked = true
        try { this.persistence.setItem(closedKey(this.room), "1") } catch { marked = false }
        const erased = this.eraseRoom(this.room)
        this.saveFailed = !marked || !erased
        // Closing immediately after send() can discard the final WebRTC message.
        clearTimeout(this.closeTimer)
        this.closeTimer = setTimeout(this.stopTransport, CLOSE_TIMEOUT_MS)
    }

    closeRoom() {
        if (this.role !== "host" || !this.room || this.status === "closed") return
        this.markClosed()
        this.links.forEach(link => this.sendClosed(link.channel))
        if (!this.links.size) this.stopTransport()
    }

    private showClosed(room: string) {
        this.leave()
        this.room = room
        this.status = "closed"
        this.eraseRoom(room)
    }

    leave() {
        this.stopTransport()
        this.stopTableReaction?.()
        this.stopTableReaction = undefined
        this.game?.dispose()
        this.game = null
        this.tile = null
        this.table = null
        this.cursor = null
        this.dealer = null
        this.state = null
        this.seats = []
        this.me = null
        this.token = ""
        this.name = ""
        this.lastMove = undefined
        this.members = []
        this.started = false
        this.pending = false
        this.room = ""
        this.inviteRoom = ""
        this.setup = false
        this.status = "disconnected"
        this.error = ""
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }

    dispose() {
        this.stopTransport()
        this.stopTableReaction?.()
        this.status = "disconnected"
        this.pending = false
        this.game?.dispose()
    }
}
