import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { i18n } from "../../i18n/i18n"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { useStore } from "../../Storage/Store/StoreProvider"
import { Sphere } from "../Game/Sphere/Sphere"
import paperStyles from "../Components/Paper/Paper.module.css"
import styles from "./PlayerManager.module.css"
import playerStyles from "./Player.module.css"
import { addPlayer } from "../../Storage/PlayersStore/applyers/addPlayer"
import { removePlayerById } from "../../Storage/PlayersStore/applyers/removePlayerById"

export const PlayerManager: FC = observer(() => {
    const uiStore = useUIStore()
    const store = useStore()
    const hasButton = store.playersStore.entries.length > 2

    return (
        <>
            <div className={paperStyles.paper}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, ab ad aliquam asperiores, atque autem
                beatae eaque esse excepturi illo inventore nam nobis odio quas quia quod veniam voluptatem voluptates!
            </div>
            <div className={styles.playersWrapper}>
                {store.playersStore.entries.map(([, { id }]) => (
                    <button
                        key={id}
                        className={cx(playerStyles.root, { [playerStyles.clear]: hasButton })}
                        {...(hasButton ? { onClick: removePlayerById(store.playersStore)(id) } : {})}
                    >
                        <Sphere color={id} />
                    </button>
                ))}
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
                <button className={styles.startGameButton} onClick={uiStore.gamePhase.startGame}>
                    {i18n("button.startGame")}
                </button>
            </div>
        </>
    )
})
