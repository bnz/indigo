import { Edge, HexType, RouteTiles, StoneId } from "../../../types"
import { routeTileIdToEdgeMap } from "../maps/routeTileIdToEdgeMap"
import { Store } from "../Store"

const toEdge = (d: number): number => (d + 3) % 6

export const moveStones = (store: Store): void => {
    const tile = store.tiles[store.hoveredId!]
    const hex = tile.hex
    const directions = [...Array(6).keys()]

    const directionsWithStones = directions.filter((direction) => {
        const { type, tile: neighborTile, stones } = store.tiles[hex.neighbor(direction).id]
        return [HexType.route, HexType.treasure].indexOf(type) !== -1
            && neighborTile !== undefined
            && stones !== undefined
            && stones.length
            && stones.some(([, e]) => toEdge(direction) === e)
    })

    const fn = (direction: number): [StoneId, Edge] => {
        const neighbor = store.tiles[hex.neighbor(direction).id]
        const index = neighbor.stones!.findIndex(([, e]) => toEdge(direction) === e)
        const [stoneId, stoneEdge] = neighbor.stones![index]
        const routeTile = RouteTiles[tile.tile!] as keyof typeof RouteTiles
        const newEdge = routeTileIdToEdgeMap[routeTile][toEdge(stoneEdge)]

        neighbor.stones!.splice(index, 1)

        if (neighbor.stones!.length === 0) {
            delete neighbor.stones
        }

        return [stoneId, newEdge]
    }

    directionsWithStones.forEach((direction) => {
        const [stoneId, newEdge] = fn(direction)

        if (tile.stones === undefined) {
            tile.stones = []
        }

        tile.stones.push([stoneId, newEdge])

        store.stones[stoneId][1] = hex.q
        store.stones[stoneId][2] = hex.r
        store.stones[stoneId][3] = newEdge
    })
}
