import { Store } from "../Store"
import { rotateLeft, rotateRight } from "./rotate"

export const onWheel = (store: Store) => (event: WheelEvent) => {
    if (!event.deltaY || !store.canPlay || store.isRouteCrossroad) return
    event.preventDefault()
    if (event.deltaY < 0) rotateRight(store)()
    else rotateLeft(store)()
}
