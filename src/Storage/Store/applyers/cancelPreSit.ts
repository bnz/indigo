import { Store } from "../Store"
import { runInAction } from "mobx"
import { MouseEvent } from "react"

export const cancelPreSit = (store: Store) => (): void => {
    runInAction(() => {
        store.preSit = false
        store.hoveredId = null
        store.error = null
    })
}

export const cancelPreSitButton = (store: Store) => (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation()
    cancelPreSit(store)()
}
