import React, { FC } from "react"
import { Stone } from "../Stone/Stone"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { StoneId } from "../../../types"

export const Stones: FC = () => (
    <>
        {Object.entries(useStore().stones).map(([id]) => (
            <Stone key={id} id={id as StoneId} />
        ))}
    </>
)
