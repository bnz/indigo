import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"

export const playerMoveRouteTile = (store: Store): CSSProperties => {
    const { playerMove } = store
    const name = playerMove.length > 1 ? playerMove[1] : undefined
    const rotation = playerMove.length > 3 ? playerMove[3] : undefined
    if (name) {
        return {
            ...cssBgUrl([svg, "#", getPlayerMoveTile(store)].join("")),
            ...(rotation !== undefined ? {
                transform: `translate(var(--X), var(--Y)) rotate(${rotation}deg)`,
            } : {}),
        }
    }
    return {}
}
