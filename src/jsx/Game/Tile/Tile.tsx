import { observer } from "mobx-react"
import { FC } from "react"
import svg from "../../../assets/hex.svg"
import { Data } from "./Tiles"
import { AllTiles, IAllTiles } from "../../../types"

export interface TileProps {
    qr: string
    tile?: IAllTiles
}

export const Tile: FC<Data<TileProps>> = observer(({ data }) => (
    <div
        data-qr={data.qr}
        style={{ backgroundImage: `url(${svg}#${(data.tile !== undefined && AllTiles[data.tile]) || "_"})` }}
    />
))
