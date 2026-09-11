import type { FC } from "react"
import { observer } from "mobx-react"
import styles from "./MenuButton.module.css"
import { useUIStore } from "../../../Storage/UIStore/UIStoreProvider"
import { i18n } from "../../../i18n/i18n"

export const MenuButton: FC = observer(() => {
    const store = useUIStore()

    return (
        <button
            aria-label={i18n("button.menu")}
            aria-expanded={store.drawer}
            className={store.drawer ? styles.closeMenu : styles.openMenu}
            onClick={store.toggleDrawer}
        />
    )
})
