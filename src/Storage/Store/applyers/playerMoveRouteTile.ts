import { CSSProperties } from "react"
import { cssBgUrl } from "./cssBgUrl"
import svg from "../../../assets/hex.svg"
import { getPlayerMoveTile } from "./playerMoveTile"
import { Store } from "../Store"
import { toJS } from "mobx"

export const playerMoveRouteTile = (store: Store): CSSProperties => {
    if (store.playerMove[1]) {
        console.log(toJS(store.playerMove))

        return {
            ...cssBgUrl([svg, "#", getPlayerMoveTile(store)].join("")),
        }
    }
    return {}
}
