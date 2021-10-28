import { getPlayerMoveTile } from "./playerMoveTile"
import { Angle, RouteTiles, TileName } from "../../../types"
import { nextMove } from "./nextMove"
import { saveTiles } from "./saveTiles"
import { Store } from "../Store"
import { moveStones } from "./moveStones"

export const applySit = (store: Store) => () => {
    store.preSit = false

    if (store.hoveredId !== null && getPlayerMoveTile(store) !== undefined) {
        const [, name, angle, , nextAngle] = store.playerMove
        const newRouteTile: [TileName?, Angle?] = [name]

        if (store.playerMove.length === 5 && nextAngle !== undefined) {
            newRouteTile.push(nextAngle)
        } else if (angle !== undefined) {
            newRouteTile.push(angle)
        }

        store.tiles[store.hoveredId].tile = RouteTiles[newRouteTile.join("-") as keyof typeof RouteTiles]
        moveStones(store)
        nextMove(store)
        store.storage.set("stones", store.stones)
        saveTiles(store)
        store.hoveredId = null
    }
}
