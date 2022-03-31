import { makeAutoObservable } from "mobx"
import { iLocalStorageMgmnt } from "../LocalStorageMgmnt"
import { GatewayTiles, Keys, PlayerId, Players, PlayersGateways, Values } from "../../types"
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

    static ids: number[] = Object.keys(playerIdToSVGMap).map((id) => parseInt(id.split("-")[1], 10))

    static storageKey: Keys = "players"

    static maxPlayersCount: number = Object.keys(playerIdToSVGMap).length

    players: Players = []

    gateways: PlayersGateways = {}

    constructor(
        public storage: iLocalStorageMgmnt<Keys, Values>,
    ) {
        this.init()
        makeAutoObservable<PlayersStore, "gateways">(this, { gateways: false })
    }

    private init() {
        this.players = this.storage.getOrApply<Players>(PlayersStore.storageKey, generateFirstTwoPlayers)
        this.generatePlayersGateways()
    }

    generatePlayersGateways = () => {
        switch (this.players.length) {
            case 2:
                this.gateways[this.players[0].id] = [
                    [GatewayTiles["le-r-t"], [0]],
                    [GatewayTiles["g-t-l"], [0, 5]],
                    [GatewayTiles["g-t-l"], [0, 5]],
                    [GatewayTiles["le-t"], [5]],

                    [GatewayTiles["le-l-t"], [4]],
                    [GatewayTiles["g-r"], [3, 4]],
                    [GatewayTiles["g-r"], [3, 4]],
                    [GatewayTiles["le-l-b"], [3]],

                    [GatewayTiles["le-r-b"], [1]],
                    [GatewayTiles["g-b-l"], [1, 2]],
                    [GatewayTiles["g-b-l"], [1, 2]],
                    [GatewayTiles["le-b"], [2]],
                ]

                this.gateways[this.players[1].id] = [
                    [GatewayTiles["le-r-t"], [0]],
                    [GatewayTiles["g-l"], [0, 1]],
                    [GatewayTiles["g-l"], [0, 1]],
                    [GatewayTiles["le-r-b"], [1]],

                    [GatewayTiles["le-l-b"], [3]],
                    [GatewayTiles["g-b-r"], [2, 3]],
                    [GatewayTiles["g-b-r"], [2, 3]],
                    [GatewayTiles["le-b"], [2]],

                    [GatewayTiles["le-t"], [5]],
                    [GatewayTiles["g-t-r"], [4, 5]],
                    [GatewayTiles["g-t-r"], [4, 5]],
                    [GatewayTiles["le-l-t"], [4]],
                ]
                this.storage.set("players-gateways", this.gateways)
                break
            case 3:
            case 4:
                console.error("not implemented")
                break
        }
    }

    get entries() {
        return Object.entries(this.players)
    }

    dispose = () => {
        this.storage.destroy()
        this.init()
    }
}
