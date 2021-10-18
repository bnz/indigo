import { FC, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

const root = document.getElementById("root")

export const Modal: FC = ({ children }) => {
    const el = useRef(document.createElement("div"))

    useEffect(() => {
        const div = el.current
        root?.appendChild(div)

        return () => {
            root?.removeChild(div)
        }
    }, [])

    return createPortal(children, el.current)
}
