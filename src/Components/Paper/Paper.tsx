import { FC } from "react"
import styles from "./Paper.module.css"

export const Paper: FC = ({ children }) => {
    return (
        <div className={styles.root}>
            {children}
        </div>
    )
}
