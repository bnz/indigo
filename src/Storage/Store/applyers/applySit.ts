import { getPlayerMoveTile } from "./playerMoveTile"
import { Angle, RouteTiles, TileName } from "../../../types"
import { nextMove } from "./nextMove"
import { saveTiles } from "./saveTiles"
import { Store } from "../Store"
import { moveStones } from "./moveStones"
import { runInAction } from "mobx"
import type { MouseEvent } from "react"

export const applySit = (store: Store) => () => {
    runInAction(() => {
        store.preSit = false
    })

    if (store.hoveredId !== null && getPlayerMoveTile(store) !== undefined) {
        const [, name, angle, , nextAngle] = store.playerMove
        const newRouteTile: [TileName?, Angle?] = [name]

        if (store.playerMove.length === 5 && nextAngle !== undefined) {
            newRouteTile.push(nextAngle)
        } else if (angle !== undefined) {
            newRouteTile.push(angle)
        }

        runInAction(() => {
            if (store.hoveredId !== null) {
                store.tiles[store.hoveredId].tile = RouteTiles[newRouteTile.join("-") as keyof typeof RouteTiles]
            }
        })

        moveStones(store)
        nextMove(store)
        saveTiles(store)

        runInAction(() => {
            store.hoveredId = null
            store.gameResultsOpen = true
        })
    }
}

export const applySitButton = (store: Store) => (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
    applySit(store)()
}
