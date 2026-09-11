import { PlayerId } from "../../../types"
import { runInAction } from "mobx"
import { savePlayers } from "./savePlayers"
import { PlayersStore } from "../PlayersStore"

type RemovePlayerById = (store: PlayersStore) => (playerId: PlayerId) => () => void

export const removePlayerById: RemovePlayerById = (store) => (playerId) => () => {
    if (store.players.length <= 2) return
    runInAction(() => {
        const index = store.players.findIndex(({ id }) => id === playerId)
        if (index === -1) return
        store.players.splice(index, 1)
        store.generatePlayersGateways()
        savePlayers(store)
    })
}
