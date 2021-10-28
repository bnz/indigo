import { LineEmptyTiles, TileItems } from "../../../types"

export const emptyLines: TileItems<LineEmptyTiles> = [
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
