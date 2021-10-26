import { PlayersStore } from "../PlayersStore"
import { generateFirstTwoPlayers } from "./generateFirstTwoPlayers"
import { savePlayers } from "./savePlayers"

export const resetPlayers = (store: PlayersStore) => {
    store.players = generateFirstTwoPlayers()
    savePlayers(store)
}
