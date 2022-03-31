import { Player, PlayerId, Players } from "../../../types"
import { getRandomInt } from "../../../helpers/random"
import { PlayersStore } from "../PlayersStore"

export const playerInitData = (i: number): Player => ({
    id: `p-${i}` as PlayerId,
    stones: [],
})

export const generateFirstTwoPlayers = (): Players => {
    const first = getRandomInt(1, PlayersStore.maxPlayersCount)

    let second

    do {
        second = getRandomInt(1, PlayersStore.maxPlayersCount)
    } while (second === first)

    return [playerInitData(first), playerInitData(second)]
}
