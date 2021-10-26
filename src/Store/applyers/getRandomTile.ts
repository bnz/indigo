import { Angle, TileName } from "../../types"
import { randAngle } from "./randAngle"
import { Store } from "../Store"

export const getRandomTile = (store: Store): [TileName, Angle] | [] => {
    const tile = store.leftTiles.pop()
    store.storage.set("tiles-left", store.leftTiles)

    if (tile) {
        return [tile, store.tileNameToAngle[tile][randAngle(store.tileNameToAngle, tile)]]
    }

    return []
}
