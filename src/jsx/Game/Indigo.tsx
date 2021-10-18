import React, { FC } from "react"
import { observer } from "mobx-react"
import { UIPhase } from "../../types"
import { Rules } from "../Rules/Rules"
import { StartButton } from "../Rules/StartButton"
import { StoreProvider } from "../../Store/StoreProvider"
import { Store } from "../../Store/Store"
import { useUIStore } from "../../Store/UIProvider"
import { PlayerManager } from "../Players/PlayerManager"
import { Arena } from "./Arena/Arena"

export const Indigo: FC = observer(() => {
    console.log("Indigo::render")

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
                <StoreProvider store={new Store()}>
                    <PlayerManager />
                </StoreProvider>
            )
        case UIPhase.GAME:
            return (
                <StoreProvider store={new Store()}>
                    <Arena />
                </StoreProvider>
            )
        default:
            return null
    }
})
