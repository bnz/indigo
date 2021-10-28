import { FC } from "react"
import { KeyboardActions } from "../../Components/KeyboardActions/KeyboardActions"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { applySit } from "../../../Storage/Store/applyers/applySit"
import { rotateLeft, rotateRight } from "../../../Storage/Store/applyers/rotate"

export const KeyCode: FC = () => {
    const store = useStore()

    return (
        <KeyboardActions actions={{
            ArrowLeft: rotateRight(store),
            ArrowRight: rotateLeft(store),
            Space: rotateLeft(store),
            Enter: applySit(store),
        }} />
    )
}
