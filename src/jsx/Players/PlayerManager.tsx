import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { i18n } from "../../i18n/i18n"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { useStore } from "../../Storage/Store/StoreProvider"
import { Sphere } from "../Game/Sphere/Sphere"
import styles from "./PlayerManager.module.css"
import playerStyles from "./Player.module.css"
import { addPlayer } from "../../Storage/PlayersStore/applyers/addPlayer"
import { removePlayerById } from "../../Storage/PlayersStore/applyers/removePlayerById"

export const PlayerManager: FC = observer(() => {
    const uiStore = useUIStore()
    const store = useStore()

    return (
        <>
            <div className={styles.playersWrapper}>
                {store.playersStore.entries.map(([, { id }], index) => {
                    const clear = store.playersStore.entries.length > 2 && index === store.playersStore.entries.length - 1

                    return (
                        <button
                            key={id}
                            className={cx(playerStyles.root, { [playerStyles.clear]: clear })}
                            {...(clear && {
                                onClick: removePlayerById(store.playersStore)(id),
                            })}
                        >
                            <Sphere color={id} />
                        </button>
                    )
                })}
                {store.playersStore.entries.length < 4 && (
                    <button className={playerStyles.add} onClick={addPlayer(store.playersStore)}>
                        {i18n("button.addPlayer")}
                    </button>
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
