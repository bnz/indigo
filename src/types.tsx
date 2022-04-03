import { Hex } from "./jsx/Game/Hexagons/Hex"

export type Keys =
    | "orientation"
    | "player-move"
    | "players"
    | "players-gateways"
    | "route-tiles"
    | "treasure-tiles"
    | "tiles-left"
    | "stones"

export type Values =
    | OrientationType
    | PlayerMove
    | Players
    | SavedTilesValue[]
    | TileName[]
    | Stones
    | PlayersGateways

export enum PlayerId {
    Player1 = "p-1",
    Player2 = "p-2",
    Player3 = "p-3",
    Player4 = "p-4",
}

export interface Player {
    id: PlayerId
    stones: StoneId[]
}

export type Players = Player[]

type Dictionary<K extends string, T> = { [P in K]?: T }

export type PlayersGateways = Dictionary<PlayerId, [tileID: string, edge: Edge][]>

export enum PlayerColors {
    Player1 = "#ffbe37",
    Player2 = "#388e3c",
    Player3 = "#e6ebf0",
    Player4 = "#ff6955",
}

export enum UIPhase {
    PRE_GAME,
    PLAYERS_SELECTION,
    GAME,
}

export type PlayerMove = [
    /* 0 */ playerId: PlayerId,
    /* 1 */ tileName?: TileName,
    /* 2 */ angle?: Angle,
    /* 3 */ rotationAngle?: number,
    /* 4 */ nextAngle?: Angle,
]

export type OrientationType = "flat" | "pointy"

export enum TreasureTiles {
    "center",
    "tr-b",
    "tr-b-l",
    "tr-b-r",
    "tr-t",
    "tr-t-l",
    "tr-t-r",
}

export enum GatewayTiles {
    "le-t" = 7,
    "le-b",
    "le-l-t",
    "le-l-b",
    "le-r-b",
    "le-r-t",
    "g-l",
    "g-t-l",
    "g-t-r",
    "g-r",
    "g-b-r",
    "g-b-l",
}

export type Tiles = Record<string, Tile>

type StoneWithEdge = [stoneId: StoneId, edge: Edge][]

export type SavedTilesValue = [Q: number, R: number, id?: number, stoneWithEdge?: StoneWithEdge]
export type SavedTiles = Record<string, SavedTilesValue>

export enum TileName2 {
    S,
    C,
    T,
    L,
    H,
}

export type TileName =
    | "s"
    | "c"
    | "t"
    | "l"
    | "h"

export enum HexType {
    decorator,
    corner,
    treasure,
    route,
    seat,
    gateway,
    center
}

export type Angle = 0 | 60 | 120 | 180 | 240 | 300

export enum RouteTiles {
    // CROSSROAD
    c = 25,

    // LIZARD
    "l-0",
    "l-60",
    "l-120",

    // HUMAN
    "h-0",
    "h-60",
    "h-120",
    "h-180",
    "h-240",
    "h-300",

    // TURTLE
    "t-0",
    "t-60",
    "t-120",

    // SHURIKEN
    "s-0",
    "s-60",
}

export const AllTiles = {
    ...TreasureTiles,
    ...GatewayTiles,
    ...RouteTiles,
}

export type IAllTiles = TreasureTiles | GatewayTiles | RouteTiles

export type TileItems<T> = [number, number, T?, StoneWithEdge?][]

export interface Tile {
    hex: Hex
    type: HexType
    tile?: IAllTiles
    stones?: StoneWithEdge
    hovered?: boolean
}

export enum StoneId {
    sapphire = "s",
    emerald0 = "e0",
    emerald1 = "e1",
    emerald2 = "e2",
    emerald3 = "e3",
    emerald4 = "e4",
    amber0 = "a0",
    amber1 = "a1",
    amber2 = "a2",
    amber3 = "a3",
    amber4 = "a4",
    amber5 = "a5",
}

export enum StoneType {
    sapphire,
    emerald,
    amber,
}

export type Edge = 0 | 1 | 2 | 3 | 4 | 5

export type Stone = [type: StoneType, Q: number, R: number, edge: Edge, isOut?: boolean]

export type Stones = Record<StoneId, Stone>

export interface Data<T> {
    data: T
}
