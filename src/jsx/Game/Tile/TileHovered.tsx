import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { KeyCode } from "./KeyCode"
import { tileHoveredCSS } from "../../../Storage/Store/applyers/tileHoveredCSS"
import styles from "./TileHovered.module.css"

export const TileHovered: FC = observer(() => {
    const store = useStore()
    const ref = useRef<null | HTMLDivElement>(null)

    useEffect(() => {
        setTimeout(() => {
            if (ref && ref.current) {
                ref.current.className = store.hoveredId !== null ? styles.show : styles.hide
            }
        }, 10 /* TODO: 10? */)
    }, [store.hoveredId])

    return (
        <>
            <KeyCode />
            <div data-qr={store.hoveredId} ref={ref}>
                <div style={tileHoveredCSS(store)} />
            </div>
        </>
    )
})
