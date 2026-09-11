import { leadingPlayers, placementError, resolveMove } from "./rules"
import { Edge, HexType, PlayerId, RouteTiles, Stone, StoneId, Stones, StoneType, TileName, Tiles } from "../types"
import { stones as initialStones } from "../Storage/Store/defaults/stones"
import { routes } from "../Storage/Store/defaults/routes"
import { treasures } from "../Storage/Store/defaults/treasures"
import { gateways } from "../Storage/Store/constants/gateways"
import { generateTiles } from "../Storage/Store/applyers/generateTiles"
import { PlayersStore } from "../Storage/PlayersStore/PlayersStore"
import { LocalStorageMgmnt } from "../Storage/LocalStorageMgmnt"
import { Keys, Values } from "../types"
import { tileNameToAngle } from "../Storage/Store/maps/TileNameToAngle"

const board = (): Tiles => ({
    ...generateTiles(routes, HexType.route),
    ...generateTiles(treasures, HexType.treasure),
    ...generateTiles(gateways, HexType.gateway),
})
const stones = (empty = false): Stones => Object.fromEntries(
    Object.entries(initialStones).map(([id, stone]) => [id, [stone[0], stone[1], stone[2], stone[3], empty] as Stone]),
) as Stones
const owners = () => new PlayersStore(new LocalStorageMgmnt<Keys, Values>("rules-test")).gateways

beforeEach(() => localStorage.clear())

test("rejects occupied cells and paths connecting two gateway exits", () => {
    expect(placementError(board(), "0,0", RouteTiles.c)).toBe("occupied")
    expect(placementError(board(), "-3,-1", RouteTiles["s-60"])).toBe("gateBlocked")
    expect(placementError(board(), "-3,-1", RouteTiles["s-0"])).toBeNull()
})

test("releases five emeralds through any new central exits, then the sapphire", () => {
    const tiles = board()
    let gems = stones(true)
    for (const id of Object.keys(gems) as StoneId[]) {
        if (gems[id][0] !== StoneType.amber) gems[id][4] = false
    }
    for (let edge = 0; edge < 6; edge++) {
        const id = tiles["0,0"].hex.neighbor(edge).id
        const result = resolveMove(tiles, gems, id, RouteTiles.c, owners())
        const released = (Object.keys(gems) as StoneId[]).filter(key =>
            gems[key][1] === 0 && gems[key][2] === 0 && (result.stones[key][1] !== 0 || result.stones[key][2] !== 0),
        )
        expect(released).toHaveLength(1)
        expect(result.stones[released[0]][0]).toBe(edge < 5 ? StoneType.emerald : StoneType.sapphire)
        tiles[id].tile = RouteTiles.c
        gems = result.stones
    }
})

test("removes both colliding gems without awarding either and without mutating input", () => {
    const tiles = board()
    tiles["-3,1"].tile = tiles["-1,1"].tile = RouteTiles.c
    const gems = stones(true)
    gems.a0 = [StoneType.amber, -3, 1, 0]
    gems.a1 = [StoneType.amber, -1, 1, 3]
    const before = JSON.stringify({ tiles, gems })
    const result = resolveMove(tiles, gems, "-2,1", RouteTiles.c, owners())
    expect(result.stones.a0[4]).toBe(true)
    expect(result.stones.a1[4]).toBe(true)
    expect(result.awards).toEqual([])
    expect(JSON.stringify({ tiles, gems })).toBe(before)
})

test("gems on different paths of a crossing do not collide", () => {
    const gems = stones(true)
    gems.a0 = [StoneType.amber, -3, 1, 0]
    gems.a1 = [StoneType.amber, -2, 2, 2]
    const result = resolveMove(board(), gems, "-2,1", RouteTiles.c, owners())
    expect(result.stones.a0).toEqual([StoneType.amber, -2, 1, 0])
    expect(result.stones.a1).toEqual([StoneType.amber, -2, 1, 2])
})

test("awards a gem to the owner of its exit, not the current player", () => {
    const gems = stones(true)
    gems.a0 = [StoneType.amber, -3, 1, 3]
    const result = resolveMove(board(), gems, "-4,1", RouteTiles.c, owners())
    expect(result.awards).toEqual([{ playerId: PlayerId.Player2, stoneId: StoneId.amber0 }])
    expect(result.stones.a0[4]).toBe(true)
})

test("ranks by points, then gem count, and preserves shared victories", () => {
    const players = [{ id: PlayerId.Player1, stones: [StoneId.amber0, StoneId.amber1] }, { id: PlayerId.Player2, stones: [StoneId.sapphire] }]
    expect(leadingPlayers(players).map(player => player.id)).toEqual([PlayerId.Player2])
    players[0].stones.push(StoneId.amber2)
    expect(leadingPlayers(players).map(player => player.id)).toEqual([PlayerId.Player1])
    players[0].stones = [StoneId.emerald0]
    players[1].stones = [StoneId.emerald1]
    expect(leadingPlayers(players)).toEqual(players)
})

test.each(Array.from({ length: 50 }, (_, i) => i + 1))("a complete legal game terminates without losing or duplicating gems (seed %i)", seed => {
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed / 4294967296
    }
    const tiles = board()
    let gems = stones()
    const awarded = new Set<StoneId>()
    const deck: TileName[] = ["s", "c", "t", "l", "h"].flatMap(name => Array(name === "s" || name === "c" ? 6 : 14).fill(name))
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    while (deck.length && Object.values(gems).some(gem => !gem[4])) {
        const name = deck.pop()!
        const options: [string, RouteTiles][] = []
        for (const id of Object.keys(tiles)) {
            for (const angle of tileNameToAngle[name]) {
                const route = name === "c" ? RouteTiles.c : RouteTiles[`${name}-${angle}` as keyof typeof RouteTiles]
                if (!placementError(tiles, id, route)) options.push([id, route])
            }
        }
        expect(options.length).toBeGreaterThan(0)
        const [id, route] = options[Math.floor(random() * options.length)]
        const result = resolveMove(tiles, gems, id, route, owners())
        result.awards.forEach(({ stoneId }) => {
            expect(awarded.has(stoneId)).toBe(false)
            awarded.add(stoneId)
        })
        tiles[id].tile = route
        gems = result.stones
        for (const gem of Object.values(gems)) {
            expect([0, 1, 2, 3, 4, 5]).toContain(gem[3] as Edge)
        }
    }
    expect(Object.values(gems).every(gem => gem[4])).toBe(true)
})
