import React, { FC } from "react"
import { observer } from "mobx-react"
import { Stone } from "../Stone/Stone"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { StoneId } from "../../../types"

export const Stones: FC = observer(() => (
    <>
        {Object.entries(useStore().stones).map(([id]) => (
            <Stone id={id as StoneId} key={id} />
        ))}
    </>
))
