import { StoneId, StoneType } from "../../../types"
import { CSSProperties } from "react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { getTransformCSS } from "../../../Storage/Store/applyers/getTransformCSS"
import { edgeToShiftMap } from "../../../Storage/Store/applyers/edgeToShiftMap"

export const useStoneStyles = (id: StoneId): [type: StoneType, style: CSSProperties, isOut: boolean] => {
    const store = useStore()
    const [type, q, r, edge, isOut = false] = store.stones[id]

    return [
        type,
        getTransformCSS(store)(
            q,
            r,
            edgeToShiftMap(store)(type)[edge],
        ),
        isOut,
    ]
}
