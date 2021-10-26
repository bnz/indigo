import { PlayerId, Players } from "../../../types"
import { getRandomInt } from "../../../helpers/random"
import { PlayersStore } from "../PlayersStore"

export const generateFirstTwoPlayers = (): Players => {
    const first = getRandomInt(1, PlayersStore.maxPlayersCount)

    let second

    do {
        second = getRandomInt(1, PlayersStore.maxPlayersCount)
    } while (second === first)

    return [
        { id: `p-${first}` as PlayerId },
        { id: `p-${second}` as PlayerId },
    ]
}
