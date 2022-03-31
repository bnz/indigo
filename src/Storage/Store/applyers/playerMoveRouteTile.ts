import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"

export const playerMoveRouteTile = (store: Store): CSSProperties => {
    const playerMove = store.playerMove
    if (playerMove[1]) {
        return {
            ...cssBgUrl([svg, "#", getPlayerMoveTile(store)].join("")),
            ...(playerMove.length >= 4 && playerMove[3] !== undefined ? {
                transform: `translate(var(--X), var(--Y)) rotate(${playerMove[3]}deg)`,
            } : {}),
        }
    }
    return {}
}
