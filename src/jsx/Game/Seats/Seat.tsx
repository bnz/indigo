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
import { cssBgUrl } from "../../../Storage/Store/applyers/cssBgUrl"
import svg from "../../../assets/hex.svg"
import { i18n } from "../../../i18n/i18n"

export interface SeatProps {
    playerClass: string
    playerId: PlayerId
    stones: StoneId[]
}

export const Seat: FC<SeatProps> = observer(({ playerId, playerClass, stones }) => {
    const store = useStore()
    const online = store.online
    const ownTile = online?.me === playerId ? online.tile : null
    const active = playerId === store.playerMove[0]
    const showTile = !store.finished && (online ? !!ownTile : !!store.currentTileName && active)
    const previewStyle = online && !active && ownTile
        ? cssBgUrl(`${svg}#${ownTile === "c" ? "c" : `${ownTile}-0`}`)
        : playerMoveRouteTile(store)

    return (
        <>
            {showTile && (
                <div
                    className={cx(styles.hex, playerClass)}
                    style={previewStyle}
                    data-testid={online ? "private-tile" : undefined}
                    data-player={playerId}
                    role={online ? "img" : undefined}
                    aria-label={online ? i18n("online.privateTile") : undefined}
                    title={online ? i18n("online.privateTile") : undefined}
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
