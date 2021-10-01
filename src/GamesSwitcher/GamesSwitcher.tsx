import { FC, useState } from "react"
import styles from "./GamesSwitcher.module.css"
import cx from "classnames"

export const GamesSwitcher: FC = () => {

    const [visible, setVisible] = useState(false)

    return (
        <div className={styles.root}>
            <h1
                className={styles.heading}
                onClick={() => {
                    setVisible(true)
                }}
            >
                Indigo
            </h1>
            <ul className={cx(styles.list, { [styles.visible]: visible })}>
                <li className={styles.active} onClick={() => {
                    setVisible(false)
                }}>
                    Indigo
                </li>
                <li onClick={() => {
                    setVisible(false)
                }}>
                    Yacht
                </li>
            </ul>
        </div>
    )
}
