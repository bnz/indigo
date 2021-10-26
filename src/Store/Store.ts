import { CSSProperties, MouseEvent } from "react"
import { makeAutoObservable } from "mobx"
import { Layout } from "../jsx/Game/Hexagons/Layout"
import { Point } from "../jsx/Game/Hexagons/Point"
import {
    Angle,
    Edge,
    GatewayTiles,
    HexType,
    Keys,
    LineEmptyTiles,
    OrientationType,
    PlayerId,
    PlayerMove,
    RouteTiles,
    StoneIds,
    Stones,
    StoneType,
    Tile,
    TileItems,
    TileName,
    Tiles,
    TreasureT,
    Values,
} from "../types"
import { debounce } from "../helpers/debounce"
import svg from "../assets/hex.svg"
import { LocalStorageMgmnt } from "./LocalStorageMgmnt"
import { PlayersStore } from "./PlayersStore/PlayersStore"
import { toHex } from "./applyers/toHex"
import { generateTiles } from "./applyers/generateTiles"
import { saveTiles } from "./applyers/saveTiles"
import { Orientation } from "../jsx/Game/Hexagons/Orientation"
import { getStoneProps } from "./applyers/getStoneProps"
import { getPlayerMoveTile } from "./applyers/playerMoveTile"
import { onWindowResize } from "./applyers/onWindowResize"
import { init } from "./applyers/init"
import { edgeToShiftMap } from "./applyers/edgeToShiftMap"
import { getTransformCSS } from "./applyers/getTransformCSS"
import { cssBgUrl } from "./applyers/cssBgUrl"
import { nextMove } from "./applyers/nextMove"

/**
 *
 */

export const treasures: TileItems<TreasureT> = [
    /* 0 */ [4, 0, TreasureT["tr-t-l"], [[StoneIds.amber0, 3]]],
    /* 1 */ [-4, 0, TreasureT["tr-b-r"], [[StoneIds.amber1, 0]]],
    /* 2 */ [-4, 4, TreasureT["tr-t-r"], [[StoneIds.amber2, 1]]],
    /* 3 */ [0, -4, TreasureT["tr-b"], [[StoneIds.amber3, 5]]],
    /* 4 */ [0, 4, TreasureT["tr-t"], [[StoneIds.amber4, 2]]],
    /* 5 */ [4, -4, TreasureT["tr-b-l"], [[StoneIds.amber5, 4]]],

    [0, 0, TreasureT.center, []],
]

export const stones: Stones = {
    [StoneIds.sapphire]: [StoneType.sapphire, 0, 0, 0],

    [StoneIds.emerald0]: [StoneType.emerald, 0, 0, 5],
    [StoneIds.emerald1]: [StoneType.emerald, 0, 0, 1],
    [StoneIds.emerald2]: [StoneType.emerald, 0, 0, 2],
    [StoneIds.emerald3]: [StoneType.emerald, 0, 0, 3],
    [StoneIds.emerald4]: [StoneType.emerald, 0, 0, 4],

    [StoneIds.amber0]: getStoneProps(0, StoneType.amber),
    [StoneIds.amber1]: getStoneProps(1, StoneType.amber),
    [StoneIds.amber2]: getStoneProps(2, StoneType.amber),
    [StoneIds.amber3]: getStoneProps(3, StoneType.amber),
    [StoneIds.amber4]: getStoneProps(4, StoneType.amber),
    [StoneIds.amber5]: getStoneProps(5, StoneType.amber),
}

export const tileNameToAngle: Record<TileName, Angle[]> = {
    s: [0, 60],
    c: [],
    t: [0, 60, 120],
    l: [0, 60, 120],
    h: [0, 60, 120, 180, 240, 300],
}

