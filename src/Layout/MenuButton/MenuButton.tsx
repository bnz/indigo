import { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import styles from "./MenuButton.module.css"
import { useUIStore } from "../../Store/UIProvider"

export const MenuButton: FC = observer(() => {
    const store = useUIStore()

    return (
        <button
            className={cx(styles.root, store.drawer ? styles.times : styles.burger)}
            onClick={store.toggleDrawer}
        />
    )
})
