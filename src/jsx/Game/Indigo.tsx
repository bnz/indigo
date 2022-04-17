import type { FC } from "react"
import { observer } from "mobx-react"
import { UIPhase } from "../../types"
import { Intro } from "../Rules/Intro"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { PlayerManager } from "../Players/PlayerManager"
import { Arena } from "./Arena/Arena"

const Wrapper: FC = ({ children }) => {
    return (
        <div style={{
            maxWidth: "calc(var(--spacing) * 125)",
            margin: "0 auto",
            padding: "calc(var(--spacing) * 2)"
        }}>
            {children}
        </div>
    )
}

export const Indigo: FC = observer(() => {
    switch (useUIStore().gamePhase.phase) {
        case UIPhase.PRE_GAME:
            return (
                <Wrapper>
                    <Intro />
                </Wrapper>
            )
        case UIPhase.PLAYERS_SELECTION:
            return (
                <Wrapper>
                    <PlayerManager />
                </Wrapper>
            )
        case UIPhase.GAME:
            return (
                <Arena />
            )
        default:
            return null
    }
})