const stoneAngleMap: Record<OrientationType, Record<StoneType, [number?, number?, number?, number?, number?, number?]>> = {
    pointy: {
        [StoneType.sapphire]: [],
        [StoneType.emerald]: [undefined, -30, 30, undefined, -30, 30],
        [StoneType.amber]: [90, -30, 30, 90, -30, 30],
    },
    flat: {
        [StoneType.sapphire]: [30],
        [StoneType.emerald]: [30, undefined, 60, 30, undefined, 60],
        [StoneType.amber]: [120, undefined, 60, 120, undefined, 60],
    },
}


/**
 *
 */

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
            | "emptyLines"
            | "largeSide"
            | "smallSide"
            | "treasures"
            | "gateways"
            | "routes"
            | "_leftTiles"
            | "_leftTilesInitialSet"
            | "storage"
            | "_gates"
            | "routeTileIdToEdgeMap">(this, {
            ratio: false,
            emptyLines: false,
            largeSide: false,
            smallSide: false,
            treasures: false,
            gateways: false,
            routes: false,
            _leftTiles: false,
            _leftTilesInitialSet: false,
            storage: false,
            _gates: false,
            routeTileIdToEdgeMap: false,
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

    private _playerMove: PlayerMove = [this.playersStore.players[0].id]

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

    private _R = 0

    get R() {
        return this._R
    }

    set R(R) {
        this._R = R
    }

    private _preSit = false

    get preSit() {
        return this._preSit
    }

    set preSit(preSit) {
        this._preSit = preSit
    }

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

    private routeTileIdToEdgeMap: Record<keyof typeof RouteTiles, [Edge, Edge, Edge, Edge, Edge, Edge]> = {
        "l-0": [4, 3, 5, 1, 0, 2],
        "l-60": [2, 4, 0, 5, 1, 3],
        "l-120": [3, 5, 4, 0, 2, 1],
        "h-0": [4, 5, 3, 2, 0, 1],
        "h-60": [4, 2, 1, 5, 0, 3],
        "h-120": [1, 0, 4, 5, 2, 3],
        "h-180": [5, 3, 4, 1, 2, 0],
        "h-240": [2, 3, 0, 1, 5, 4],
        "h-300": [2, 5, 0, 4, 3, 1],
        "t-0": [1, 0, 5, 4, 3, 2],
        "t-60": [5, 4, 3, 2, 1, 0],
        "t-120": [3, 2, 1, 0, 5, 4],
        "s-0": [5, 2, 1, 4, 3, 0],
        "s-60": [1, 0, 3, 2, 5, 4],
        c: [3, 4, 5, 0, 1, 2],

        "l-0_": [0, 0, 0, 0, 0, 0],
        "l-60_": [0, 0, 0, 0, 0, 0],
        "l-120_": [0, 0, 0, 0, 0, 0],
        "h-0_": [0, 0, 0, 0, 0, 0],
        "h-60_": [0, 0, 0, 0, 0, 0],
        "h-120_": [0, 0, 0, 0, 0, 0],
        "h-180_": [0, 0, 0, 0, 0, 0],
        "h-240_": [0, 0, 0, 0, 0, 0],
        "h-300_": [0, 0, 0, 0, 0, 0],
        "t-0_": [0, 0, 0, 0, 0, 0],
        "t-60_": [0, 0, 0, 0, 0, 0],
        "t-120_": [0, 0, 0, 0, 0, 0],
        "s-0_": [0, 0, 0, 0, 0, 0],
        "s-60_": [0, 0, 0, 0, 0, 0],
        c_: [0, 0, 0, 0, 0, 0],
    }

    getRotate = (type: StoneType) => (edge: Edge): string | undefined => {
        const rotate = stoneAngleMap[this.orientationType][type]
        return rotate[edge] !== undefined ? ` rotate(${rotate[edge]}deg)` : undefined
    }

    getStoneStyle = (id: StoneIds): CSSProperties => {
        const [type, q, r, edge] = this.stones[id]
        return getTransformCSS(this)(q, r, edgeToShiftMap(this)(type)[edge])
    }

    get playerMoveRouteTile(): CSSProperties | undefined {
        if (this.playerMove[1]) {
            return cssBgUrl([svg, "#", getPlayerMoveTile(this)].join(""))
        }
        return undefined
    }

    get getTmpCSS(): CSSProperties {
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
        this.applySit()
    }

    applySit = () => {
        this.preSit = false
        if (this.hoveredId !== null && getPlayerMoveTile(this) !== undefined) {
            const [, name, angle, , nextAngle] = this.playerMove
            const newRouteTile: [TileName?, Angle?] = [name]

            if (this.playerMove.length === 5 && nextAngle !== undefined) {
                newRouteTile.push(nextAngle)
            } else if (angle !== undefined) {
                newRouteTile.push(angle)
            }

            this.tiles[this.hoveredId].tile = RouteTiles[newRouteTile.join("-") as keyof typeof RouteTiles]
            this.moveStones()
            nextMove(this)
            this.storage.set("stones", this.stones)
            saveTiles(this)
            this._hoveredId = null
        }
    }

    private rotate(back = false) {
        if (this.playerMove[1] && !this.isRouteCrossroad) {
            const [playerId, tile, angle = 0, rotateAngle, savedNextAngle] = this.playerMove
            const angles = tileNameToAngle[tile]

            let nextAngle
            let nextRotateAngle
            let angl = angle

            if (savedNextAngle !== undefined) {
                nextAngle = savedNextAngle
                angl = savedNextAngle
            }

            if (back) {
                const firstAngle = angles[0]
                const lastAngle = angles[angles.length - 1]
                if (angl === firstAngle) {
                    nextAngle = lastAngle
                } else {
                    nextAngle = angl - 60
                }
            } else {
                const lastAngle = angles[angles.length - 1]
                if (angl < lastAngle) {
                    nextAngle = angl + 60
                } else if (angl === lastAngle) {
                    nextAngle = angles[0]
                }
            }

            if (rotateAngle === undefined) {
                nextRotateAngle = 60 * (back ? -1 : 1)
            } else {
                nextRotateAngle = rotateAngle + 60 * (back ? -1 : 1)
            }

            this.playerMove = [playerId, tile, angle, nextRotateAngle, nextAngle as Angle]
        }
    }

    rotateLeftButton = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        this.rotateLeft()
    }

    rotateLeft = () => {
        this.rotate()
    }

    rotateRightButton = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        this.rotateRight()
    }

    rotateRight = () => {
        this.rotate(true)
    }

    private moveStones() {
        const toEdge = (d: number): number => (d + 3) % 6

        const tile = this.tiles[this.hoveredId!]
        const hex = tile.hex
        const directions = [...Array(6).keys()]

        const directionsWithStones = directions.filter((direction) => {
            const { type, tile: neighborTile, stones } = this.tiles[hex.neighbor(direction).id]
            return [HexType.route, HexType.treasure].indexOf(type) !== -1
                && neighborTile !== undefined
                && stones !== undefined
                && stones.length
                && stones.some(([, e]) => toEdge(direction) === e)
        })

        const fn = (direction: number): [StoneIds, Edge] => {
            const neighbor = this.tiles[hex.neighbor(direction).id]
            const index = neighbor.stones!.findIndex(([, e]) => toEdge(direction) === e)
            const [stoneId, stoneEdge] = neighbor.stones![index]
            const routeTile = RouteTiles[tile.tile!] as keyof typeof RouteTiles
            const newEdge = this.routeTileIdToEdgeMap[routeTile][toEdge(stoneEdge)]

            neighbor.stones!.splice(index, 1)

            if (neighbor.stones!.length === 0) {
                delete neighbor.stones
            }

            return [stoneId, newEdge]
        }

        directionsWithStones.forEach((direction) => {
            const [stoneId, newEdge] = fn(direction)

            if (tile.stones === undefined) {
                tile.stones = []
            }

            tile.stones.push([stoneId, newEdge])

            this.stones[stoneId][1] = hex.q
            this.stones[stoneId][2] = hex.r
            this.stones[stoneId][3] = newEdge
        })
    }

    get isRouteCrossroad() {
        return this.playerMove[1] === "c"
    }

    // readonly corners: TileItems<CornersTiles> = [
    //     [6, -3, CornersTiles["c-r"]],
    //     [-6, 3, CornersTiles["c-l"]],
    //     [-3, -3, CornersTiles["c-t-l"]],
    //     [3, -6, CornersTiles["c-t-r"]],
    //     [3, 3, CornersTiles["c-b-r"]],
    //     [-3, 6, CornersTiles["c-b-l"]],
    // ]

    readonly emptyLines: TileItems<LineEmptyTiles> = [
        [-1, -4, LineEmptyTiles["le-t"]],
        [1, -5, LineEmptyTiles["le-t"]],
        [4, -5, LineEmptyTiles["le-l-t"]],
        [5, -4, LineEmptyTiles["le-l-t"]],
        [5, -1, LineEmptyTiles["le-l-b"]],
        [4, 1, LineEmptyTiles["le-l-b"]],
        [1, 4, LineEmptyTiles["le-b"]],
        [-1, 5, LineEmptyTiles["le-b"]],
        [-4, 5, LineEmptyTiles["le-r-b"]],
        [-5, 4, LineEmptyTiles["le-r-b"]],
        [-5, 1, LineEmptyTiles["le-r-t"]],
        [-4, -1, LineEmptyTiles["le-r-t"]],
    ]

    readonly gateways: TileItems<GatewayTiles> = [
        [-5, 2, GatewayTiles["g-l"]],
        [-5, 3, GatewayTiles["g-l"]],
        [-2, -3, GatewayTiles["g-t-l"]],
        [-3, -2, GatewayTiles["g-t-l"]],
        [2, -5, GatewayTiles["g-t-r"]],
        [3, -5, GatewayTiles["g-t-r"]],
        [5, -3, GatewayTiles["g-r"]],
        [5, -2, GatewayTiles["g-r"]],
        [3, 2, GatewayTiles["g-b-r"]],
        [2, 3, GatewayTiles["g-b-r"]],
        [-3, 5, GatewayTiles["g-b-l"]],
        [-2, 5, GatewayTiles["g-b-l"]],
    ]

    readonly routes: TileItems<RouteTiles> = [
        [-4, 1], [-4, 2], [-4, 3],
        [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-3, 4],
        [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-2, 3], [-2, 4],
        [-1, -3], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3], [-1, 4],
        [0, -3], [0, -2], [0, -1], [0, 1], [0, 2], [0, 3],
        [1, -4], [1, -3], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [1, 3],
        [2, -4], [2, -3], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
        [3, -3], [3, -4], [3, -2], [3, -1], [3, 0], [3, 1],
        [4, -3], [4, -2], [4, -1],
    ]

    private readonly _tiles: Tiles = {
        ...generateTiles(this.emptyLines, HexType.decorator),
        ...generateTiles(this.gateways, HexType.gateway),
        ...generateTiles(treasures, HexType.treasure),
        ...generateTiles(this.routes, HexType.route),
    }

    get tileEntries(): [string, Tile][] {
        return Object.entries(this.tiles)
    }

    private _gates: Record<number, Record<number, number>> = {
        2: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 1, 8: 1, 9: 0, 10: 0, 11: 1, 12: 1 },
        3: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2, 6: 2, 7: 2, 8: 0, 9: 1, 10: 1, 11: 1, 12: 2 },
        4: { 1: 0, 2: 1, 3: 1, 4: 2, 5: 0, 6: 3, 7: 3, 8: 1, 9: 2, 10: 0, 11: 2, 12: 3 },
    }

    get gates(): Record<number, number> {
        return this._gates[this.playersStore.players.length]
    }

    getGateway(position: number): PlayerId {
        return this.playersStore.players[this.gates[position]].id
    }
}
