import { HexType, IAllTiles, TileItems, Tiles } from "../../../types"
import { toHex } from "./toHex"

export const generateTiles = (data: TileItems<IAllTiles>, type: HexType): Tiles => {
    const res: Tiles = {}
    data.forEach(([q, r, tile, stones]) => {
        const hex = toHex(q, r)
        res[hex.id] = {
            hex,
            type,
            ...(tile !== undefined ? { tile } : {}),
            ...(stones !== undefined && stones.length ? { stones } : {}),
        }
    })
    return res
}
