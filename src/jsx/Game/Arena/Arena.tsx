import type { FC } from "react"
import { ArenaWrapper } from "./ArenaWrapper"
import { Tiles } from "../Tile/Tiles"
import { Seats } from "../Seats/Seats"
import { GatewaySeats } from "../GatewaySeats/GatewaySeats"
import { TileHovered } from "../Tile/TileHovered"
import { Stones } from "../Stones/Stones"
import { CollisionEffects } from "../Stones/CollisionEffects"
import { TileActions } from "../TileActions/TileActions"
import { Actions } from "./Actions"
import { GameResults } from "../GameResults/GameResults"
import { TableCursorOverlay } from "../../../online/TableController"

export const Arena: FC<{ sharedTable?: boolean }> = ({ sharedTable }) => (
    <div className="game">
        <ArenaWrapper>
            <Actions />
            <Tiles />
            <Seats />
            <GatewaySeats />
            <Stones />
            <CollisionEffects />
            {sharedTable ? <TableCursorOverlay /> : <>
                <TileHovered />
                <TileActions />
            </>}
        </ArenaWrapper>
        <GameResults />
    </div>
)
