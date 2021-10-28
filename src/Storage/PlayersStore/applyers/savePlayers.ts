import { PlayersStore } from "../PlayersStore"

export const savePlayers = (store: PlayersStore) => {
    store.storage.set(PlayersStore.storageKey, store.players)
}
