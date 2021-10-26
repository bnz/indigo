import { Layout } from "../../jsx/Game/Hexagons/Layout"
import { Point } from "../../jsx/Game/Hexagons/Point"
import { Store } from "../Store"

export const updateLayout = (store: Store): void => {
    store.layout = new Layout(
        store.orientation,
        new Point(store.R, store.R),
        new Point(
            store.width / 2,
            store.R * (store.isPointy ? store.largeSide : store.smallSide),
        ),
    )
}
