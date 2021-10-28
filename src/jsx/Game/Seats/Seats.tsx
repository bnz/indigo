import React, { FC, Fragment } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { Sphere } from '../Sphere/Sphere'
import style from './Seats.module.css'
import { useStore } from "../../../Storage/Store/StoreProvider"

export const Seats: FC = observer(() => {
    const store = useStore()

    return (
        <>
            {store.playersStore.entries.map(([, player], index) => {
                const playerClass = style[`p-${index + 1}`]

                return (
                    <Fragment key={player.id}>
                        {player.id === store.playerMove[0] && (
                            <>
                                <div className={cx(style.highlight, playerClass)} />
                                <div
                                    className={cx(style.hex, playerClass)}
                                    style={store.playerMoveRouteTile}
                                    onClick={store.rotateRight}
                                />
                            </>
                        )}
                        <div className={cx(style.item, playerClass)}>
                            <Sphere color={player.id} />
                        </div>
                    </Fragment>
                )
            })}
        </>
    )
})
