import { FC, useEffect, useRef } from "react"
import { KeyCodes } from "./KeyCodes"

type Dictionary<K extends string, T> = { [P in K]?: T }

interface KeyboardActionsProps {
    actions: Dictionary<KeyCodes, () => void>
}

export const KeyboardActions: FC<KeyboardActionsProps> = ({ actions }) => {
    const latest = useRef(actions)
    latest.current = actions
    useEffect(() => {
        const fn = (e: KeyboardEvent): void => {
            if (e.target instanceof HTMLElement && (e.target.closest("input, textarea, select, button") || e.target.isContentEditable)) return
            latest.current[e.code as KeyCodes]?.()
        }
        window.addEventListener("keyup", fn, true)

        return () => {
            window.removeEventListener("keyup", fn, true)
        }
    }, [])

    return null
}
