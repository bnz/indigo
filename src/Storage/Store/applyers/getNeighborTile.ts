import { StoneId, Tile } from "../../../types"
import { Store } from "../Store"
import { toHex } from "./toHex"

export const getNeighborTile = (store: Store, stoneId: StoneId): Tile => {
    const [, q, r, edge] = store.stones[stoneId]

    return store.tiles[toHex(q, r).neighbor(edge).id]
}
