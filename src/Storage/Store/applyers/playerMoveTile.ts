import { Store } from "../Store"

export const getPlayerMoveTile = (store: Store): string | undefined => {
    const { playerMove } = store
    const name = playerMove.length > 1 ? playerMove[1] : undefined
    const angle = playerMove.length > 2 ? playerMove[2] : undefined
    if (!name) return undefined
    return name === "c" ? name : `${name}-${angle ?? 0}`
}
