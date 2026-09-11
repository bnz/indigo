import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"

export const playerMoveRouteTile = (store: Store): CSSProperties => {
    const [, name, , rotation] = store.playerMove
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
