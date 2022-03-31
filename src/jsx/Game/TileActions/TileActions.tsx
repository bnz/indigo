import type { FC } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { cancelPreSitButton } from "../../../Storage/Store/applyers/cancelPreSit"
import { tileActionsPositionCSS } from "../../../Storage/Store/applyers/tileActionsPositionCSS"
import styles from "./TileActions.module.css"
import { applySitButton } from "../../../Storage/Store/applyers/applySit"
import { rotateLeftButton, rotateRightButton } from "../../../Storage/Store/applyers/rotate"

export const TileActions: FC = observer(() => {
    const store = useStore()

    if (!store.preSit) {
        return null
    }

    const isCrossroad = store.isRouteCrossroad

    // window.matchMedia("")

    return (
        <div className={styles.root} onClick={cancelPreSitButton(store)}>
            <div className={styles.container} style={tileActionsPositionCSS(store)}>
                <div className={styles.inner}>
                    {!isCrossroad && (
                        <button className={styles.left} onClick={rotateRightButton(store)} />
                    )}
                    <button className={styles.apply} onClick={applySitButton(store)} />
                    <button className={styles.cancel} />
                    {!isCrossroad && (
                        <button className={styles.right} onClick={rotateLeftButton(store)} />
                    )}
                </div>
            </div>
        </div>
    )
})
