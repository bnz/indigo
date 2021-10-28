import { GatewayTiles, TileItems } from "../../../types"

export const gateways: TileItems<GatewayTiles> = [
    [-5, 2, GatewayTiles["g-l"]],
    [-5, 3, GatewayTiles["g-l"]],
    [-2, -3, GatewayTiles["g-t-l"]],
    [-3, -2, GatewayTiles["g-t-l"]],
    [2, -5, GatewayTiles["g-t-r"]],
    [3, -5, GatewayTiles["g-t-r"]],
    [5, -3, GatewayTiles["g-r"]],
    [5, -2, GatewayTiles["g-r"]],
    [3, 2, GatewayTiles["g-b-r"]],
    [2, 3, GatewayTiles["g-b-r"]],
    [-3, 5, GatewayTiles["g-b-l"]],
    [-2, 5, GatewayTiles["g-b-l"]],
]
