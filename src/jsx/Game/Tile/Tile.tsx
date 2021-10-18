import React, { FC } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Store/StoreProvider"
import "./TileCoords.css"

interface TileProps {
    id: string
    qr: string
}

export const Tile: FC<TileProps> = observer(({ id, qr }) => (
    <div
        data-qr={qr}
        style={useStore().getBackgroundUrlById(id)}
    />
))
