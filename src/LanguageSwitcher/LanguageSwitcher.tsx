import { FC } from "react"
import { observer } from "mobx-react"
import { useUIStore } from "../Store/UIProvider"
import styles from "./LanguageSwitcher.module.css"

export const LanguageSwitcher: FC = observer(() => {
    const store = useUIStore()

    return (
        <div className={styles.root}>
            <button disabled={store.language === "rus"} onClick={store.setLanguage("rus")}>
                рус
            </button>
            <button disabled={store.language === "eng"} onClick={store.setLanguage("eng")}>
                eng
            </button>
        </div>
    )
})
