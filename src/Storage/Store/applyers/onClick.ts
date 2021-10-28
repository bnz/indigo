import { Store } from "../Store"
import { runInAction } from "mobx"

export const onClick = (store: Store) => () => {
    if (store.hoveredId !== null) {
        runInAction(() => {
            store.preSit = true
        })
    }
}
