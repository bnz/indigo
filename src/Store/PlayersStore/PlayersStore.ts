import { makeAutoObservable } from "mobx"
import { iLocalStorageMgmnt } from "../LocalStorageMgmnt"
import { Keys, PlayerId, Players, Values } from "../../types"
import { generateFirstTwoPlayers } from "./applyers/generateFirstTwoPlayers"

import purple from "../../jsx/Game/Sphere/assets/purple.svg"
import turquoise from "../../jsx/Game/Sphere/assets/turquoise.svg"
import coral from "../../jsx/Game/Sphere/assets/coral.svg"
import white from "../../jsx/Game/Sphere/assets/white.svg"

const playerIdToSVGMap: Record<PlayerId, string> = {
    [PlayerId.Player1]: purple,
    [PlayerId.Player2]: turquoise,
    [PlayerId.Player3]: coral,
    [PlayerId.Player4]: white,
}

export class PlayersStore {

    static ids = Object.keys(playerIdToSVGMap).map((id) => parseInt(id.split("-")[1], 10))

    static storageKey: Keys = "players"

    static maxPlayersCount: number = Object.keys(playerIdToSVGMap).length

    constructor(
        public storage: iLocalStorageMgmnt<Keys, Values>,
    ) {
        makeAutoObservable<PlayersStore>(this)
    }

    players = this.storage.getOrApply<Players>(PlayersStore.storageKey, generateFirstTwoPlayers)

    get entries() {
        return Object.entries(this.players)
    }
}
