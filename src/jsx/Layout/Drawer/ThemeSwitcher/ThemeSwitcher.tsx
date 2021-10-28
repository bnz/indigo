import { FC } from "react"
import { observer } from "mobx-react"
import styles from "./ThemeSwitcher.module.css"
import { useUIStore } from "../../../../Storage/UIStore/UIStoreProvider"
import cx from "classnames"
import { Theme } from "../../../../Storage/UIStore/UIStore"

export const ThemeSwitcher: FC = observer(() => {
    const store = useUIStore()
    const theme = store.theme
    const fn = (th: Theme) => cx(styles[th], { [styles.selected]: theme === th })

    return (
        <div className={styles.wrapper}>
            <input
                type="radio"
                className={fn("light")}
                onClick={store.changeTheme("light")}
            />
            <input
                type="radio"
                className={fn("dark")}
                onClick={store.changeTheme("dark")}
            />
            <input
                type="radio"
                className={fn("system")}
                onClick={store.changeTheme("system")}
            />
            {/*
            <label className={styles.checkboxLabel}>
                <h5>{i18n("systemTheme")}</h5>
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={themeSystem}
                    onChange={store.useSystemTheme}
                />
            </label>
            */}
        </div>
    )
})
