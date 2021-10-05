import React, { FC } from 'react'
import { useStore } from "../../../Store/StoreProvider"
import { PlayerId } from "../../../types"
import { Sphere } from "../../Game/Sphere/Sphere"
import styles from "./Player.module.css"

export const Player: FC<{ id: PlayerId }> = ({ id }) => {
    const store = useStore()
    const hasButton = store.playersStore.entries.length > 2

    return (
        <button className={styles.root} {...(hasButton ? { onClick: store.playersStore.removePlayerById(id) } : {})}>
            <Sphere color={id} />
            {hasButton && (
                <div className={styles.clear} />
            )}
        </button>
    )
}
