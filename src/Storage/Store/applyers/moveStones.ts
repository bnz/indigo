import { Store } from "../Store"
import { keys, runInAction } from "mobx"
import { Edge, GatewayTiles, HexType, PlayerId, RouteTiles, StoneId, TreasureTiles } from "../../../types"
import { routeTileIdToEdgeMap } from "../maps/routeTileIdToEdgeMap"
import { treasureTileIdToEdgeMap } from "../maps/treasureTileIdToEdgeMap"
import { Hex } from "../../../jsx/Game/Hexagons/Hex"
import { toHex } from "./toHex"

const getOppositeCorner = (d: number): Edge => (d + 3) % 6 as Edge
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Res = [q: number, r: number, edge: Edge][]

class Klass {

    constructor(
        private store: Store,
        private stoneId: StoneId,
    ) {
        const [, q, r, edge] = this.store.stones[stoneId]
        this.run(q, r, edge)
    }

    private path: Res = []

    private run(q: number, r: number, edge: Edge) {
        const neighbor = this.store.tiles[toHex(q, r).neighbor(edge).id]

        if (neighbor) {
            const { hex, type, tile } = neighbor

            switch (type) {
                case HexType.treasure: {
                    if (tile) {
                        const routeTile = TreasureTiles[tile!] as keyof typeof TreasureTiles
                        const edgeFrom = getOppositeCorner(edge)
                        const edgeTo = treasureTileIdToEdgeMap[routeTile][edgeFrom]
                        this.cacheAndRun(hex, edgeTo)
                    } else {
                        void this.move()
                    }
                    break
                }
                case HexType.route: {
                    if (tile) {
                        const routeTile = RouteTiles[tile!] as keyof typeof RouteTiles
                        const edgeFrom = getOppositeCorner(edge)
                        const edgeTo = routeTileIdToEdgeMap[routeTile][edgeFrom]
                        this.cacheAndRun(hex, edgeTo)
                    } else {
                        void this.move()
                    }
                    break
                }
                case HexType.gateway: {
                    if (this.stoneId !== StoneId.emerald4) {
                        break
                    }

                    const edgeFrom = getOppositeCorner(edge)

                    this.path.push([hex.q, hex.r, edgeFrom])

                    ;(async () => {
                        await this.move()

                        const player = Object.keys(this.store.playersStore.gateways).find((key) => (
                            this.store.playersStore.gateways[key as PlayerId]?.find(([_tile, edges]) => (
                                _tile === tile && edges.indexOf(edgeFrom) !== -1
                            ))
                        ))

                        console.log(`move to player "${player}"`)

                        // add stone to player


                    })()
                    break
                }
            }
        }
    }

    private cacheAndRun(hex: Hex, edge: Edge) {
        this.path.push([hex.q, hex.r, edge])
        this.run(hex.q, hex.r, edge)
    }

    private async move() {
        for (const [q, r, edge] of this.path) {
            runInAction(() => {
                this.store.stones[this.stoneId][1] = q
                this.store.stones[this.stoneId][2] = r
                this.store.stones[this.stoneId][3] = edge
            })
            await sleep(500)
        }
    }
}

export const moveStones = (store: Store): void => {
    keys(store.stones).map((value) =>
        new Klass(store, value as StoneId),
    )
}
