import { HexType, SavedTilesValue } from "../../../types"
import { Store } from "../Store"

export const saveTiles = (store: Store) => {
    const routeTiles: SavedTilesValue[] = []
    const treasureTiles: SavedTilesValue[] = []
    store.tileEntries.forEach(([, { hex: { q, r }, tile, type, stones }]) => {
        if (type === HexType.route) {
            const arr: SavedTilesValue = [q, r]
            if (tile !== undefined) {
                arr.push(tile)
            }
            if (stones !== undefined) {
                arr.push(stones)
            }
            routeTiles.push(arr)
        }
        if (type === HexType.treasure) {
            const arr: SavedTilesValue = [q, r, tile]
            if (stones !== undefined) {
                arr.push(stones)
            }
            treasureTiles.push(arr)
        }
    })
    store.storage.set("route-tiles", routeTiles)
    store.storage.set("treasure-tiles", treasureTiles)
}
