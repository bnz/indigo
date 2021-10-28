import { Store } from "../Store"
import { PlayerMove } from "../../../types"

export const getPlayerMoveTile = (store: Store): PlayerMove | string | undefined => {
    if (store.isRouteCrossroad) {
        return store.playerMove[1]
    }
    return store.playerMove[1] ? [store.playerMove[1], store.playerMove[2]].join("-") : undefined
}
