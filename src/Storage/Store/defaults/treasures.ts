import { StoneId, TileItems, TreasureTiles } from "../../../types"

export const treasures: TileItems<TreasureTiles> = [
    /* 0 */ [4, 0, TreasureTiles["tr-t-l"], [[StoneId.amber0, 3]]],
    /* 1 */ [-4, 0, TreasureTiles["tr-b-r"], [[StoneId.amber1, 0]]],
    /* 2 */ [-4, 4, TreasureTiles["tr-t-r"], [[StoneId.amber2, 1]]],
    /* 3 */ [0, -4, TreasureTiles["tr-b"], [[StoneId.amber3, 5]]],
    /* 4 */ [0, 4, TreasureTiles["tr-t"], [[StoneId.amber4, 2]]],
    /* 5 */ [4, -4, TreasureTiles["tr-b-l"], [[StoneId.amber5, 4]]],

    [0, 0, TreasureTiles.center, []],
]
