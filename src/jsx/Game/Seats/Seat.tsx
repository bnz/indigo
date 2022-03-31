import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { rotateRight } from "../../../Storage/Store/applyers/rotate"
import { playerMoveRouteTile } from "../../../Storage/Store/applyers/playerMoveRouteTile"
import { PlayerId, StoneId } from "../../../types"
import styles from "./Seats.module.css"
import { StoneC } from "../Stone/Stone"

export interface SeatProps {
    playerClass: string
    playerId: PlayerId
    stones: StoneId[]
}

export const Seat: FC<SeatProps> = observer(({ playerId, playerClass }) => {
    const store = useStore()

    const stones: StoneId[] = [
        StoneId.sapphire,
        StoneId.amber5,
        StoneId.emerald0,
        StoneId.amber0,
        StoneId.amber4,
        StoneId.emerald3,
        StoneId.amber3,
        StoneId.amber2,
        StoneId.emerald4,
        StoneId.amber1,
        StoneId.emerald2,
        StoneId.emerald1,
    ]

    return (
        <>
            {playerId === store.playerMove[0] && (
                <>
                    <div className={cx(styles.highlight, playerClass)} />
                    <div
                        className={cx(styles.hex, playerClass)}
                        style={playerMoveRouteTile(store)}
                        onClick={rotateRight(store)}
                    />
                </>
            )}
            {stones.length > 0 && (
                <>
                    <div className={cx(styles.score, playerClass)}>
                        {stones.reduce((prev, curr) => {
                            switch (curr[0]) {
                                case "s":
                                    return prev + 3
                                case "e":
                                    return prev + 2
                                case "a":
                                    return prev + 1
                                default:
                                    return prev
                            }
                        }, 0)}
                    </div>
                    {stones.map((stone, index) => (
                        <div key={stone} className={cx(styles.stone, playerClass, styles[`s-${index + 1}`])}>
                            <StoneC id={stone} />
                        </div>
                    ))}
                </>
            )}
        </>
    )
})
