import type { FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import styles from "./Drawer.module.css"
import { useUIStore } from "../../../Storage/UIStore/UIStoreProvider"
import { GamesSwitcher } from "./GamesSwitcher/GamesSwitcher"
import { LanguageSwitcher } from "./LanguageSwitcher/LanguageSwitcher"
import { Footer } from "./Footer/Footer"
import { ThemeSwitcher } from "./ThemeSwitcher/ThemeSwitcher"
import { UIPhase } from "../../../types"
import { RestartGame } from "./RestartGame/RestartGame"
import { RotateLayout } from "./RotateLayout/RotateLayout"
import { KeyboardActions } from "../../Components/KeyboardActions/KeyboardActions"
import { Rules } from "../../Rules/Rules"
import { useOnline } from "../../../online/OnlineProvider"
import { OnlineEntry } from "../../../online/OnlineScreen"

export const Drawer: FC = observer(() => {
    const store = useUIStore()
    const online = useOnline()

    return (
        <div className={cx({ [styles.hidden]: !store.drawer })}>
            {store.drawer && <KeyboardActions actions={{ Escape: store.closeDrawer }} />}
            <div className={styles.backdrop} onClick={store.toggleDrawer} />
            <div className={styles.rulesContainer}>
                <Rules />
            </div>
            <div className={styles.drawer}>
                <GamesSwitcher />
                <div className={styles.content}>
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    {!online?.active && <OnlineEntry />}
                    {((online?.started && online.room) || (!online?.active && store.gamePhase.phase === UIPhase.GAME)) && (
                        <>
                            {!online?.active && <div className={styles.actions}>
                                <RestartGame />
                            </div>}
                            <RotateLayout />
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    )
})
