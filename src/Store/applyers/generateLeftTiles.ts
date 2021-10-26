import { TileName } from "../../types"
import { shuffle } from "../../helpers/shuffle"

const leftTilesInitialSet: Record<TileName, 6 | 14> = {
    s: 6,
    c: 6,
    t: 14,
    l: 14,
    h: 14,
}

export const generateLeftTiles = (): TileName[] =>
    shuffle<TileName>(
        [].concat.apply(
            [] as any,
            Object.entries<6 | 14>(leftTilesInitialSet).map(
                ([name, count]) => (new Array(count)).fill(name),
            ) as any,
        ),
    )
