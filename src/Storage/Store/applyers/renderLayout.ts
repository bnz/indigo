import { Layout } from "../../../jsx/Game/Hexagons/Layout"
import { Point } from "../../../jsx/Game/Hexagons/Point"
import { Store } from "../Store"

export const renderLayout = (store: Store): Layout => {
    const orientation = store.orientationType

    return new Layout(
        Layout[orientation],
        new Point(1, 1),
        new Point(
            0,
            orientation === "pointy" ? store.largeSide : store.smallSide,
        ),
    )
}
