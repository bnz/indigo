import { tileNameToAngle } from "../maps/TileNameToAngle"
import { Store } from "../Store"
import { MouseEvent } from "react"
import { runInAction } from "mobx"

const rotate = (store: Store) => (rotateBack: boolean): void => {
    const { playerMove } = store
    const playerId = playerMove[0]
    const tile = playerMove.length > 1 ? playerMove[1] : undefined
    const angle = playerMove.length > 2 ? playerMove[2] ?? 0 : 0
    const rotateAngle = playerMove.length > 3 ? playerMove[3] ?? 0 : 0
    const savedNextAngle = playerMove.length > 4 ? playerMove[4] : undefined
    if (store.canPlay && tile && tile !== "c") {
        const angles = tileNameToAngle[tile]
        const direction = rotateBack ? -1 : 1
        const index = angles.indexOf(savedNextAngle ?? angle)
        const nextAngle = angles[(index + direction + angles.length) % angles.length]
        runInAction(() => {
            store.playerMove = [playerId, tile, angle, rotateAngle + direction * 60, nextAngle]
            store.error = null
        })
    }
}

export const rotateLeft = (store: Store) => (): void => {
    rotate(store)(false)
}

export const rotateLeftButton = (store: Store) => (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
    rotateLeft(store)()
}

export const rotateRight = (store: Store) => (): void => {
    rotate(store)(true)
}

export const rotateRightButton = (store: Store) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    rotateRight(store)()
}
