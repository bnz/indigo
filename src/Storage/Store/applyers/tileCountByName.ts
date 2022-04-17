import { TileName } from "../../../types"
import { Store } from "../Store"

export const tileCountByName = (store: Store, tileName: TileName): number => (
    store.leftTiles.filter((name) => name === tileName).length
)
