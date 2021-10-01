import { FC } from "react"
import styles from "./Drawer.module.css"
import cx from "classnames"
import { observer } from "mobx-react"
import { useUIStore } from "../../Store/UIProvider"
import { GamesSwitcher } from "../../GamesSwitcher/GamesSwitcher"

export const Drawer: FC = observer(() => {
    const store = useUIStore()

    return (
        <div className={cx({ [styles.hidden]: !store.drawer })}>
            <div
                className={styles.backdrop}
                onClick={store.toggleDrawer}
            />
            <div className={styles.drawer}>
                <GamesSwitcher />
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis corporis illum perferendis
                    provident quas sunt unde voluptas. Cupiditate esse harum ipsam, neque odit optio possimus quis repellat
                    repellendus sequi vitae!
                </div>
            </div>
        </div>
    )
})