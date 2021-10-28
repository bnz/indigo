import { CSSProperties, MouseEvent } from "react"
import { makeAutoObservable } from "mobx"
import { Layout } from "../../jsx/Game/Hexagons/Layout"
import { Point } from "../../jsx/Game/Hexagons/Point"
import { Keys, OrientationType, PlayerId, PlayerMove, Stones, Tile, TileName, Tiles, Values } from "../../types"
import { debounce } from "../../helpers/debounce"
import svg from "../../assets/hex.svg"
import { LocalStorageMgmnt } from "../LocalStorageMgmnt"
import { PlayersStore } from "../PlayersStore/PlayersStore"
import { toHex } from "./applyers/toHex"
import { Orientation } from "../../jsx/Game/Hexagons/Orientation"
import { getPlayerMoveTile } from "./applyers/playerMoveTile"
import { onWindowResize } from "./applyers/onWindowResize"
import { init } from "./applyers/init"
import { cssBgUrl } from "./applyers/cssBgUrl"
import { stones } from "./defaults/stones"
import { rotateLeft, rotateRight } from "./applyers/rotate"
import { applySit } from "./applyers/applySit"

const gates: Record<number, Record<number, number>> = {
    2: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 1, 8: 1, 9: 0, 10: 0, 11: 1, 12: 1 },
    3: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2, 6: 2, 7: 2, 8: 0, 9: 1, 10: 1, 11: 1, 12: 2 },
    4: { 1: 0, 2: 1, 3: 1, 4: 2, 5: 0, 6: 3, 7: 3, 8: 1, 9: 2, 10: 0, 11: 2, 12: 3 },
}

export class Store {

    readonly ratio = 0.8660254

    width = 0

    height = 0

    largeSide = 9

    smallSide = 9 * this.ratio

    constructor() {
        init(this)
        makeAutoObservable<Store,
            | "ratio"
            | "largeSide"
            | "smallSide"
            | "storage">(this, {
            ratio: false,
            largeSide: false,
            smallSide: false,
            storage: false,
        })

        // if (process.env.NODE_ENV === 'development') {
        //   new __DEV__appendStyles(this.smallSide, this.largeSide, this.ratio, this.tiles)
        // }
    }

    storage = new LocalStorageMgmnt<Keys, Values>("game")

    playersStore: PlayersStore = new PlayersStore(this.storage)

    private _hoveredId: string | null = null

    get hoveredId() {
        return this._hoveredId
    }

    set hoveredId(hoveredId) {
        this._hoveredId = hoveredId
    }

    /**
     * - - - init - - - - - - - - - - - - - - - - - - - - - - - -
     */

    leftTiles: TileName[] = []

    private _orientation: Orientation = Layout.flat

    stones: Stones = stones

    tiles: Tiles = {}

    /** */

    dispose = (): void => {
        try {
            window.removeEventListener("resize", this.debounce)
            this.storage.destroy()
            this.playersStore.dispose()
            init(this)
        } catch (e) {
            console.warn("%cTODO", "font-size:50px;", e)
        }
    }

    /**
     * - - - END OF init - - - - - - - - - - - - - - - - - - - - - - - -
     */

    private _playerMove: PlayerMove = [this.playersStore.players[0].id]

    get playerMove() {
        return this._playerMove
    }

    set playerMove(move: PlayerMove) {
        this._playerMove = move
        this.storage.set("player-move", this.playerMove)
    }

    /** - - - */

    private _arenaElement: HTMLDivElement | null = null

    get arenaElement() {
        return this._arenaElement
    }

    set arenaElement(el) {
        this._arenaElement = el
        onWindowResize(this)()
        window.addEventListener("resize", this.debounce, false)
    }

    get elSizes() {
        if (this.arenaElement) {
            return [
                this.arenaElement.offsetWidth,
                this.arenaElement.offsetHeight,
            ]
        }
        return [0, 0]
    }

    debounce = debounce(onWindowResize(this), 400)

    get tileActionsPositionCSS(): CSSProperties {
        const [_q, _r] = (this.hoveredId || "0,0").split(",")
        const { x, y } = this.layout.hexToPixel(toHex(parseInt(_q, 10), parseInt(_r, 10)))

        return {
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        }
    }

    /** - - - */

    private _R = 0

    get R() {
        return this._R
    }

    set R(R) {
        this._R = R
    }

    /** - - - */

    private _preSit = false

    get preSit() {
        return this._preSit
    }

    set preSit(preSit) {
        this._preSit = preSit
    }

    /** - - - */

    get isPointy() {
        return this.orientation.start_angle === 0.5
    }

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

    /** - - - */

    private _layout: Layout = new Layout(
        this.orientation,
        new Point(0, 0),
        new Point(0, 0),
    )

    get layout() {
        return this._layout
    }

    set layout(layout) {
        this._layout = layout
    }

    get renderLayout(): Layout {
        const orientation = this.orientationType

        return new Layout(
            Layout[orientation],
            new Point(1, 1),
            new Point(
                0,
                orientation === "pointy" ? this.largeSide : this.smallSide,
            ),
        )
    }

    get playerMoveRouteTile(): CSSProperties | undefined {
        if (this.playerMove[1]) {
            return cssBgUrl([svg, "#", getPlayerMoveTile(this)].join(""))
        }
        return undefined
    }

    get getTileHoveredCSS(): CSSProperties {
        const playerMove = this.playerMove

        return {
            ...cssBgUrl([svg, "#", getPlayerMoveTile(this)].join("")),
            ...(playerMove.length >= 4 && playerMove[3] !== undefined ? {
                transform: `rotate(${playerMove[3]}deg)`,
            } : {}),
            // transitionProperty: "transform",
            // transitionDuration: "calc(var(--duration) * 5)",
        }
    }

    onClick = () => {
        if (this.hoveredId !== null) {
            this.preSit = true
        }
    }

    cancelPreSitButton = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        this.cancelPreSit()
    }

    cancelPreSit = () => {
        this.preSit = false
    }

    applySitButton = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        applySit(this)
    }

    rotateLeftButton = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        rotateLeft(this)()
    }

    rotateRightButton = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        rotateRight(this)()
    }

    get isRouteCrossroad() {
        return this.playerMove[1] === "c"
    }

    get tileEntries(): [string, Tile][] {
        return Object.entries(this.tiles)
    }

    get gates(): Record<number, number> {
        return gates[this.playersStore.players.length]
    }

    /** - - - */

    getGateway(position: number): PlayerId {
        return this.playersStore.players[this.gates[position]].id
    }
}
