import { makeAutoObservable, observable, reaction, runInAction } from "mobx"
import { Layout } from "../../jsx/Game/Hexagons/Layout"
import { Point } from "../../jsx/Game/Hexagons/Point"
import { GemAward, GemCollision, Keys, OrientationType, PlayerId, PlayerMove, RouteTiles, Stones, TileName, Tiles, UIPhase, Values } from "../../types"
import { debounce } from "../../helpers/debounce"
import { LocalStorageMgmnt } from "../LocalStorageMgmnt"
import { PlayersStore } from "../PlayersStore/PlayersStore"
import { Orientation } from "../../jsx/Game/Hexagons/Orientation"
import { onWindowResize } from "./applyers/onWindowResize"
import { init } from "./applyers/init"
import { stones } from "./defaults/stones"
import { gates } from "./constants/gates"
import { placementError } from "../../game/rules"
import { recalc } from "./applyers/recalc"
import { calcScore } from "../../helpers/calcScore"

export const COLLECTION_ANIMATION_MS = 1100
export const SCORE_ANIMATION_MS = 2000
export const COLLISION_ANIMATION_MS = 900

export class Store {

    readonly ratio = 0.8660254

    readonly largeSide = 9

    readonly smallSide = 9 * this.ratio

    width = 0

    height = 0

    R = 0

    preSit = false

    hoveredId: string | null = null

    isNewGame = false

    error: "gateBlocked" | "invalidState" | null = null

    saveFailed = false

    animatedStones: Stones | null = null

    collecting = false

    pendingAwards: GemAward[] = []

    collisions: GemCollision[] = []

    scoreChanges: { playerId: PlayerId, from: number, to: number }[] = []

    private animationTimer: number | undefined

    private stopPlayerReaction: (() => void) | undefined

    constructor(storageName = "game-v2") {
        this.storage = new LocalStorageMgmnt<Keys, Values>(storageName)
        this.playersStore = new PlayersStore(this.storage)
        init(this)
        makeAutoObservable<Store,
            | "ratio"
            | "largeSide"
            | "smallSide"
            | "storage"
            | "animationTimer"
            | "stopPlayerReaction">(this, { ratio: false, largeSide: false, smallSide: false, storage: false, animationTimer: false, stopPlayerReaction: false, online: observable.ref })

        // if (process.env.NODE_ENV === 'development') {
        //   new __DEV__appendStyles(this.smallSide, this.largeSide, this.ratio, this.tiles)
        // }

        this.playerMoveReaction()
        this.stopPlayerReaction = reaction(() => this._playerMove, this.playerMoveReaction)
    }

    // Old saves may already contain invalid moves. Leave them intact in the old "game" key.
    storage: LocalStorageMgmnt<Keys, Values>

    playersStore: PlayersStore

    online: { readonly canPlay: boolean, submit: (id: string, route: RouteTiles) => void } | null = null

    leftTiles: TileName[] = []

    stones: Stones = stones

    tiles: Tiles = {}

    layout: Layout = new Layout(this.orientation, new Point(0, 0), new Point(0, 0))

    gameResultsOpen: boolean = true

    dispose = (): void => {
        window.removeEventListener("resize", this.debounce)
        this.stopPlayerReaction?.()
        this.stopAnimation()
    }

    reset = (): void => {
        this.stopAnimation()
        this.playersStore.dispose()
        this.preSit = false
        this.hoveredId = null
        this.error = null
        this.gameResultsOpen = true
        init(this)
        recalc(this)
    }

    stopAnimation = () => {
        window.clearTimeout(this.animationTimer)
        this.animatedStones = null
        this.collecting = false
        this.pendingAwards = []
        this.collisions = []
        this.scoreChanges = []
    }

