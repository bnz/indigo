import React, { FC, Fragment } from "react"
import cx from "classnames"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { Sphere } from "../Sphere/Sphere"
import { Seat } from "./Seat"
import style from "./Seats.module.css"

export const Seats: FC = () => (
    <>
        {Object.entries(useStore().playersStore.players).map(([, player], index) => {
            const playerClass = style[`p-${index + 1}`]

            return (
                <Fragment key={player.id}>
                    <Seat
                        playerClass={playerClass}
                        playerId={player.id}
                        stones={player.stones}
                    />
                    <div className={cx(style.item, playerClass)}>
                        <Sphere color={player.id} />
                    </div>
                </Fragment>
            )
        })}
    </>
)
