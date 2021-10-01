/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, FC, useContext, useEffect } from 'react'
import { iHexStore } from './iHexStore'

const HexContext = createContext<iHexStore | null>(null)

export const HexProvider: FC<{ store: iHexStore }> = ({ children, store }) => {
  useEffect(() => store.dispose, [])
  return (
    <HexContext.Provider value={store}>
      {children}
    </HexContext.Provider>
  )
}

export const useStore = (): iHexStore => {
  const store = useContext(HexContext)
  if (!store) {
    throw new Error('hook must be used within a Provider')
  }
  return store
}
