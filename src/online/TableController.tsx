import type { FC } from "react"
import { observer } from "mobx-react"
import { useOnline } from "./OnlineProvider"
import { i18n } from "../i18n/i18n"
import { calcScore } from "../helpers/calcScore"
import { leadingPlayers } from "../game/rules"
import svg from "../assets/hex.svg"
import styles from "./TableController.module.css"

export const TableCursorOverlay: FC = observer(() => {
    const session = useOnline()
    if (!session?.isSharedTable || !session.cursor || session.finished || session.game?.animatedStones) return null
    return (
        <div data-qr={session.cursor.cell} data-testid="table-cursor" className={styles.cursor}>
            <svg viewBox="0 0 100 86.6" aria-label={i18n("table.cursor")} role="img">
                <polygon points="3,43.3 26.5,3 73.5,3 97,43.3 73.5,83.6 26.5,83.6" />
            </svg>
        </div>
    )
})

export const TableController: FC = observer(() => {
    const session = useOnline()!
    const table = session.table
    if (!table) return null
    const me = session.members.find(member => member.id === session.me)
    if (table.finished && table.results) {
        const winners = leadingPlayers(table.results)
        return (
            <main className={styles.root} data-testid="table-controller">
                <h1>{i18n("result.text.h1")}</h1>
                <h2>{i18n(winners.length > 1 ? "winners" : "winner")}: {winners.map(p => p.name || p.id).join(", ")}</h2>
                <ul>{table.results.map(player => <li key={player.id}>{player.name || player.id}: {calcScore(player.stones)}</li>)}</ul>
                <button onClick={session.leave}>{i18n("online.leave")}</button>
            </main>
        )
    }
    const arrows = table.orientation === "flat" ? ["↘", "↗", "↑", "↖", "↙", "↓"] : ["→", "↗", "↖", "←", "↙", "↘"]
    const cursor = table.cursor
    const active = session.turn === session.me
    return (
        <main className={styles.root} data-testid="table-controller">
            <header>
                <h1>{i18n("table.controller")}</h1>
                <p><span className={styles.badge} style={{ background: `var(--sphere-${session.me}-color)` }} /> {me?.name}</p>
            </header>
            <p>{i18n("table.lookAtScreen")}</p>
            <div className={styles.hand} aria-label={i18n("table.hand")}>
                {table.hand.map((tile, index) => {
                    const selected = cursor?.slot === index
                    const angle = selected ? cursor.angle : 0
                    return (
                        <button key={index} disabled={!session.canPlay} aria-pressed={selected} onClick={() => session.control("select", index)}
                            aria-label={`${i18n("table.tile")} ${index + 1}`}>
                            <span className={styles.tile} role="img" aria-label={`${i18n("table.tile")} ${index + 1}`}
                                style={{ backgroundImage: `url(${svg}#${tile === "c" ? "c" : `${tile}-${angle}`})`, transform: table.orientation === "pointy" ? "rotate(-30deg)" : undefined }} />
                            <span>{i18n("table.tile")} {index + 1}</span>
                        </button>
                    )
                })}
            </div>
            {active ? <>
                <div className={styles.rotations}>
                    <button disabled={!session.canPlay || table.hand[cursor?.slot ?? 0] === "c"} onClick={() => session.control("rotate", -1)}>{i18n("game.rotateLeft")} ↶</button>
                    <button disabled={!session.canPlay || table.hand[cursor?.slot ?? 0] === "c"} onClick={() => session.control("rotate", 1)}>{i18n("game.rotateRight")} ↷</button>
                </div>
                <div className={styles.directions} role="group" aria-label={i18n("table.move")}>
                    <span className={styles.coordinate}>{cursor?.cell}</span>
                    {arrows.map((arrow, direction) => {
                        const angle = ((table.orientation === "flat" ? 30 : 0) - direction * 60) * Math.PI / 180
                        return <button key={direction} disabled={!session.canPlay} aria-label={`${i18n("table.move")}: ${arrow}`}
                            style={{ transform: `translate(-50%, -50%) translate(${Math.cos(angle) * 78}px, ${Math.sin(angle) * 78}px)` }}
                            onClick={() => session.control("step", direction)}>{arrow}</button>
                    })}
                </div>
                <button className={styles.place} disabled={!session.canPlay || !cursor?.valid} onClick={() => session.control("place")}>{i18n("game.place")} ✓</button>
                {cursor && !cursor.valid && <p>{i18n("table.invalidCell")}</p>}
            </> : <p>{i18n("table.waiting")}</p>}
            {session.error && <p role="alert">{session.error}</p>}
            <section className={styles.score} aria-label={i18n("table.yourGems")}>
                <h2>{i18n("table.yourGems")}: {calcScore(table.stones)}</h2>
                <div>
                    <span><i className={styles.gem} style={{ background: "#ffbe37" }} aria-hidden="true" /> {i18n("table.amber")}: {table.stones.filter(id => id.startsWith("a")).length}</span>
                    <span><i className={styles.gem} style={{ background: "#388e3c" }} aria-hidden="true" /> {i18n("table.emerald")}: {table.stones.filter(id => id.startsWith("e")).length}</span>
                    <span><i className={styles.gem} style={{ background: "#4bbdd8" }} aria-hidden="true" /> {i18n("table.sapphire")}: {table.stones.filter(id => id === "s").length}</span>
                </div>
            </section>
        </main>
    )
})
