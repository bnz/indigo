import type { FC } from "react"
import { KeyboardActions } from "../../Components/KeyboardActions/KeyboardActions"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { changeOrientation } from "../../../Storage/Store/applyers/changeOrientation"

export const Actions: FC = () => {
    const store = useStore()

    return (
        <KeyboardActions actions={{
            KeyR() {
                changeOrientation(store)(store.isPointy ? "flat" : "pointy")()
            },
        }} />
    )
}
