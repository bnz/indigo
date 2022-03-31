import type { FC } from "react"
import styles from "./Footer.module.css"

export const Footer: FC = () => (
    <footer className={styles.footer}>
        bonez &copy; 2020 - {new Date().getFullYear()}
    </footer>
)
