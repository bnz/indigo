import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { rotateRight } from "../../../Storage/Store/applyers/rotate"
import { playerMoveRouteTile } from "../../../Storage/Store/applyers/playerMoveRouteTile"
import { PlayerId, StoneId } from "../../../types"
import styles from "./Seats.module.css"
import { StoneC } from "../Stone/Stone"
import { calcScore } from "../../../helpers/calcScore"

export interface SeatProps {
    playerClass: string
    playerId: PlayerId
    stones: StoneId[]
}

export const Seat: FC<SeatProps> = observer(({ playerId, playerClass, stones }) => {
    const store = useStore()

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
                        {calcScore(stones)}
                    </div>
                    {stones.map((stone, index) => (
                        <div key={stone} className={cx(styles.stone, playerClass, styles[`s-${index + 1}`])}>
                            <StoneC id={stone} index={index + 1} />
                        </div>
                    ))}
                </>
            )}
        </>
    )
})
