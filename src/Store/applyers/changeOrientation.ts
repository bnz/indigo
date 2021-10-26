import { runInAction } from "mobx"
import { Layout } from "../../jsx/Game/Hexagons/Layout"
import { recalc } from "./recalc"
import { Store } from "../Store"

export const changeOrientation = (store: Store) => (orientation: "flat" | "pointy") => () => {
    runInAction(() => {
        store.orientation = orientation === "flat" ? Layout.flat : Layout.pointy
        const [width, height] = store.elSizes
        store.width = width
        store.height = height
        recalc(store)
    })
}
