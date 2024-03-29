import { Store } from "../Store"
import {
    HexType,
    OrientationType,
    PlayerMove,
    RouteTiles,
    Stones,
    TileItems,
    TileName,
    TreasureTiles,
} from "../../../types"
import { generateLeftTiles } from "./generateLeftTiles"
import { getRandomTile } from "./getRandomTile"
import { Layout } from "../../../jsx/Game/Hexagons/Layout"
import { generateTiles } from "./generateTiles"
import { treasures } from "../defaults/treasures"
import { routes } from "../defaults/routes"
import { stones } from "../defaults/stones"
import { gateways } from "../constants/gateways"

export const init = (store: Store) => {
    store.leftTiles = store.storage.getOrApply<TileName[]>("tiles-left", generateLeftTiles)

    store.playerMove = store.storage.getOrApply<PlayerMove>(
        "player-move",
        () => {
            const [tile, angle] = getRandomTile(store)
            return [store.playersStore.players[0].id, tile, angle]
        },
    )

    store.orientation = Layout[store.storage.getOrApply<OrientationType>("orientation", () => "flat")]

    store.stones = store.storage.getOrApply<Stones>("stones", () => stones)

    store.tiles = {
        ...generateTiles(gateways, HexType.gateway),
        ...generateTiles(
            store.storage.getOrApply<TileItems<TreasureTiles>>("treasure-tiles", () => treasures),
            HexType.treasure,
        ),
        ...generateTiles(
            store.storage.getOrApply<TileItems<RouteTiles>>("route-tiles", () => routes),
            HexType.route,
        ),
    }
}
