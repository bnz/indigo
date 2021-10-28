import { FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { StoneId, StoneType } from "../../../types"
import styles from "./Stone.module.css"
import { useStoneStyles } from "./useStoneStyles"

interface StoneProps {
    id: StoneId
}

export const Stone: FC<StoneProps> = observer(({ id }) => {
    const [type, style] = useStoneStyles(id)

    return (
        <div
            data-id={id}
            className={cx(styles.root, styles[StoneType[type]])}
            style={style}
        />
    )
})
