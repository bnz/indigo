import { stones, Store, treasures } from "../Store"
import { HexType, OrientationType, PlayerMove, RouteTiles, Stones, TileItems, TileName, TreasureT } from "../../types"
import { generateLeftTiles } from "./generateLeftTiles"
import { getRandomTile } from "./getRandomTile"
import { Layout } from "../../jsx/Game/Hexagons/Layout"
import { generateTiles } from "./generateTiles"

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
        ...generateTiles(store.emptyLines, HexType.decorator),
        ...generateTiles(store.gateways, HexType.gateway),
        ...generateTiles(
            store.storage.getOrApply<TileItems<TreasureT>>("treasure-tiles", () => treasures),
            HexType.treasure,
        ),
        ...generateTiles(
            store.storage.getOrApply<TileItems<RouteTiles>>("route-tiles", () => store.routes),
            HexType.route,
        ),
    }
}
