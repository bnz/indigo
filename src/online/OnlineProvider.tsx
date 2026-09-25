import { createContext, FC, useContext, useEffect } from "react"
import { observer } from "mobx-react"
import { StoreProvider, useStore } from "../Storage/Store/StoreProvider"
import { OnlineSession } from "./OnlineSession"

const Context = createContext<OnlineSession | null>(null)
export const useOnline = () => useContext(Context)

export const OnlineProvider: FC<{ session: OnlineSession }> = observer(({ session, children }) => {
    const localStore = useStore()
    useEffect(() => {
        session.boot()
        return session.dispose
    }, [session])
    useEffect(() => {
        if (!session.active) localStore.playerMoveReaction()
    }, [session.active, localStore])
    return (
        <Context.Provider value={session}>
            {session.game ? <StoreProvider store={session.game}>{children}</StoreProvider> : children}
        </Context.Provider>
    )
})
