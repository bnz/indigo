import { makeAutoObservable } from "mobx"
import { iLocalStorageMgmnt } from "../LocalStorageMgmnt"
import { Edge, Keys, Player, PlayerId, Players, PlayersGateways, StoneId, Values } from "../../types"
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

    private init = () => {
        this.players = this.storage.getOrApply<Players>(PlayersStore.storageKey, generateFirstTwoPlayers)
        this.generatePlayersGateways()
    }

    private findGatewayOwnerId = (tileId: string, edgeFrom: Edge): PlayerId =>
        this.players.find(
            ({ id }) => this.gateways[id]!.find(
                ([id, edge]) => id === tileId && edge === edgeFrom,
            ),
        )!.id

    get leadingPlayer(): Player {
        const stonesCount = this.players.map(({ stones }) => stones.length)
        const index = stonesCount.indexOf(Math.max(...stonesCount))

        return this.players[index]
    }

    addStoneToPlayer = (tileId: string, edgeFrom: Edge, stoneId: StoneId) => {
        const playerId = this.findGatewayOwnerId(tileId, edgeFrom)
        const index = this.players.findIndex(({ id }) => id === playerId)
        this.players[index].stones.push(stoneId)
        this.storage.set(PlayersStore.storageKey, this.players)
    }

    generatePlayersGateways = () => {
        switch (this.players.length) {
            case 2:
                this.gateways[this.players[0].id] = [
                    ["-4,-1", 0],
                    ["-3,-2", 0],
                    ["-3,-2", 5],
                    ["-2,-3", 5],
                    ["-2,-3", 0],
                    ["-1,-4", 5],

                    ["5,-4", 4],
                    ["5,-3", 3],
                    ["5,-3", 4],
                    ["5,-2", 3],
                    ["5,-2", 4],
                    ["5,-1", 3],

                    ["-1,5", 2],
                    ["-2,5", 1],
                    ["-2,5", 2],
                    ["-3,5", 1],
                    ["-3,5", 2],
                    ["-4,5", 1],
                ]

                this.gateways[this.players[1].id] = [
                    ["1,-5", 5],
                    ["2,-5", 4],
                    ["2,-5", 5],
                    ["3,-5", 4],
                    ["3,-5", 5],
                    ["4,-5", 4],

                    ["4,1", 3],
                    ["3,2", 2],
                    ["3,2", 3],
                    ["2,3", 2],
                    ["2,3", 3],
                    ["1,4", 2],

                    ["-5,4", 1],
                    ["-5,3", 0],
                    ["-5,3", 1],
                    ["-5,2", 0],
                    ["-5,2", 1],
                    ["-5,1", 0],
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
