import { FC } from "react"
import { observer } from "mobx-react"
import styles from "./MenuButton.module.css"
import { useUIStore } from "../../../Storage/UIStore/UIStoreProvider"

export const MenuButton: FC = observer(() => {
    const store = useUIStore()

    return (
        <button
            className={store.drawer ? styles.closeMenu : styles.openMenu}
            onClick={store.toggleDrawer}
        />
    )
})
