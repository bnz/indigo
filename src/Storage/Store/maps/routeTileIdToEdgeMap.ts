import { Edge, RouteTiles } from "../../../types"

export const routeTileIdToEdgeMap: Record<keyof typeof RouteTiles, [
    edge: Edge,
    edge: Edge,
    edge: Edge,
    edge: Edge,
    edge: Edge,
    edge: Edge
]> = {
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
}
