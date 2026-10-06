import { Angle, OrientationType, PlayerId, Players, StoneId, TileName } from "../types"
import { isRecord, isTileName, playerIds } from "./snapshot"

export type RoomMode = "online" | "table"
export interface TableCursor { cell: string, slot: number, angle: Angle }
export interface TableView {
    turn: PlayerId | null
    remaining: number
    finished: boolean
    busy: boolean
    orientation: OrientationType
    hand: TileName[]
    stones: StoneId[]
    cursor: (TableCursor & { valid: boolean }) | null
    results: Players | null
}
export type TableAction = "step" | "rotate" | "select" | "place"

const validStones = (value: unknown): value is StoneId[] => Array.isArray(value) && value.length <= 12 &&
    new Set(value).size === value.length && value.every(id => Object.values(StoneId).includes(id))

export const isTableView = (value: unknown): value is TableView => {
    if (!isRecord(value)) return false
    const cursor = value.cursor
    return (value.turn === null || playerIds.includes(value.turn)) && Number.isInteger(value.remaining) &&
        value.remaining >= 0 && value.remaining <= 54 && typeof value.finished === "boolean" && typeof value.busy === "boolean" &&
        ["flat", "pointy"].includes(value.orientation) && Array.isArray(value.hand) && value.hand.length <= 2 && value.hand.every(isTileName) &&
        validStones(value.stones) && (cursor === null || (isRecord(cursor) && typeof cursor.cell === "string" &&
            /^-?[0-4],-?[0-4]$/.test(cursor.cell) && [0, 1].includes(cursor.slot) &&
            [0, 60, 120, 180, 240, 300].includes(cursor.angle) && typeof cursor.valid === "boolean")) &&
        (value.results === null || (value.finished && Array.isArray(value.results) && value.results.length >= 2 &&
            value.results.length <= 4 && value.results.every((p: unknown, index: number) => isRecord(p) &&
                p.id === playerIds[index] && (p.name === undefined || typeof p.name === "string") && validStones(p.stones))))
}
