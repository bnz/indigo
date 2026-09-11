import { FC, useLayoutEffect, useRef } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { PlayerId, StoneId } from "../../../types"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { COLLECTION_ANIMATION_MS } from "../../../Storage/Store/Store"
import { StoneC } from "../Stone/Stone"
import styles from "./Seats.module.css"

export const CollectedStone: FC<{ id: StoneId, playerId: PlayerId, playerClass: string, index: number }> = observer(({ id, playerId, playerClass, index }) => {
    const store = useStore()
    const ref = useRef<HTMLDivElement>(null)
    const pending = store.pendingAwards.some(award => award.playerId === playerId && award.stoneId === id)
    const receiving = pending && store.collecting

    useLayoutEffect(() => {
        if (!receiving) return
        const target = ref.current?.firstElementChild as HTMLElement | null
        const source = store.arenaElement?.querySelector<HTMLElement>(`[data-board-stone="${id}"]`)
        if (!source || !target?.animate) return
        const from = source.getBoundingClientRect()
        const to = target.getBoundingClientRect()
        const x = from.x + from.width / 2 - to.x - to.width / 2
        const y = from.y + from.height / 2 - to.y - to.height / 2
        const sourceSize = parseFloat(getComputedStyle(source, "::before").width)
        const targetSize = parseFloat(getComputedStyle(target, "::before").width)
        const scale = targetSize > 0 ? sourceSize / targetSize : 1
        const animation = target.animate([
            { transform: `translate(${x}px, ${y}px) scale(${scale})`, filter: "drop-shadow(0 0 5px #fff)", offset: 0, easing: "cubic-bezier(0.4, 0, 0.3, 1)" },
            { transform: "translate(0, 0) scale(1.3)", filter: "drop-shadow(0 0 10px #ffd86b)", offset: 0.75, easing: "ease-out" },
            { transform: "translate(0, 0) scale(1)", filter: "drop-shadow(0 0 0px transparent)", offset: 1 },
        ], { duration: COLLECTION_ANIMATION_MS, fill: "both" })
        return () => animation.cancel()
    }, [id, receiving, store])

    return (
        <div
            ref={ref}
            data-collected-stone={id}
            data-player={playerId}
            data-receiving={receiving || undefined}
            style={{
                ["--collection-column" as string]: index % 3,
                ["--collection-row" as string]: Math.floor(index / 3),
            }}
            className={cx(styles.stone, playerClass, styles[`s-${index + 1}`], {
                [styles.pending]: pending && !receiving,
                [styles.receiving]: receiving,
            })}
        >
            <StoneC id={id} index={index + 1} />
        </div>
    )
})
