/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, FC, useContext, useEffect } from 'react'
import { iStore } from './iStore'

const HexContext = createContext<iStore | null>(null)

export const StoreProvider: FC<{ store: iStore }> = ({ children, store }) => {
    useEffect(() => store.dispose, [])
    return (
        <HexContext.Provider value={store}>
            {children}
        </HexContext.Provider>
    )
}

export const useStore = (): iStore => {
    const store = useContext(HexContext)
    if (!store) {
        throw new Error('hook must be used within a Provider')
    }
    return store
}
