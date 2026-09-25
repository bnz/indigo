import { FC, useEffect, useState } from "react"
import { observer } from "mobx-react"
import { useStore } from "../Storage/Store/StoreProvider"
import { useUIStore } from "../Storage/UIStore/UIStoreProvider"
import { Arena } from "../jsx/Game/Arena/Arena"
import { useOnline } from "./OnlineProvider"
import { i18n } from "../i18n/i18n"
import styles from "./OnlineScreen.module.css"

export const OnlineEntry: FC = observer(() => {
    const session = useOnline()
    const ui = useUIStore()
    if (!session) return null
    return (
        <div className={styles.entry}>
            <button onClick={() => { ui.closeDrawer(); session.openSetup() }}>{i18n("online.entry")}</button>
            {session.resumeRoom && <button onClick={() => { ui.closeDrawer(); session.resume() }}>{i18n("online.resume")}</button>}
        </div>
    )
})

const Setup: FC = observer(() => {
    const session = useOnline()!
    const [name, setName] = useState("")
    const [link, setLink] = useState(session.inviteRoom)
    return (
        <main className={styles.lobby}>
            <h1>{i18n("online.title")}</h1>
            <p>{i18n("online.intro")}</p>
            <label>{i18n("online.name")}<input value={name} maxLength={24} onChange={event => setName(event.target.value)} autoComplete="nickname" /></label>
            <div>
                <button onClick={() => session.create(name)}>{i18n("online.create")}</button>
            </div>
            <form onSubmit={event => { event.preventDefault(); session.join(link, name) }}>
                <label>{i18n("online.link")}<input value={link} onChange={event => setLink(event.target.value)} spellCheck={false} /></label>
                <button type="submit" disabled={!link.trim()}>{i18n("online.join")}</button>
            </form>
            {session.error && <p role="alert">{session.error}</p>}
            <p>{i18n("online.networkHint")}</p>
            <button onClick={session.leave}>{i18n("online.localBack")}</button>
        </main>
    )
})

const RoomDetails: FC = observer(() => {
    const session = useOnline()!
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        try { await navigator.clipboard.writeText(session.invitation); setCopied(true) }
        catch { setCopied(false) }
    }
    return (
        <div className={styles.details}>
            <label>{i18n("online.invitation")}<input readOnly value={session.invitation} onFocus={event => event.target.select()} /></label>
            <button onClick={copy}>{i18n(copied ? "online.copied" : "online.copy")}</button>
            <ul className={styles.members}>
                {session.members.map(member => (
                    <li key={member.id}>
                        <span className={styles.dot} style={{ background: `var(--sphere-${member.id}-color)` }} />
                        <span>{member.name}{member.id === session.me ? ` (${i18n("online.you")})` : ""}{member.id === "p-1" ? ` · ${i18n("online.host")}` : ""}</span>
                        <span>{i18n(member.online ? "online.connected" : "online.offline")}</span>
                    </li>
                ))}
            </ul>
            {session.error && <p role="alert">{session.error}</p>}
            {(session.saveFailed || session.game?.saveFailed) && <p role="alert">{i18n("game.saveFailed")}</p>}
            {session.status !== "connected" && <button onClick={() => { void session.connect() }}>{i18n("online.reconnect")}</button>}
            <button onClick={session.leave}>{i18n("online.leave")}</button>
            <small>{i18n("online.savedHint")}</small>
        </div>
    )
})

export const OnlineScreen: FC = observer(() => {
    const session = useOnline()!
    const store = useStore()
    const activePlayer = store.playerMove[0]
    useEffect(() => {
        document.body.classList.remove("p-1", "p-2", "p-3", "p-4")
        if (session.started && session.room) document.body.classList.add(activePlayer)
        return () => {
            document.body.classList.remove("p-1", "p-2", "p-3", "p-4")
        }
    }, [activePlayer, session.started, session.room])
    if (!session.room) return <Setup />

    const turn = session.members.find(member => member.id === activePlayer)?.name || ""
    const status = session.status === "error" ? i18n("online.noConnection") : session.status !== "connected" ? i18n("online.connecting") :
        !session.allOnline ? i18n("online.waiting") : session.pending ? i18n("online.pending") :
        store.animatedStones ? i18n("game.moving") : store.finished ? i18n("result.text.h1") :
        session.me === activePlayer ? i18n("online.yourTurn") : `${i18n("game.turn")}: ${turn}`

    if (!session.started) return (
        <main className={styles.lobby}>
            <h1>{i18n("online.roomTitle")}</h1>
            <p role="status">{i18n(session.status === "connected" ? "online.inviteHint" : session.status === "error" ? "online.noConnection" : "online.connecting")}</p>
            <RoomDetails />
            {session.role === "host" ? (
                <button disabled={session.status !== "connected" || !session.allOnline} onClick={session.start}>{i18n("button.startGame")} ({session.members.length}/4)</button>
            ) : <p>{i18n("online.waitingStart")}</p>}
        </main>
    )

    return (
        <>
            <details className={styles.roomBar}>
                <summary><span role="status">{status}</span><span>{i18n("online.roomMenu")} ▾</span></summary>
                <RoomDetails />
            </details>
            <Arena />
        </>
    )
})
