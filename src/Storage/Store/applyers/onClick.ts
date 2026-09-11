import { Store } from "../Store"
import { runInAction } from "mobx"
import { MouseEvent } from "react"
import { onMouseMove } from "./onMouseMove"

export const onClick = (store: Store) => (event: MouseEvent<HTMLDivElement>) => {
    if (!store.canPlay) return
    runInAction(() => {
        store.preSit = false
        store.error = null
        onMouseMove(store)(event)
        store.preSit = store.hoveredId !== null
    })
}
