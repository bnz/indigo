import { Store } from "../Store"
import { PlayerMove } from "../../../types"

export const getPlayerMoveTile = (store: Store): PlayerMove | string | undefined => {
    const move = store.playerMove
    let res = undefined
    if (store.isRouteCrossroad) {
        res = move[1]
    } else if (move[1]) {
        res = [move[1], move[2]].join("-")
    }
    return res
}
