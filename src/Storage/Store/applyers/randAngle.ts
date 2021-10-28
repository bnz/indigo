import { Angle, TileName } from "../../../types"
import { getRandomInt } from "../../../helpers/random"

export const randAngle = (map: Record<TileName, Angle[]>, tile: TileName): number => (
    getRandomInt(0, map[tile].length - 1)
)
