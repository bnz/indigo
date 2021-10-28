import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"

export const tileHoveredCSS = (store: Store): CSSProperties => {
    const playerMove = store.playerMove

    return {
        ...cssBgUrl([svg, "#", getPlayerMoveTile(store)].join("")),
        ...(playerMove.length >= 4 && playerMove[3] !== undefined ? {
            transform: `rotate(${playerMove[3]}deg)`,
        } : {}),
        // transitionProperty: "transform",
        // transitionDuration: "calc(var(--duration) * 5)",
    }
}
