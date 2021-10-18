import { forwardRef } from "react"
import { useClickPreventionOnDoubleClick } from "./useClickPreventionOnDoubleClick"

export const ClickableDiv = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(({
    onClick,
    onDoubleClick,
    ...rest
}, ref) => {
    const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(onClick, onDoubleClick)

    return (
        <div ref={ref} onClick={handleClick} onDoubleClick={handleDoubleClick} {...rest} />
    )
})
