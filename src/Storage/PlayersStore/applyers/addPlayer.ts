import { PlayersStore } from "../PlayersStore"
import { arrayDiff } from "../../../helpers/arrayDiff"
// import { getRandomInt } from "../../../helpers/random"
import { runInAction } from "mobx"
import { savePlayers } from "./savePlayers"
import { playerInitData } from "./generateFirstTwoPlayers"

type AddPlayer = (store: PlayersStore) => () => void

export const addPlayer: AddPlayer = (store) => () => {
    runInAction(() => {
        const ids = store.players.map(({ id }) => parseInt(id.split("-")[1], 10))
        const diff = arrayDiff(PlayersStore.ids, ids)
        const index = diff[0]
        // const index = diff[getRandomInt(0, diff.length - 1)]
        store.players.push(playerInitData(index))
        savePlayers(store)
    })
}
