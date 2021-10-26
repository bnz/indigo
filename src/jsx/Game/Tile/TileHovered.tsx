import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react"
import styles from "./TileHovered.module.css"
import { useStore } from "../../../Store/StoreProvider"
import { KeyCode } from "./KeyCode"

export const TileHovered: FC = observer(() => {
    const store = useStore()
    const ref = useRef<null | HTMLDivElement>(null)

    useEffect(() => {
        if (ref && ref.current) {
            ref.current.className = store.hoveredId ? styles.show : styles.hide
        }
    }, [store.hoveredId])

    return (
        <>
            <KeyCode />
            <div data-qr={store.hoveredId} ref={ref}>
                <div style={store.getTmpCSS} />
            </div>
        </>
    )
})
