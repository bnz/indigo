import { FC, useCallback, useEffect, useState } from "react"
import styles from "./GamesSwitcher.module.css"
import cx from "classnames"
import { i18n } from "../i18n/i18n"

export const GamesSwitcher: FC = () => {
    const [visible, setVisible] = useState(false)
    const open = useCallback(() => {
        setVisible(true)
    }, [])
    const close = useCallback(() => {
        setVisible(false)
    }, [])

    useEffect(() => {
        if (visible) {
            document.addEventListener("click", close)
        } else {
            document.removeEventListener("click", close)
        }
    }, [visible, close])

    return (
        <div className={styles.root}>
            <h1 className={styles.heading} onClick={open}>
                {i18n('indigo')}
            </h1>
            <ul className={cx(styles.list, { [styles.visible]: visible })}>
                <li className={styles.active}>{i18n('indigo')}</li>
                <li>{i18n('yacht')}</li>
            </ul>
        </div>
    )
}
