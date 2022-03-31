import type { FC } from "react"
import { KeyboardActions } from "../../Components/KeyboardActions/KeyboardActions"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { applySit } from "../../../Storage/Store/applyers/applySit"
import { rotateLeft, rotateRight } from "../../../Storage/Store/applyers/rotate"
import { cancelPreSit } from "../../../Storage/Store/applyers/cancelPreSit"

const useActions = () => {
    const store = useStore()

    return [
        cancelPreSit(store),
        rotateRight(store),
        rotateLeft(store),
        applySit(store),
    ]
}

export const KeyCode: FC = () => {
    const [Escape, ArrowLeft, ArrowRight, Enter] = useActions()

    return (
        <KeyboardActions actions={{ Escape, ArrowLeft, ArrowRight, Space: ArrowRight, Enter, NumpadEnter: Enter }} />
    )
}
