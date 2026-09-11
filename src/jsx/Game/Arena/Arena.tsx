import type { FC } from "react"
import { ArenaWrapper } from "./ArenaWrapper"
import { Tiles } from "../Tile/Tiles"
import { Seats } from "../Seats/Seats"
import { GatewaySeats } from "../GatewaySeats/GatewaySeats"
import { TileHovered } from "../Tile/TileHovered"
import { Stones } from "../Stones/Stones"
import { TileActions } from "../TileActions/TileActions"
import { Actions } from "./Actions"
import { GameResults } from "../GameResults/GameResults"

export const Arena: FC = () => (
    <div className="game">
        <ArenaWrapper>
            <Actions />
            <Tiles />
            <Seats />
            <GatewaySeats />
            <Stones />
            <TileHovered />
        </ArenaWrapper>
        <TileActions />
        <GameResults />
    </div>
)
