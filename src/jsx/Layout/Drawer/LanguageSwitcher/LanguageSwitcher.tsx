import type { FC } from "react"
import { observer } from "mobx-react"
import { useUIStore } from "../../../../Storage/UIStore/UIStoreProvider"
import styles from "./LanguageSwitcher.module.css"

export const LanguageSwitcher: FC = observer(() => {
    const store = useUIStore()
    const lang = store.language

    return (
        <div className={styles.root}>
            <button disabled={lang === "rus"} onClick={store.setLanguage("rus")}>
                рус
            </button>
            <button disabled={lang === "eng"} onClick={store.setLanguage("eng")}>
                eng
            </button>
        </div>
    )
})
