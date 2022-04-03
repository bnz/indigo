import type { FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { Sphere } from "../Sphere/Sphere"
import { StoneC } from "../Stone/Stone"
import { calcScore } from "../../../helpers/calcScore"
import styles from "./GameResults.module.css"
import seatsStyles from "../Seats/Seats.module.css"
import { i18n } from "../../../i18n/i18n"
import { Dialog } from "../../Components/Dialog/Dialog"
import buttonStyles from "../../Components/Button/Button.module.css"
import { RestartGame } from "../../Layout/Drawer/RestartGame/RestartGame"
import { runInAction } from "mobx"

export const GameResults: FC = observer(() => {
    const store = useStore()

    if (store.winner === null || !store.gameResultsOpen) {
        return null
    }

    const player = store.winner!

    return (
        <>
            <Dialog>
                <div className={styles.container}>
                    <h1>{i18n("result.text.h1")}</h1>
                    <h2>{i18n("winner")}</h2>

                    <div className={styles.wrap}>
                        <div className={styles.sphereWrap}>
                            <Sphere color={player.id} />
                        </div>
                        <div className={cx(seatsStyles.score, styles.score)}>
                            {calcScore(player.stones)}
                        </div>
                        <div className={styles.stonesWrap}>
                            {player.stones.map((stone) => (
                                <StoneC key={stone} id={stone} className={styles.stone} />
                            ))}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={buttonStyles.text} onClick={() => {
                            runInAction(() => {
                                store.gameResultsOpen = false
                            })
                        }}>
                            {i18n("button.viewBoard")}
                        </button>
                        <RestartGame />
                    </div>

                    <div className={styles.othersWrap}>
                        {store.playersStore.players.filter(({ id }) => id !== player.id).map(({ id, stones }) => (
                            <div key={id}>
                                <div className={styles.otherSphere}>
                                    <Sphere color={id} />
                                </div>
                                <div className={cx(seatsStyles.score, styles.score, styles.otherScore)}>
                                    {calcScore(stones)}
                                </div>
                                <div className={styles.otherStones}>
                                    {stones.map((stone) => (
                                        <StoneC key={stone} id={stone} className={cx(styles.stone, styles.stoneAlt)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </Dialog>
        </>
    )
})
