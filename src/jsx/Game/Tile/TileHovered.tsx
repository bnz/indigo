import { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import styles from './TileHovered.module.css'
import { useStore } from "../../../Store/StoreProvider"
import { KeyCode } from "./KeyCode"
import { toJS } from "mobx"

export const TileHovered: FC = observer(() => {
    const store = useStore()
    const ref = useRef<null | HTMLDivElement>(null)

    useEffect(() => {
        if (ref && ref.current) {
            ref.current.className = store.hoveredId ? styles.show : styles.hide
        }
    }, [store.hoveredId])

    console.log(toJS(store.hoveredId))

    return (
        <>
            <KeyCode />
            <div data-qr={store.hoveredId} ref={ref}>
                <div style={store.getTmpCSS} />
            </div>
        </>
    )
})
