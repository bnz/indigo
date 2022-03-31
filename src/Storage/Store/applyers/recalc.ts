import { Store } from "../Store"
import { updateLayout } from "./updateLayout"
import { runInAction } from "mobx"

export const recalc = (store: Store): void => {
    const widthSize = store.isPointy ? store.smallSide * 2 : store.largeSide * 2
    const heightSize = store.isPointy ? store.largeSide * 2 : store.smallSide * 2
    runInAction(() => {
        store.R = Math.min(store.width / widthSize, store.height / heightSize)
    })
    updateLayout(store)
}
