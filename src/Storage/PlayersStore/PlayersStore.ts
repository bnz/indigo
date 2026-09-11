import { makeAutoObservable } from "mobx"
import { iLocalStorageMgmnt } from "../LocalStorageMgmnt"
import { Edge, Keys, PlayerId, Players, PlayersGateways, StoneId, Values } from "../../types"
import { leadingPlayers } from "../../game/rules"
import { generateFirstTwoPlayers, playerInitData } from "./applyers/generateFirstTwoPlayers"

import purple from "../../jsx/Game/Sphere/assets/purple.svg"
import turquoise from "../../jsx/Game/Sphere/assets/turquoise.svg"
import coral from "../../jsx/Game/Sphere/assets/coral.svg"
import white from "../../jsx/Game/Sphere/assets/white.svg"

type PlayerCount = 2 | 3 | 4

const gatewayExits: [string, Edge][][] = [
    [["-4,-1", 0], ["-3,-2", 0], ["-3,-2", 5], ["-2,-3", 5], ["-2,-3", 0], ["-1,-4", 5]],
    [["1,-5", 5], ["2,-5", 4], ["2,-5", 5], ["3,-5", 4], ["3,-5", 5], ["4,-5", 4]],
    [["5,-4", 4], ["5,-3", 3], ["5,-3", 4], ["5,-2", 3], ["5,-2", 4], ["5,-1", 3]],
    [["4,1", 3], ["3,2", 2], ["3,2", 3], ["2,3", 2], ["2,3", 3], ["1,4", 2]],
    [["-1,5", 2], ["-2,5", 1], ["-2,5", 2], ["-3,5", 1], ["-3,5", 2], ["-4,5", 1]],
    [["-5,4", 1], ["-5,3", 0], ["-5,3", 1], ["-5,2", 0], ["-5,2", 1], ["-5,1", 0]],
]

// Each row is one physical gateway and lists the player slots sharing it.
const gatewayOwnerSlots: Record<PlayerCount, number[][]> = {
    2: [[0], [1], [0], [1], [0], [1]],
    3: [[0], [0, 1], [2], [2, 0], [1], [1, 2]],
    4: [[0, 1], [1, 2], [0, 3], [3, 1], [2, 0], [2, 3]],
}

const playerIdToSVGMap: Record<PlayerId, string> = {
    [PlayerId.Player1]: purple,
    [PlayerId.Player2]: turquoise,
    [PlayerId.Player3]: coral,
    [PlayerId.Player4]: white,
}

export class PlayersStore {

    static ids: number[] = Object.keys(playerIdToSVGMap).map((id) => parseInt(id.split("-")[1], 10))

    static storageKey: Keys = "players"

    static maxPlayersCount = 4

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

    get leadingPlayers(): Players {
        return leadingPlayers(this.players)
    }

    addStoneToPlayer = (tileId: string, edgeFrom: Edge, stoneId: StoneId) => {
        const playerId = this.findGatewayOwnerId(tileId, edgeFrom)
        const index = this.players.findIndex(({ id }) => id === playerId)
        this.players[index].stones.push(stoneId)
        this.storage.set(PlayersStore.storageKey, this.players)
    }

    setPlayerCount = (count: PlayerCount) => {
        this.players = Array.from({ length: count }, (_, index) => playerInitData(index + 1))
        this.generatePlayersGateways()
        this.storage.set(PlayersStore.storageKey, this.players)
    }

    generatePlayersGateways = () => {
        const count = this.players.length as PlayerCount
        this.gateways = Object.fromEntries(this.players.map(player => [player.id, []])) as PlayersGateways
        gatewayOwnerSlots[count]?.forEach((owners, gatewayIndex) => {
            owners.forEach(playerIndex => {
                this.gateways[this.players[playerIndex].id]!.push(...gatewayExits[gatewayIndex])
            })
        })
        this.storage.set("players-gateways", this.gateways)
    }

    get entries() {
        return Object.entries(this.players)
    }

    dispose = () => {
        this.storage.destroy()
        this.init()
    }
}
