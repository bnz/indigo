/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useMemo, useRef } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { onMouseMove } from "../../../Storage/Store/applyers/onMouseMove"
import { applySit } from "../../../Storage/Store/applyers/applySit"
import { onClick } from "../../../Storage/Store/applyers/onClick"
import "./Arena.css"
import { moveStones } from "../../../Storage/Store/applyers/moveStones"

export const ArenaWrapper: FC = observer(({ children }) => {
    const store = useStore()
    const arenaRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        store.arenaElement = arenaRef.current
    }, [store.arenaElement])

    return (
        <div
            ref={arenaRef}
            className={store.orientationType}
            {...useMemo(() => {
                if (store.arenaElement === null) {
                    return {}
                }

                return {
                    onClick: () => moveStones(store),
                    onMouseMove: onMouseMove(store),
                    onDoubleClick: applySit(store),
                    children,
                }
            }, [store.arenaElement, store.R])}
        />
    )
})
