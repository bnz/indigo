import { FC } from 'react'
import { ArenaWrapper } from "./ArenaWrapper"
import { Tiles } from "../Tile/Tiles"
import { Seats } from '../Seats/Seats'
import { GatewaySeats } from '../GatewaySeats/GatewaySeats'
import { TileHovered } from '../Tile/TileHovered'
// import { Stones } from "../Stones/Stones"
import { TileActions } from '../TileActions/TileActions'

export const Arena: FC = () => (
    <ArenaWrapper>
        <Tiles />
        <Seats />
        <GatewaySeats />
        <TileHovered />
        {/*<Stones />*/}
        <TileActions />
    </ArenaWrapper>
)
