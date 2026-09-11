import { FC, useLayoutEffect, useRef } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
import { PlayerId } from "../../../types"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { SCORE_ANIMATION_MS } from "../../../Storage/Store/Store"
import { calcScore } from "../../../helpers/calcScore"
import { i18n } from "../../../i18n/i18n"
import seatsStyles from "./Seats.module.css"
import styles from "./PlayerScore.module.css"

export const PlayerScore: FC<{ playerId: PlayerId, playerClass: string }> = observer(({ playerId, playerClass }) => {
    const store = useStore()
    const change = store.scoreChanges.find(score => score.playerId === playerId)
    const score = change?.to ?? calcScore(store.visiblePlayerStones(playerId))
    const bubbleRef = useRef<HTMLDivElement>(null)
    const previousRef = useRef<HTMLSpanElement>(null)
    const nextRef = useRef<HTMLSpanElement>(null)

    useLayoutEffect(() => {
        const bubble = bubbleRef.current
        const previous = previousRef.current
        const next = nextRef.current
        if (!change || !bubble?.animate || !previous || !next) return

        // Grow 250 ms, roll 300 ms, hold 1000 ms, bump 150 ms, settle 300 ms.
        const animations = [
            bubble.animate([
                { transform: "scale(1)", offset: 0, easing: "ease-out" },
                { transform: "scale(1.6)", offset: 0.125 },
                { transform: "scale(1.6)", offset: 0.275 },
                { transform: "scale(1.6)", offset: 0.775, easing: "ease-out" },
                { transform: "scale(1.76)", offset: 0.85, easing: "ease-in-out" },
                { transform: "scale(1)", offset: 1 },
            ], { duration: SCORE_ANIMATION_MS, fill: "both" }),
            previous.animate([
                { transform: "translateY(0) rotateX(0deg)", opacity: 1 },
                { transform: "translateY(-100%) rotateX(90deg)", opacity: 0 },
            ], { delay: 250, duration: 300, easing: "ease-in-out", fill: "both" }),
            next.animate([
                { transform: "translateY(100%) rotateX(-90deg)", opacity: 0 },
                { transform: "translateY(0) rotateX(0deg)", opacity: 1 },
            ], { delay: 250, duration: 300, easing: "ease-in-out", fill: "both" }),
        ]
        return () => animations.forEach(animation => animation.cancel())
    }, [change])

    if (!change && score === 0) return null

    return (
        <div
            className={cx(seatsStyles.score, playerClass, styles.counter)}
            data-player-score={playerId}
            data-score-changing={!!change || undefined}
            role="status"
            aria-label={`${i18n(`player.${playerId}`)}: ${score}`}
        >
            <div ref={bubbleRef} className={styles.bubble} aria-hidden="true">
                {change && <span ref={previousRef} className={cx(styles.number, styles.previous)}>{change.from}</span>}
                <span ref={nextRef} className={styles.number}>{score}</span>
            </div>
        </div>
    )
})
