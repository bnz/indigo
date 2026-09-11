import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { i18n } from "../../i18n/i18n"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { useStore } from "../../Storage/Store/StoreProvider"
import { addPlayer } from "../../Storage/PlayersStore/applyers/addPlayer"
import { removePlayerById } from "../../Storage/PlayersStore/applyers/removePlayerById"
import { playerName } from "../../helpers/playerName"
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
                {store.playersStore.entries.map(([, player], index) => {
                    const { id } = player
                    return (
                        <div className={styles.player} key={id}>
                            <button
                                className={cx(playerStyles.root, { [playerStyles.clear]: index >= 2 })}
                                aria-label={index >= 2 ? `${playerName(player)}: ${i18n("button.removePlayer")}` : playerName(player)}
                                onClick={index >= 2 ? removePlayerById(store.playersStore)(id) : undefined}
                            >
                                <Sphere color={id} />
                            </button>
                            <input
                                className={styles.name}
                                value={player.name ?? ""}
                                placeholder={playerName(player)}
                                maxLength={24}
                                aria-label={`${i18n("player.name")}: ${playerName(player)}`}
                                onChange={event => store.playersStore.setPlayerName(id, event.target.value)}
                            />
                        </div>
                    )
                })}
                {store.playersStore.players.length < 4 && (
                    <div className={styles.player}>
                        <button className={playerStyles.add} aria-label={i18n("button.addPlayer")} onClick={addPlayer(store.playersStore)} />
                        <div className={styles.nameSpacer} />
                    </div>
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
