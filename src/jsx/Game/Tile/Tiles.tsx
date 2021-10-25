import React, { FC } from "react"
import { useStore } from "../../../Store/StoreProvider"
import { Tile, TileProps } from "./Tile"
import { makeAutoObservable } from "mobx"
import "./TileCoords.css"
import "./Tile.css"

export interface Data<T> {
    data: T
}

export const Tiles: FC = () => (
    <>
        {useStore().tileEntries.map((entry) => (
            <Tile
                key={entry[0]}
                data={makeAutoObservable<TileProps>({
                    get qr() {
                        return entry[1].hex.id
                    },
                    get tile() {
                        return entry[1].tile
                    },
                })}
            />
        ))}
    </>
)
