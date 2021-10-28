import { FC } from "react"
import { observer } from "mobx-react"
import { UIPhase } from "../../types"
import { Rules } from "../Rules/Rules"
import { StartButton } from "../Rules/StartButton"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { PlayerManager } from "../Players/PlayerManager"
import { Arena } from "./Arena/Arena"

export const Indigo: FC = observer(() => {
    switch (useUIStore().gamePhase.phase) {
        case UIPhase.PRE_GAME:
            return (
                <>
                    <div style={{
                        padding: "calc(var(--spacing) * 10)",
                        textAlign: "center",
                    }}>
                        <StartButton />
                    </div>
                    <Rules />
                </>
            )
        case UIPhase.PLAYERS_SELECTION:
            return (
                <PlayerManager />
            )
        case UIPhase.GAME:
            return (
                <Arena />
            )
        default:
            return null
    }
})
