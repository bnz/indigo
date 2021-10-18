import { makeAutoObservable, runInAction } from 'mobx'
import { iLocalStorageMgmnt } from './LocalStorageMgmnt'
import { Keys, Player, PlayerId, Players, Values } from '../types'
import { getRandomInt } from '../helpers/random'
import { arrayDiff } from '../helpers/arrayDiff'

import purple from '../jsx/Game/Sphere/assets/purple.svg'
import turquoise from '../jsx/Game/Sphere/assets/turquoise.svg'
import coral from '../jsx/Game/Sphere/assets/coral.svg'
import white from '../jsx/Game/Sphere/assets/white.svg'

export interface iPlayersStore {
    players: Players
    entries: [string, Player][]
    playerIdToSVGMap: Record<PlayerId, string>
    addPlayer(): void
    removePlayerById(playerId: PlayerId): () => void
    reset(): void
}

export class PlayersStore implements iPlayersStore {

    constructor(
        private storage: iLocalStorageMgmnt<Keys, Values>,
    ) {
        makeAutoObservable<PlayersStore, 'playerIdToSVGMap'>(this, {
            playerIdToSVGMap: false,
        })
    }

    get playerIdToSVGMap(): Record<PlayerId, string> {
        return {
            [PlayerId.Player1]: purple,
            [PlayerId.Player2]: turquoise,
            [PlayerId.Player3]: coral,
            [PlayerId.Player4]: white,
        }
    }

    private get ids() {
        return Object.keys(this.playerIdToSVGMap).map((id) => parseInt(id.split('-')[1], 10))
    }

    private get totalPlayersCount() {
        return Object.entries(this.playerIdToSVGMap).length
    }

    private generateFirstTwoPlayers = (): Players => {
        const first = getRandomInt(1, this.totalPlayersCount)
        let second
        do {
            second = getRandomInt(1, this.totalPlayersCount)
        } while (second === first)

        return [
            { id: `p-${first}` as PlayerId },
            { id: `p-${second}` as PlayerId },
        ]
    }

    private save() {
        this.storage.set('players', this.players)
    }

    players = this.storage.getOrApply<Players>('players', this.generateFirstTwoPlayers)

    get entries() {
        return Object.entries(this.players)
    }

    addPlayer = () => {
        const ids = this.players.map(({ id }) => parseInt(id.split('-')[1], 10))
        const diff = arrayDiff(this.ids, ids)
        const index = diff[getRandomInt(0, diff.length - 1)]
        this.players.push({ id: `p-${index}` as PlayerId })
        this.save()
    }

    removePlayerById = (playerId: PlayerId) => () => {
        runInAction(() => {
            this.players.splice(
                this.players.findIndex(({ id }) => id === playerId),
                1,
            )
            this.save()
        })
    }

    reset() {
        this.players = this.generateFirstTwoPlayers()
        this.save()
    }

}
