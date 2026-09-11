import type { FC } from "react"
import { observer } from "mobx-react"
import { i18n } from "../../i18n/i18n"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { useStore } from "../../Storage/Store/StoreProvider"
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
                {store.playersStore.entries.map(([, { id }]) => {
                    return (
                        <div
                            key={id}
                            className={playerStyles.root}
                        >
                            <Sphere color={id} />
                        </div>
                    )
                })}
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
