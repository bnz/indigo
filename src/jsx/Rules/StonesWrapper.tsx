import { FC } from "react"
import styles from "./StonesWrapper.module.css"

export const StonesWrapper: FC = ({ children }) => (
    <div className={styles.wrap}>
        {children}
    </div>
)
