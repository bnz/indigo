import { StoneId, Stones, StoneType } from "../../../types"
import { getStoneProps } from "../applyers/getStoneProps"

export const stones: Stones = {
    [StoneId.sapphire]: [StoneType.sapphire, 0, 0, 0],

    [StoneId.emerald0]: [StoneType.emerald, 0, 0, 5],
    [StoneId.emerald1]: [StoneType.emerald, 0, 0, 1],
    [StoneId.emerald2]: [StoneType.emerald, 0, 0, 2],
    [StoneId.emerald3]: [StoneType.emerald, 0, 0, 3],
    [StoneId.emerald4]: [StoneType.emerald, 0, 0, 4],

    [StoneId.amber0]: getStoneProps(0, StoneType.amber),
    [StoneId.amber1]: getStoneProps(1, StoneType.amber),
    [StoneId.amber2]: getStoneProps(2, StoneType.amber),
    [StoneId.amber3]: getStoneProps(3, StoneType.amber),
    [StoneId.amber4]: getStoneProps(4, StoneType.amber),
    [StoneId.amber5]: getStoneProps(5, StoneType.amber),
}
