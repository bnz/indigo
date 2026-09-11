import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { onMouseMove } from "../../../Storage/Store/applyers/onMouseMove"
import { onClick } from "../../../Storage/Store/applyers/onClick"
import { onWindowResize } from "../../../Storage/Store/applyers/onWindowResize"
import "./Arena.css"

export const ArenaWrapper: FC = observer(({ children }) => {
    const store = useStore()
    const arenaRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        store.arenaElement = arenaRef.current
        const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onWindowResize(store))
        if (arenaRef.current) resize?.observe(arenaRef.current)
        return () => {
            resize?.disconnect()
            store.arenaElement = null
        }
    }, [store])

    return (
        <div
            ref={arenaRef}
            className={store.orientationType}
            style={{ ["--board-top" as string]: `${store.boardTop}px` }}
            data-testid="arena"
            onMouseMove={onMouseMove(store)}
            onClick={onClick(store)}
        >
            {children}
        </div>
    )
})
