import { Store } from "../Store"

export const getPlayerMoveTile = (store: Store): string | undefined => {
    const [, name, angle] = store.playerMove
    if (!name) return undefined
    return name === "c" ? name : `${name}-${angle ?? 0}`
}
