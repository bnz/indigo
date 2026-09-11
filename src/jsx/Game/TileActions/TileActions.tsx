import type { FC } from "react"
import { observer } from "mobx-react"
import { runInAction } from "mobx"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { cancelPreSit } from "../../../Storage/Store/applyers/cancelPreSit"
import { applySit } from "../../../Storage/Store/applyers/applySit"
import { rotateLeft, rotateRight } from "../../../Storage/Store/applyers/rotate"
import { tileHoveredCSS } from "../../../Storage/Store/applyers/tileHoveredCSS"
import { calcScore } from "../../../helpers/calcScore"
import { i18n } from "../../../i18n/i18n"
import { playerName } from "../../../helpers/playerName"
import styles from "./TileActions.module.css"

export const TileActions: FC = observer(() => {
    const store = useStore()
    const error = store.error ?? (store.placementError === "gateBlocked" ? "gateBlocked" : null)
    const moving = store.animatedStones !== null
    const movementLabel = store.scoreChanges.length ? "game.scoring" : store.collecting ? "game.collecting" : "game.moving"
    const currentPlayer = store.playersStore.players.find(player => player.id === store.playerMove[0])

    return (
        <section className={styles.root} aria-label={i18n("game.controls")}>
            <div className={styles.summary}>
                <div>
                    <strong role="status">
                        {moving ? i18n(movementLabel) : store.finished ? i18n("result.text.h1") : `${i18n("game.turn")}: ${currentPlayer ? playerName(currentPlayer) : ""}`}
                    </strong>
                    <div className={styles.scores}>
                        {store.playersStore.players.map(player => (
                            <span key={player.id}>
                                <i style={{ backgroundColor: `var(--sphere-${player.id}-color)` }} />
                                {playerName(player)}: {calcScore(store.visiblePlayerStones(player.id))}
                            </span>
                        ))}
                    </div>
                    <small>{i18n("game.tilesLeft")}: {store.leftTiles.length}</small>
                </div>
                {store.currentTileName && !moving && (
                    <div className={styles.preview} style={tileHoveredCSS(store)} role="img" aria-label={i18n("game.currentTile")} />
                )}
            </div>
            <p className={styles.hint} role={error ? "alert" : undefined}>
                {error ? i18n(`game.${error}`) : moving ? i18n("game.wait") : store.finished ? i18n("game.finishedHint") : i18n("game.selectHint")}
            </p>
            {store.saveFailed && <p role="alert">{i18n("game.saveFailed")}</p>}
            <div className={styles.buttons}>
                {store.finished ? (
                    <button className={styles.apply} disabled={moving} onClick={() => runInAction(() => { store.gameResultsOpen = true })}>
                        {i18n("game.results")}
                    </button>
                ) : (
                    <>
                        <button className={styles.button} disabled={!store.canPlay || store.isRouteCrossroad} onClick={rotateRight(store)} aria-label={i18n("game.rotateLeft")}>
                            {i18n("game.rotateLeft")}
                        </button>
                        <button className={styles.button} disabled={!store.canPlay || store.isRouteCrossroad} onClick={rotateLeft(store)} aria-label={i18n("game.rotateRight")}>
                            {i18n("game.rotateRight")}
                        </button>
                        <button className={styles.button} disabled={!store.preSit || !store.canPlay} onClick={cancelPreSit(store)}>
                            {i18n("button.cancel")}
                        </button>
                        <button className={styles.apply} disabled={!store.preSit || !store.canPlay || !!store.placementError} onClick={applySit(store)}>
                            {i18n("game.place")}
                        </button>
                    </>
                )}
            </div>
        </section>
    )
})
