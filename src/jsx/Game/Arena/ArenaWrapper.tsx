import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { onMouseMove } from "../../../Storage/Store/applyers/onMouseMove"
import { onClick } from "../../../Storage/Store/applyers/onClick"
import { onDoubleClick } from "../../../Storage/Store/applyers/onDoubleClick"
import { onWindowResize } from "../../../Storage/Store/applyers/onWindowResize"
import { onWheel } from "../../../Storage/Store/applyers/onWheel"
import "./Arena.css"

export const ArenaWrapper: FC = observer(({ children }) => {
    const store = useStore()
    const arenaRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const arena = arenaRef.current
        store.arenaElement = arena
        const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onWindowResize(store))
        const wheel = onWheel(store)
        if (arena) resize?.observe(arena)
        arena?.addEventListener("wheel", wheel, { passive: false })
        return () => {
            resize?.disconnect()
            arena?.removeEventListener("wheel", wheel)
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
            onDoubleClick={onDoubleClick(store)}
        >
            {children}
        </div>
    )
})
