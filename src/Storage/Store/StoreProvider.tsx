/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, FC, useContext, useEffect } from "react"
import { Store } from "./Store"

const HexContext = createContext<Store | null>(null)

export const StoreProvider: FC<{ store: Store }> = ({ children, store }) => {
    useEffect(() => store.dispose, [])
    return (
        <HexContext.Provider value={store}>
            {children}
        </HexContext.Provider>
    )
}

export const useStore = (): Store => {
    const store = useContext(HexContext)
    if (!store) {
        throw new Error("hook must be used within a Provider")
    }
    return store
}
