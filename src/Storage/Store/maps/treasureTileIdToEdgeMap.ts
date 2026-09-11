import { Edge, TreasureTiles } from "../../../types"

export const treasureTileIdToEdgeMap: Record<keyof typeof TreasureTiles, [
    edge: Edge | null,
    edge: Edge | null,
    edge: Edge | null,
    edge: Edge | null,
    edge: Edge | null,
    edge: Edge | null,
]> = {
    center: [null, null, null, null, null, null],
    "tr-b": [4, null, null, null, 0, null],
    "tr-b-l": [null, null, null, 5, null, 3],
    "tr-b-r": [null, 5, null, null, null, 1],
    "tr-t": [null, 3, null, 1, null, null],
    "tr-t-l": [null, null, 4, null, 2, null],
    "tr-t-r": [2, null, 0, null, null, null],
}
