import React, { FC } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Store/StoreProvider"
import { AllTiles } from "../../../types"
import svg from "../../../assets/hex.svg"
import "./TileCoords.css"
import "./Tile.css"

export const Tiles: FC = observer(() => {
    const store = useStore()

    return (
        <>
            {store.tileEntries.map(([id, { hex: { id: qr }, tile }]) => (
                <div
                    key={id}
                    data-qr={qr}
                    style={{ backgroundImage: `url(${svg}#${(tile !== undefined && AllTiles[tile]) || "_"})` }}
                />
            ))}
        </>
    )
})
