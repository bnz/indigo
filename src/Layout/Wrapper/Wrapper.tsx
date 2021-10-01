import { FC } from "react"
import styles from "./Wrapper.module.css"

export const Wrapper: FC = ({children}) => {
    return (
        <div className={styles.root}>
            {children}
        </div>
    )
}
