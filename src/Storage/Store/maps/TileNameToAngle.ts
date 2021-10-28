import { Angle, TileName } from "../../../types"

export const tileNameToAngle: Record<TileName, Angle[]> = {
    s: [0, 60],
    c: [],
    t: [0, 60, 120],
    l: [0, 60, 120],
    h: [0, 60, 120, 180, 240, 300],
}
