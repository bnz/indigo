import React, { FC } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { StoneIds, StoneType } from '../../../types'
import { useStore } from "../../../Store/StoreProvider"
import style from './Stone.module.css'

interface StoneProps {
    id: StoneIds
}

export const Stone: FC<StoneProps> = observer(({ id }) => {
    const store = useStore()
    const type = store.stones[id][0]

    return (
        <div
            // data-id={id}
            className={cx(style.root, style[StoneType[type]])}
            style={store.getStoneStyle(id)}
        />
    )
})
