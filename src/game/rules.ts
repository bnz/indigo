import { Edge, GemAward, GemCollision, HexType, PlayerId, Players, PlayersGateways, RouteTiles, Stone, StoneId, Stones, StoneType, Tiles, TreasureTiles } from "../types"
import { routeTileIdToEdgeMap } from "../Storage/Store/maps/routeTileIdToEdgeMap"
import { treasureTileIdToEdgeMap } from "../Storage/Store/maps/treasureTileIdToEdgeMap"
import { toHex } from "../Storage/Store/applyers/toHex"
import { calcScore } from "../helpers/calcScore"

export const placementError = (tiles: Tiles, id: string, route: RouteTiles): "occupied" | "gateBlocked" | null => {
    const cell = tiles[id]
    if (!cell || cell.type !== HexType.route || cell.tile !== undefined) return "occupied"

    const connections = routeTileIdToEdgeMap[RouteTiles[route] as keyof typeof RouteTiles]
    const exits = [0, 1, 2, 3, 4, 5].filter(edge => tiles[cell.hex.neighbor(edge).id]?.type === HexType.gateway)
    return exits.some(edge => exits.includes(connections[edge])) ? "gateBlocked" : null
}

export const leadingPlayers = (players: Players): Players => {
    const score = Math.max(...players.map(player => calcScore(player.stones)))
    const contenders = players.filter(player => calcScore(player.stones) === score)
    const count = Math.max(...contenders.map(player => player.stones.length))
    return contenders.filter(player => player.stones.length === count)
}

// Resolve against one board snapshot. Animation and persistence must not change the rules.
export const resolveMove = (tiles: Tiles, stones: Stones, id: string, route: RouteTiles, gateways: PlayersGateways) => {
    if (placementError(tiles, id, route)) throw new Error("Invalid placement")
    const board = { ...tiles, [id]: { ...tiles[id], tile: route } }
    const origins: Partial<Record<StoneId, Stone>> = {}
    const paths: Partial<Record<StoneId, Stone[]>> = {}
    const collidedStones = new Set<StoneId>()
    const collisionPairs = new Map<string, [StoneId, StoneId]>()
    const awards: GemAward[] = []
    const result = Object.fromEntries(Object.entries(stones).map(([key, stone]) => [key, [...stone]])) as Stones
    const ids = Object.keys(stones) as StoneId[]
    const centerEdge = [0, 1, 2, 3, 4, 5].find(edge => toHex(0, 0).neighbor(edge).id === id)

    if (centerEdge !== undefined) {
        const reserve = ids.filter(key => {
            const [, q, r, , out] = stones[key]
            return !out && q === 0 && r === 0
        })
        const released = reserve.find(key => stones[key][0] === StoneType.emerald) ?? reserve[0]
        if (released) origins[released] = [stones[released][0], 0, 0, centerEdge as Edge]
    }
    for (const key of ids) {
        const [type, q, r, edge, out] = stones[key]
        if (!out && (q !== 0 || r !== 0) && toHex(q, r).neighbor(edge).id === id) {
            origins[key] = [type, q, r, edge]
        }
    }

    for (const key of Object.keys(origins) as StoneId[]) {
        const path = [origins[key]!]
        paths[key] = path
        let [type, q, r, edge] = origins[key]!
        const visited = new Set<string>()
        while (true) {
            const position = `${q},${r}:${edge}`
            if (visited.has(position)) throw new Error("A gem entered a closed route")
            visited.add(position)
            const neighbor = board[toHex(q, r).neighbor(edge).id]
            if (!neighbor) throw new Error("A route leaves the board outside a gateway")
            const entry = (edge + 3) % 6 as Edge
            const other = (Object.keys(origins) as StoneId[]).find(otherId => {
                const stone = origins[otherId]!
                return otherId !== key && stone[1] === neighbor.hex.q && stone[2] === neighbor.hex.r && stone[3] === entry
            })
            if (other) {
                path.push([type, neighbor.hex.q, neighbor.hex.r, entry])
                collidedStones.add(key)
                collidedStones.add(other)
                const stoneIds = [key, other].sort() as [StoneId, StoneId]
                collisionPairs.set(stoneIds.join(":"), stoneIds)
                break
            }
            if (neighbor.type === HexType.gateway) {
                const owners = (Object.keys(gateways) as PlayerId[]).filter(playerId =>
                    gateways[playerId]!.some(([tileId, exit]) => tileId === neighbor.hex.id && exit === entry),
                )
                if (!owners.length) throw new Error("Gateway has no owner")
                owners.forEach(playerId => awards.push({ playerId, stoneId: key }))
                path.push([type, neighbor.hex.q, neighbor.hex.r, entry])
                result[key] = [type, neighbor.hex.q, neighbor.hex.r, entry, true]
                break
            }
            if (neighbor.tile === undefined) {
                result[key] = [type, q, r, edge]
                break
            }
            const connections = neighbor.type === HexType.route
                ? routeTileIdToEdgeMap[RouteTiles[neighbor.tile] as keyof typeof RouteTiles]
                : treasureTileIdToEdgeMap[TreasureTiles[neighbor.tile] as keyof typeof TreasureTiles]
            const exit = connections?.[entry]
            if (exit === null || exit === undefined) throw new Error("A gem returned to a treasure source")
            q = neighbor.hex.q
            r = neighbor.hex.r
            edge = exit
            path.push([type, q, r, edge])
        }
    }

    for (const key of Array.from(collidedStones)) {
        // Both gems disappear near their meeting point, not at each other's starting positions.
        paths[key] = paths[key]!.slice(0, Math.ceil((paths[key]!.length + 1) / 2))
        const last = paths[key]![paths[key]!.length - 1]
        result[key] = [...last]
        result[key][4] = true
    }
    const collisions: GemCollision[] = Array.from(collisionPairs.values()).map(stoneIds => {
        const path = paths[stoneIds[0]]!
        const [, q, r] = path[path.length - 1]
        return { stoneIds, q, r }
    })
    const frames: Stones[] = []
    const length = Math.max(0, ...Object.values(paths).map(path => path!.length))
    for (let step = 0; step < length; step++) {
        const frame = { ...stones }
        for (const key of Object.keys(paths) as StoneId[]) {
            const path = paths[key]!
            frame[key] = path[Math.min(step, path.length - 1)]
        }
        frames.push(frame)
    }
    return { stones: result, awards, collisions, frames }
}
