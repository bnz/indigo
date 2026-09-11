import type { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { applySitButton } from "../../../Storage/Store/applyers/applySit"
import { rotateLeftButton, rotateRightButton } from "../../../Storage/Store/applyers/rotate"
import { i18n } from "../../../i18n/i18n"
import styles from "./TileActions.module.css"

export const TileActions: FC = observer(() => {
    const store = useStore()
    if (store.finished) return null

    return (
        <section className={cx(styles.root, styles[store.playerMove[0]])} aria-label={i18n("game.controls")} onDoubleClick={event => event.stopPropagation()}>
            <div className={styles.buttons}>
                <button className={styles.rotateLeft} disabled={!store.canPlay || store.isRouteCrossroad} onClick={rotateRightButton(store)} aria-label={i18n("game.rotateLeft")} title={i18n("game.rotateLeft")} />
                <button className={styles.rotateRight} disabled={!store.canPlay || store.isRouteCrossroad} onClick={rotateLeftButton(store)} aria-label={i18n("game.rotateRight")} title={i18n("game.rotateRight")} />
                <button className={styles.apply} disabled={!store.preSit || !store.canPlay || !!store.placementError} onClick={applySitButton(store)} aria-label={i18n("game.place")} title={i18n("game.place")} />
            </div>
        </section>
    )
})
