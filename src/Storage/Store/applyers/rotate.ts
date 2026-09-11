import { tileNameToAngle } from "../maps/TileNameToAngle"
import { Store } from "../Store"
import { MouseEvent } from "react"
import { runInAction } from "mobx"

const rotate = (store: Store) => (rotateBack: boolean): void => {
    const [playerId, tile, angle = 0, rotateAngle = 0, savedNextAngle] = store.playerMove
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
