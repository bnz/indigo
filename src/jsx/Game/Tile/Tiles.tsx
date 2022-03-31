import type { FC } from "react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { Tile, TileProps } from "./Tile"
import { makeAutoObservable } from "mobx"
import "./TileCoords.css"
import "./Tile.css"

export const Tiles: FC = () => (
    <>
        {Object.entries(useStore().tiles).map((entry) => (
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
