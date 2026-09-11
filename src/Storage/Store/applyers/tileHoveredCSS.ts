import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"

export const tileHoveredCSS = (store: Store): CSSProperties => {
    const { playerMove } = store
    const name = playerMove.length > 1 ? playerMove[1] : undefined
    const rotation = playerMove.length > 3 ? playerMove[3] : undefined
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
