import { FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { KeyCode } from "./KeyCode"
import { tileHoveredCSS } from "../../../Storage/Store/applyers/tileHoveredCSS"
import styles from "./TileHovered.module.css"

export const TileHovered: FC = observer(() => {
    const store = useStore()

    return (
        <>
            <KeyCode />
            {store.hoveredId !== null && (
                <div data-qr={store.hoveredId} className={cx(styles.show, { [styles.invalid]: !!store.placementError })}>
                    <div style={tileHoveredCSS(store)} />
                </div>
            )}
        </>
    )
})
