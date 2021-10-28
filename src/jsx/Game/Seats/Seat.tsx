import { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { rotateRight } from "../../../Storage/Store/applyers/rotate"
import { playerMoveRouteTile } from "../../../Storage/Store/applyers/playerMoveRouteTile"
import { PlayerId } from "../../../types"
import styles from "./Seats.module.css"

export interface SeatProps {
    playerClass: string
    playerId: PlayerId
}

export const Seat: FC<SeatProps> = observer(({ playerId, playerClass }) => {
    const store = useStore()

    if (playerId !== store.playerMove[0]) {
        return null
    }

    return (
        <>
            <div className={cx(styles.highlight, playerClass)} />
            <div
                className={cx(styles.hex, playerClass)}
                style={playerMoveRouteTile(store)}
                onClick={rotateRight(store)}
            />
        </>
    )
})
