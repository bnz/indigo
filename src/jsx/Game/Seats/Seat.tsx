import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { rotateRight } from "../../../Storage/Store/applyers/rotate"
import { playerMoveRouteTile } from "../../../Storage/Store/applyers/playerMoveRouteTile"
import { PlayerId, StoneId } from "../../../types"
import styles from "./Seats.module.css"
import { CollectedStone } from "./CollectedStone"
import { PlayerScore } from "./PlayerScore"

export interface SeatProps {
    playerClass: string
    playerId: PlayerId
    stones: StoneId[]
}

export const Seat: FC<SeatProps> = observer(({ playerId, playerClass, stones }) => {
    const store = useStore()

    return (
        <>
            {store.currentTileName && playerId === store.playerMove[0] && (
                <div
                    className={cx(styles.hex, playerClass)}
                    style={playerMoveRouteTile(store)}
                    onClick={event => {
                        event.stopPropagation()
                        rotateRight(store)()
                    }}
                />
            )}
            {stones.length > 0 && (
                <>
                    <PlayerScore playerId={playerId} playerClass={playerClass} />
                    {stones.map((stone, index) => (
                        <CollectedStone key={stone} id={stone} playerId={playerId} playerClass={playerClass} index={index} />
                    ))}
                </>
            )}
        </>
    )
})
