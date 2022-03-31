import { recalc } from "./recalc"
import { Store } from "../Store"
import { runInAction } from "mobx"

type OnWindowResize = (store: Store) => () => void

export const onWindowResize: OnWindowResize = (store) => () => {
    const [width, height] = store.elSizes
    if (store.width !== width || store.height !== height) {
        runInAction(() => {
            store.width = width
            store.height = height
        })
        recalc(store)
    }
}
