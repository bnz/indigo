import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"

export const tileHoveredCSS = (store: Store): CSSProperties => {
    const [, name, , rotation] = store.playerMove
    if (!name) return {}

    return {
        ...cssBgUrl([svg, "#", getPlayerMoveTile(store)].join("")),
        ...(rotation !== undefined ? {
            transform: `rotate(${rotation}deg)`,
        } : {}),
        // transitionProperty: "transform",
        // transitionDuration: "calc(var(--duration) * 5)",
    }
}
