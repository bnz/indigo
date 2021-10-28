import { StoneId, TileItems, TreasureT } from "../../../types"

export const treasures: TileItems<TreasureT> = [
    /* 0 */ [4, 0, TreasureT["tr-t-l"], [[StoneId.amber0, 3]]],
    /* 1 */ [-4, 0, TreasureT["tr-b-r"], [[StoneId.amber1, 0]]],
    /* 2 */ [-4, 4, TreasureT["tr-t-r"], [[StoneId.amber2, 1]]],
    /* 3 */ [0, -4, TreasureT["tr-b"], [[StoneId.amber3, 5]]],
    /* 4 */ [0, 4, TreasureT["tr-t"], [[StoneId.amber4, 2]]],
    /* 5 */ [4, -4, TreasureT["tr-b-l"], [[StoneId.amber5, 4]]],

    [0, 0, TreasureT.center, []],
]
