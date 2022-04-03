import type { CSSProperties, FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { StoneId, StoneType } from "../../../types"
import styles from "./Stone.module.css"
import { useStoneStyles } from "./useStoneStyles"

interface StoneProps {
    id: StoneId
}

interface StoneCProps extends StoneProps {
    className?: string | undefined;
    style?: CSSProperties | undefined
    index?: number
}

export const StoneC: FC<StoneCProps> = ({
    id,
    style,
    className,
    index,
}) => {
    const [type] = useStoneStyles(id)

    return (
        <div
            {...(
                localStorage.getItem("DEBUG") === "true"
                    ? index ? { "data-id": index } : { "data-id": id }
                    : {}
            )}
            style={style}
            className={cx(styles.root, styles[StoneType[type]], className)}
        />
    )
}

export const Stone: FC<StoneProps> = observer(({ id }) => {
    const [, style, isOut] = useStoneStyles(id)

    if (isOut) {
        return null
    }

    return (
        <StoneC id={id} style={style} />
    )
})
