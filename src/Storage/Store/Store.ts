import { makeAutoObservable } from "mobx"
import { Layout } from "../../jsx/Game/Hexagons/Layout"
import { Point } from "../../jsx/Game/Hexagons/Point"
import { Keys, OrientationType, PlayerMove, Stones, TileName, Tiles, Values } from "../../types"
import { debounce } from "../../helpers/debounce"
import { LocalStorageMgmnt } from "../LocalStorageMgmnt"
import { PlayersStore } from "../PlayersStore/PlayersStore"
import { Orientation } from "../../jsx/Game/Hexagons/Orientation"
import { onWindowResize } from "./applyers/onWindowResize"
import { init } from "./applyers/init"
import { stones } from "./defaults/stones"
import { gates } from "./constants/gates"

export class Store {

    readonly ratio = 0.8660254

    readonly largeSide = 9

    readonly smallSide = 9 * this.ratio

    width = 0

    height = 0

    R = 0

    preSit = false

    hoveredId: string | null = null

    constructor() {
        init(this)
        makeAutoObservable<Store,
            | "ratio"
            | "largeSide"
            | "smallSide"
            | "storage">(this, { ratio: false, largeSide: false, smallSide: false, storage: false })

        // if (process.env.NODE_ENV === 'development') {
        //   new __DEV__appendStyles(this.smallSide, this.largeSide, this.ratio, this.tiles)
        // }
    }

    storage = new LocalStorageMgmnt<Keys, Values>("game")

    playersStore: PlayersStore = new PlayersStore(this.storage)

    leftTiles: TileName[] = []

    stones: Stones = stones

    tiles: Tiles = {}

    layout: Layout = new Layout(this.orientation, new Point(0, 0), new Point(0, 0))

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

    private _playerMove: PlayerMove = [this.playersStore.players[0].id]

    get playerMove() {
        return this._playerMove
    }

    set playerMove(move: PlayerMove) {
        this._playerMove = move
        this.storage.set("player-move", this.playerMove)
    }

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

    get isRouteCrossroad() {
        return this.playerMove[1] === "c"
    }

    get gates(): Record<number, number> {
        return gates[this.playersStore.players.length]
    }

}
