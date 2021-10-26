/* eslint-disable react-hooks/exhaustive-deps */
import { observer } from "mobx-react"
import { useStore } from "../../../Store/StoreProvider"
import { FC, useEffect, useMemo, useRef } from "react"
import { ClickableDiv } from "../../Components/Clickable/ClickableDiv"
import "./Arena.css"

export const ArenaWrapper: FC = observer(({ children }) => {
    const store = useStore()
    const arenaRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        store.arenaElement = arenaRef.current
    }, [store.arenaElement])

    return (
        <ClickableDiv
            ref={arenaRef}
            className={store.orientationType}
            {...useMemo(() => {
                if (store.arenaElement === null) {
                    return {}
                }

                return {
                    style: {
                        ["--R" as string]: `${store.R}px`,
                    },
                    onClick: store.onClick,
                    onMouseMove: store.onMouseMove,
                    onDoubleClick: store.applySit,
                    children,
                }
            }, [store.arenaElement, store.R])}
        />
    )
})
