/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, FC, useContext, useEffect } from "react"
import { UI } from "./UI"

const Context = createContext<UI | null>(null)

export const UIProvider: FC<{ store: UI }> = ({ children, store }) => {
    useEffect(() => store.dispose, [])

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    )
}

export const useUIStore = (): UI => {
    const store = useContext(Context)
    if (!store) {
        throw new Error('hook must be used within a Provider')
    }
    return store
}
