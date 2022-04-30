import { Stone, StoneType } from "../../../types"
import { treasures } from "../defaults/treasures"

export const getStoneProps = (treasureIndex: number, type: StoneType): Stone => {
    const [q, r, , stoneWithEdge] = treasures[treasureIndex]
    const [[, edge]] = stoneWithEdge!
    return [type, q, r, edge]
}
