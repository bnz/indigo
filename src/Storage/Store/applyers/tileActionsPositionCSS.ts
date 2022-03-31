import { CSSProperties } from "react"
import { toHex } from "./toHex"
import { Store } from "../Store"

export const tileActionsPositionCSS = (store: Store): CSSProperties => {
    const [q, r] = (store.hoveredId || "0,0").split(",")
    const { x, y } = store.layout.hexToPixel(toHex(parseInt(q, 10), parseInt(r, 10)))

    return {
        ["--XX" as string]: `${x}px`,
        ["--YY" as string]: `${y}px`,
    }
}
