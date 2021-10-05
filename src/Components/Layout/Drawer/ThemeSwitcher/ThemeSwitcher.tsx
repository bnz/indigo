import { FC } from "react"
import { observer } from "mobx-react"
import styles from "./ThemeSwitcher.module.css"
import { useUIStore } from "../../../../Store/UIProvider"
import { i18n } from "../../../../i18n/i18n"

export const ThemeSwitcher: FC = observer(() => {
    const store = useUIStore()
    const themeSystem = store.themeSystem
    const theme = store.theme

    return (
        <div className={styles.wrapper}>
            <input
                type="radio"
                className={styles.light}
                onClick={store.changeTheme("light")}
                disabled={themeSystem || theme === "light"}
            />
            <input
                type="radio"
                className={styles.dark}
                onClick={store.changeTheme("dark")}
                disabled={themeSystem || theme === "dark"}
            />
            <div />
            <label className={styles.checkboxLabel}>
                <h5>{i18n("systemTheme")}</h5>
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={themeSystem}
                    onChange={store.useSystemTheme}
                />
            </label>
        </div>
    )
})
