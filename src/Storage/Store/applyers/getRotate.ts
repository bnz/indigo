import { Edge, StoneType } from "../../../types"
import { Store } from "../Store"
import { stoneAngleMap } from "../maps/stoneAngleMap"

export const getRotate = (store: Store) => (type: StoneType) => (edge: Edge): string | undefined => {
    const rotate = stoneAngleMap[store.orientationType][type]
    return rotate[edge] !== undefined ? ` rotate(${rotate[edge]}deg)` : undefined
}
