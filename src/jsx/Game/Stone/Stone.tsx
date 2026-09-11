import type { CSSProperties, FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { StoneId, StoneType } from "../../../types"
import styles from "./Stone.module.css"
import { useStoneStyles } from "./useStoneStyles"
import { useStore } from "../../../Storage/Store/StoreProvider"

interface StoneProps {
    id: StoneId
    isStatic?: true
}

interface StoneCProps extends StoneProps {
    className?: string | undefined;
    style?: CSSProperties | undefined
    index?: number
    board?: boolean
}

export const StoneC: FC<StoneCProps> = ({
    id,
    style,
    className,
    index,
    board,
}) => {
    const [type] = useStoneStyles(id)

    return (
        <div
            data-board-stone={board ? id : undefined}
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

export const Stone: FC<StoneProps> = observer(({ id, isStatic }) => {
    const [, style, isOut] = useStoneStyles(id)
    const store = useStore()

    if (!isStatic && isOut) {
        return null
    }

    return (
        <StoneC id={id} board={!isStatic} style={{
            ...style,
            ...(!isStatic && store.collecting && store.pendingAwards.some(award => award.stoneId === id)
                ? { visibility: "hidden", transition: "none" } : {}),
        }} />
    )
})
