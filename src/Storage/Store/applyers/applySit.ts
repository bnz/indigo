import { nextMove } from "./nextMove"
import { saveTiles } from "./saveTiles"
import { Store } from "../Store"
import { resolveMove } from "../../../game/rules"
import { runInAction } from "mobx"
import type { MouseEvent } from "react"
import { RouteTiles } from "../../../types"

// Both local play and the room host commit through the same rules and persistence path.
export const commitMove = (store: Store, id: string, route: RouteTiles) => {
    const result = resolveMove(store.tiles, store.stones, id, route, store.playersStore.gateways)
    runInAction(() => store.storage.transaction(() => {
        store.tiles[id].tile = route
        store.stones = result.stones
        for (const { playerId, stoneId } of result.awards) {
            store.playersStore.players.find(player => player.id === playerId)!.stones.push(stoneId)
        }
        if (store.finished) store.playerMove = [store.playerMove[0]]
        else nextMove(store)
        saveTiles(store)
        store.storage.set("stones", store.stones)
        store.storage.set("players", store.playersStore.players)
        store.preSit = false
        store.hoveredId = null
        store.gameResultsOpen = true
        store.error = null
        store.animate(result.frames, result.awards, result.collisions)
    }))
    runInAction(() => { store.saveFailed = store.storage.failed })
    return result
}

export const applySit = (store: Store) => () => {
    const id = store.hoveredId
    const route = store.currentRoute
    if (!store.canPlay || id === null || route === undefined) return
    if (store.placementError) {
        runInAction(() => { store.error = store.placementError === "gateBlocked" ? "gateBlocked" : null })
        return
    }
    if (store.online) {
        store.online.submit(id, route)
        return
    }
    try {
        commitMove(store, id, route)
    } catch (error) {
        console.error(error)
        runInAction(() => { store.error = "invalidState" })
    }
}

export const applySitButton = (store: Store) => (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
    applySit(store)()
}
