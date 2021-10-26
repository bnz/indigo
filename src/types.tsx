import { Hex } from "./jsx/Game/Hexagons/Hex"

export type Keys =
    | "orientation"
    | "player-move"
    | "players"
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

export enum PlayerId {
    Player1 = "p-1",
    Player2 = "p-2",
    Player3 = "p-3",
    Player4 = "p-4",
}

export interface Player {
    id: PlayerId
}

export type Players = Player[]

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

type RotationAngle = number
type NextAngle = Angle

export type PlayerMove = [PlayerId, TileName?, Angle?, RotationAngle?, NextAngle?]

export type OrientationType = "flat" | "pointy"

export enum TreasureT {
    "center",
    "tr-b",
    "tr-b-l",
    "tr-b-r",
    "tr-t",
    "tr-t-l",
    "tr-t-r",
}

// export enum CornersTiles {
//     "c-r" = 7,
//     "c-l",
//     "c-t-l",
//     "c-t-r",
//     "c-b-l",
//     "c-b-r",
// }

export enum LineEmptyTiles {
    "le-t" = 13,
    "le-b",
    "le-l-t",
    "le-l-b",
    "le-r-b",
    "le-r-t",
}

export enum GatewayTiles {
    "g-l" = 19,
    "g-t-l",
    "g-t-r",
    "g-r",
    "g-b-r",
    "g-b-l",
}

export type Tiles = Record<string, Tile>

type StoneWithEdge = [StoneIds, Edge][]

type Q = number
type R = number
type TileId = number
export type SavedTilesValue = [Q, R, TileId?, StoneWithEdge?]
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
    c = 25, c_,

    // LIZARD
    "l-0", "l-0_",
    "l-60", "l-60_",
    "l-120", "l-120_",

    // HUMAN
    "h-0", "h-0_",
    "h-60", "h-60_",
    "h-120", "h-120_",
    "h-180", "h-180_",
    "h-240", "h-240_",
    "h-300", "h-300_",

    // TURTLE
    "t-0", "t-0_",
    "t-60", "t-60_",
    "t-120", "t-120_",

    // SHURIKEN
    "s-0", "s-0_",
    "s-60", "s-60_",
}

export const AllTiles = {
    // ...CornersTiles,
    ...TreasureT,
    ...LineEmptyTiles,
    ...GatewayTiles,
    ...RouteTiles,
}

export type IAllTiles = TreasureT | LineEmptyTiles | GatewayTiles | RouteTiles

export type TileItems<T> = [number, number, T?, StoneWithEdge?][]

export interface Tile {
    hex: Hex
    type: HexType
    tile?: IAllTiles
    stones?: StoneWithEdge
    hovered?: boolean
}

export enum StoneIds {
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

export type Stone = [StoneType, Q, R, Edge]

export type Stones = Record<StoneIds, Stone>

export type StonesEntries = [StoneIds, any][]
