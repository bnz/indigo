import { Angle, TileName } from "../../../types"
import { randAngle } from "./randAngle"
import { Store} from "../Store"
import { tileNameToAngle } from "../maps/TileNameToAngle"

export const getRandomTile = (store: Store): [TileName, Angle] | [] => {
    const tile = store.leftTiles.pop()
    store.storage.set("tiles-left", store.leftTiles)

    if (tile) {
        return [tile, tileNameToAngle[tile][randAngle(tileNameToAngle, tile)]]
    }

    return []
}