    animate = (frames: Stones[], awards: GemAward[] = [], collisionEvents: GemCollision[] = []) => {
        this.stopAnimation()
        if (!frames.length || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
        let frame = 0
        this.pendingAwards = awards
        this.animatedStones = frames[frame]
        const advance = () => runInAction(() => {
            frame++
            if (frames[frame]) {
                this.animatedStones = frames[frame]
                if (frame === frames.length - 1 && collisionEvents.length) {
                    this.collisions = collisionEvents
                    this.animationTimer = window.setTimeout(advance, COLLISION_ANIMATION_MS)
                } else {
                    this.animationTimer = window.setTimeout(advance, 250)
                }
            } else if (this.pendingAwards.length) {
                this.collecting = true
                this.animatedStones = { ...this.stones }
                // Keep invisible gateway gems mounted so the view can measure the flight origins.
                for (const { stoneId } of this.pendingAwards) {
                    this.animatedStones[stoneId] = [...this.stones[stoneId]]
                    this.animatedStones[stoneId][4] = false
                }
                this.animationTimer = window.setTimeout(() => runInAction(() => {
                    this.scoreChanges = this.playersStore.players
                        .filter(player => this.pendingAwards.some(award => award.playerId === player.id))
                        .map(player => ({
                            playerId: player.id,
                            from: calcScore(this.visiblePlayerStones(player.id)),
                            to: calcScore(player.stones),
                        }))
                    this.collecting = false
                    this.pendingAwards = []
                    this.animatedStones = this.stones
                    this.animationTimer = window.setTimeout(this.stopAnimation, SCORE_ANIMATION_MS)
                }), COLLECTION_ANIMATION_MS)
            } else {
                this.stopAnimation()
            }
        })
        if (frames.length === 1 && collisionEvents.length) this.collisions = collisionEvents
        this.animationTimer = window.setTimeout(advance, collisionEvents.length && frames.length === 1 ? COLLISION_ANIMATION_MS : 250)
    }

    visiblePlayerStones = (playerId: PlayerId) => this.playersStore.players.find(player => player.id === playerId)!.stones.filter(
        stoneId => !this.pendingAwards.some(award => award.playerId === playerId && award.stoneId === stoneId),
    )

    private _playerMove: PlayerMove = [PlayerId.Player1]

    get playerMove() {
        return this._playerMove
    }

    set playerMove(move: PlayerMove) {
        this._playerMove = move
        this.storage.set("player-move", this.playerMove)
        this.saveFailed = this.storage.failed
    }

    playerMoveReaction = () => {
        /**
         * TODO FIXME
         */

        try {
            const str = localStorage.getItem("ui")
            if (str) {
                const ui = JSON.parse(str)

                if (ui.phase === UIPhase.GAME) {
                    document.body.classList.remove(...document.body.classList)
                    document.body.classList.add(this.playerMove[0])
                }
            }

        } catch (e) {

        }
    }

    private _arenaElement: HTMLDivElement | null = null

    get arenaElement() {
        return this._arenaElement
    }

    set arenaElement(el) {
        window.removeEventListener("resize", this.debounce)
        this._arenaElement = el
        if (el) {
            onWindowResize(this)()
            window.addEventListener("resize", this.debounce, false)
        }
    }

    get elSizes() {
        const arenaElement = this.arenaElement

        if (arenaElement) {
            return [arenaElement.offsetWidth, arenaElement.offsetHeight]
        }

        return [0, 0]
    }

    debounce = debounce(onWindowResize(this), 400)

    private _orientation: Orientation = Layout.flat

    get orientation() {
        return this._orientation
    }

    set orientation(orientation) {
        this._orientation = orientation
        this.storage.set("orientation", this.orientationType)
    }

    get orientationType(): OrientationType {
        return this.isPointy ? "pointy" : "flat"
    }

    get isPointy() {
        return this.orientation.start_angle === 0.5
    }

    get boardTop() {
        return Math.max(0, (this.height - this.R * (this.isPointy ? this.largeSide : this.smallSide) * 2) / 2)
    }

    get isRouteCrossroad() {
        return this.currentTileName === "c"
    }

    get gates(): Record<number, number> {
        return gates[this.playersStore.players.length]
    }

    get finished() {
        return Object.values(this.stones).every(stone => stone.length > 4 && stone[4])
    }

    get winners() {
        return this.finished ? this.playersStore.leadingPlayers : []
    }

    get canPlay() {
        return !this.finished && this.animatedStones === null && this.currentTileName !== undefined && (!this.online || this.online.canPlay)
    }

    get currentTileName() {
        return this.playerMove.length > 1 ? this.playerMove[1] : undefined
    }

    get currentRoute(): RouteTiles | undefined {
        const { playerMove } = this
        const name = playerMove.length > 1 ? playerMove[1] : undefined
        const angle = playerMove.length > 2 ? playerMove[2] : undefined
        const nextAngle = playerMove.length > 4 ? playerMove[4] : undefined
        if (!name) return undefined
        return name === "c" ? RouteTiles.c : RouteTiles[`${name}-${nextAngle ?? angle ?? 0}` as keyof typeof RouteTiles]
    }

    get placementError() {
        return this.hoveredId !== null && this.currentRoute !== undefined
            ? placementError(this.tiles, this.hoveredId, this.currentRoute)
            : null
    }
}
