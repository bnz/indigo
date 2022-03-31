import type { CSSProperties, FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { StoneId, StoneType } from "../../../types"
import styles from "./Stone.module.css"
import { useStoneStyles } from "./useStoneStyles"

interface StoneProps {
    id: StoneId
}

export const StoneC: FC<StoneProps & { style?: CSSProperties | undefined }> = ({ id, style }) => {
    const [type] = useStoneStyles(id)

    return (
        <div
            // data-id={id}
            style={style}
            className={cx(styles.root, styles[StoneType[type]])}
        />
    )
}

export const Stone: FC<StoneProps> = observer(({ id }) => {
    const [, style] = useStoneStyles(id)

    return (
        <StoneC id={id} style={style} />
    )
})
