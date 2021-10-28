/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, FC, useContext, useEffect } from "react"
import { UIStore } from "./UIStore"

const Context = createContext<UIStore | null>(null)

export const UIStoreProvider: FC<{ store: UIStore }> = ({ children, store }) => {
    useEffect(() => store.dispose, [])

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    )
}

export const useUIStore = (): UIStore => {
    const store = useContext(Context)
    if (!store) {
        throw new Error('hook must be used within a Provider')
    }
    return store
}
