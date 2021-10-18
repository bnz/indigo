import React, { FC } from 'react'
import { KeyboardActions } from '../../Components/KeyboardActions/KeyboardActions'
import { useStore } from "../../../Store/StoreProvider"

export const KeyCode: FC = () => {
  const store = useStore()

  return (
    <KeyboardActions
      actions={{
        ArrowLeft: store.rotateRight,
        ArrowRight: store.rotateLeft,
        Space: store.rotateLeft,
        Enter: store.applySit,
      }}
    />
  )
}
