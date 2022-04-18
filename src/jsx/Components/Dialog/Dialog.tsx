import { FC, ReactNode } from "react"
import styles from "./Dialog.module.css"
import { Modal } from "../Modal/Modal"
import { KeyboardActions } from "../KeyboardActions/KeyboardActions"

interface DialogProps {
    heading?: string
    close?(): void
    footer?: ReactNode
    noPadding?: true
}

export const Dialog: FC<DialogProps> = ({
    heading,
    close,
    children,
    footer,
    noPadding,
}) => (
    <Modal>
        <KeyboardActions actions={{ Escape: close }} />
        <div className={styles.backdrop} onClick={close} />
        <div className={styles.root}>
            {heading !== undefined && (
                <h2 className={styles.header}>
                    {heading}
                    {close && (
                        <button className={styles.closeButton} onClick={close} />
                    )}
                </h2>
            )}
            <section {...!noPadding && { className: styles.content }}>
                {children}
            </section>
            {footer !== undefined && (
                <footer className={styles.footer}>
                    {footer}
                </footer>
            )}
        </div>
    </Modal>
)
