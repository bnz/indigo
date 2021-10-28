import { OrientationType, StoneType } from "../../../types"

export const stoneAngleMap: Record<OrientationType, Record<StoneType, [number?, number?, number?, number?, number?, number?]>> = {
    pointy: {
        [StoneType.sapphire]: [],
        [StoneType.emerald]: [undefined, -30, 30, undefined, -30, 30],
        [StoneType.amber]: [90, -30, 30, 90, -30, 30],
    },
    flat: {
        [StoneType.sapphire]: [30],
        [StoneType.emerald]: [30, undefined, 60, 30, undefined, 60],
        [StoneType.amber]: [120, undefined, 60, 120, undefined, 60],
    },
}
