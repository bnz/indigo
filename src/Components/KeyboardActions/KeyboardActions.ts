/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect } from "react"

type Dictionary<K extends string, T> = { [P in K]?: T }

type KeyCodes = "Escape"

interface KeyboardActionsProps {
    actions: Dictionary<KeyCodes, () => void>
}

export const KeyboardActions: FC<KeyboardActionsProps> = ({ actions }) => {
    useEffect(() => {
        const fn = (e: KeyboardEvent): void => {
            actions[e.code as KeyCodes]?.()
        }
        window.addEventListener("keyup", fn, true)

        return () => {
            window.removeEventListener("keyup", fn, true)
        }
    }, [])

    return null
}
