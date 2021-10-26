import { PlayerId } from "../../../types"
import { runInAction } from "mobx"
import { savePlayers } from "./savePlayers"
import { PlayersStore } from "../PlayersStore"

type RemovePlayerById = (store: PlayersStore) => (playerId: PlayerId) => () => void

export const removePlayerById: RemovePlayerById = (store) => (playerId) => () => {
    runInAction(() => {
        store.players.splice(
            store.players.findIndex(({ id }) => id === playerId),
            1,
        )
        savePlayers(store)
    })
}
