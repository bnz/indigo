import type { MouseEvent } from "react"
import { Store } from "../Store"
import { applySit } from "./applySit"

type TouchAwareMouseEvent = globalThis.MouseEvent & { sourceCapabilities?: { firesTouchEvents?: boolean } | null }

export const onDoubleClick = (store: Store) => (event: MouseEvent<HTMLDivElement>) => {
    if ((event.nativeEvent as TouchAwareMouseEvent).sourceCapabilities?.firesTouchEvents) return
    applySit(store)()
}
