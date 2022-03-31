import { Edge, TreasureTiles } from "../../../types"

export const treasureTileIdToEdgeMap: Record<keyof typeof TreasureTiles, [
    edge: Edge,
    edge: Edge,
    edge: Edge,
    edge: Edge,
    edge: Edge,
    edge: Edge,
]> = {
    center: [0, 0, 0, 0, 0, 0],
    "tr-b": [0, 0, 0, 0, 0, 0],
    "tr-b-l": [0, 0, 0, 5, 0, 3],
    "tr-b-r": [0, 0, 0, 0, 0, 0],
    "tr-t": [0, 0, 0, 0, 0, 0],
    "tr-t-l": [0, 0, 0, 0, 0, 0],
    "tr-t-r": [0, 0, 0, 0, 0, 0],
}
