import { recalc } from "./recalc"
import { Store } from "../Store"

type OnWindowResize = (store: Store) => () => void

export const onWindowResize: OnWindowResize = (store) => () => {
    const [width, height] = store.elSizes
    if (store.width !== width || store.height !== height) {
        store.width = width
        store.height = height
        recalc(store)
    }
}
