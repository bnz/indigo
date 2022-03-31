import { GatewayTiles, TileItems } from "../../../types"

export const gateways: TileItems<GatewayTiles> = [

    // -
    [-4, -1, GatewayTiles["le-r-t"]],
    [-3, -2, GatewayTiles["g-t-l"]],
    [-2, -3, GatewayTiles["g-t-l"]],
    [-1, -4, GatewayTiles["le-t"]],

    // -
    [1, -5, GatewayTiles["le-t"]],
    [2, -5, GatewayTiles["g-t-r"]],
    [3, -5, GatewayTiles["g-t-r"]],
    [4, -5, GatewayTiles["le-l-t"]],

    // -
    [5, -4, GatewayTiles["le-l-t"]],
    [5, -3, GatewayTiles["g-r"]],
    [5, -2, GatewayTiles["g-r"]],
    [5, -1, GatewayTiles["le-l-b"]],

    // -
    [-5, 1, GatewayTiles["le-r-t"]],
    [-5, 2, GatewayTiles["g-l"]],
    [-5, 3, GatewayTiles["g-l"]],
    [-5, 4, GatewayTiles["le-r-b"]],

    // -
    [4, 1, GatewayTiles["le-l-b"]],
    [3, 2, GatewayTiles["g-b-r"]],
    [2, 3, GatewayTiles["g-b-r"]],
    [1, 4, GatewayTiles["le-b"]],

    // -
    [-4, 5, GatewayTiles["le-r-b"]],
    [-3, 5, GatewayTiles["g-b-l"]],
    [-2, 5, GatewayTiles["g-b-l"]],
    [-1, 5, GatewayTiles["le-b"]],
]
