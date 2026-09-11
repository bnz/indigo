import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { i18n } from "../../i18n/i18n"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { useStore } from "../../Storage/Store/StoreProvider"
import { addPlayer } from "../../Storage/PlayersStore/applyers/addPlayer"
import { removePlayerById } from "../../Storage/PlayersStore/applyers/removePlayerById"
import { Sphere } from "../Game/Sphere/Sphere"
import styles from "./PlayerManager.module.css"
import playerStyles from "./Player.module.css"

export const PlayerManager: FC = observer(() => {
    const uiStore = useUIStore()
    const store = useStore()

    return (
        <>
            <p>{i18n("game.stageOne")}</p>
            <div className={styles.playersWrapper}>
                {store.playersStore.entries.map(([, { id }], index) => {
                    return (
                        <button
                            key={id}
                            className={cx(playerStyles.root, { [playerStyles.clear]: index >= 2 })}
                            aria-label={index >= 2 ? `${i18n(`player.${id}`)}: ${i18n("button.removePlayer")}` : i18n(`player.${id}`)}
                            onClick={index >= 2 ? removePlayerById(store.playersStore)(id) : undefined}
                        >
                            <Sphere color={id} />
                        </button>
                    )
                })}
                {store.playersStore.players.length < 4 && (
                    <button className={playerStyles.add} aria-label={i18n("button.addPlayer")} onClick={addPlayer(store.playersStore)} />
                )}
            </div>
            <div className={styles.actionsWrapper}>
                <button className={styles.cancelButton} onClick={uiStore.gamePhase.goToPreGame}>
                    {i18n("button.cancel")}
                </button>
                <button className={styles.startGameButton} onClick={() => {
                    uiStore.gamePhase.startGame()
                    store.playerMoveReaction()
                }}>
                    {i18n("button.startGame")}
                </button>
            </div>
        </>
    )
})
