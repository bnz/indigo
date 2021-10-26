import { getRandomTile } from "./getRandomTile"
import { Store } from "../Store"

export const nextMove = (store: Store): void => {
    const index = store.playersStore.entries.findIndex(([, { id }]) => id === store.playerMove[0])
    const keys = Object.keys(store.playersStore.players)
    const nextKey = parseInt(keys[keys.length - 1 > index ? index + 1 : 0], 10)
    const [tile, angle] = getRandomTile(store)
    store.playerMove = [store.playersStore.players[nextKey].id, tile, angle]
}
