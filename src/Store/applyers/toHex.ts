import { Hex } from "../../jsx/Game/Hexagons/Hex"

export const toHex = (q: number, r: number) => new Hex(q, r, (q + r) * -1)
