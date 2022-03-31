import { tileNameToAngle } from "../maps/TileNameToAngle"
import { Angle } from "../../../types"
import { Store } from "../Store"
import { MouseEvent } from "react"

const rotate = (store: Store) => (rotateBack: boolean): void => {
    if (store.playerMove[1] && !store.isRouteCrossroad) {
        const [playerId, tile, angle = 0, rotateAngle, savedNextAngle] = store.playerMove
        const angles = tileNameToAngle[tile]

        let nextAngle
        let nextRotateAngle
        let angl = angle

        if (savedNextAngle !== undefined) {
            nextAngle = savedNextAngle
            angl = savedNextAngle
        }

        if (rotateBack) {
            const firstAngle = angles[0]
            const lastAngle = angles[angles.length - 1]
            if (angl === firstAngle) {
                nextAngle = lastAngle
            } else {
                nextAngle = angl - 60
            }
        } else {
            const lastAngle = angles[angles.length - 1]
            if (angl < lastAngle) {
                nextAngle = angl + 60
            } else if (angl === lastAngle) {
                nextAngle = angles[0]
            }
        }

        if (rotateAngle === undefined) {
            nextRotateAngle = 60 * (rotateBack ? -1 : 1)
        } else {
            nextRotateAngle = rotateAngle + 60 * (rotateBack ? -1 : 1)
        }

        store.playerMove = [playerId, tile, angle, nextRotateAngle, nextAngle as Angle]
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
