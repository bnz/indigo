import { Edge, StoneType } from "../../../types"
import { Store } from "../Store"
import { getRotate } from "./getRotate"

type EdgeToShiftMap = (store: Store) => (type: StoneType) => Record<Edge, [string, string, string?]>

export const edgeToShiftMap: EdgeToShiftMap = (store) => (type) => {
    const isPointy = store.isPointy
    const x = isPointy ? 1.5 : 1.8
    const y = isPointy ? 2.75 : 3
    const r = getRotate(store)(type)

    return isPointy ? {
        0: [` + var(--R) / ${x}`, /*--->*/ "" /*<---*/, r(0)],
        5: [` + var(--R) / ${y}`, ` + var(--R) / ${x}`, r(1)],
        4: [` + var(--R) / ${-y}`, ` + var(--R) / ${x}`, r(2)],
        3: [` + var(--R) / ${-x}`, /*--->*/ "" /*<---*/, r(3)],
        2: [` + var(--R) / ${-y}`, ` + var(--R) / ${-x}`, r(4)],
        1: [` + var(--R) / ${y}`, ` + var(--R) / ${-x}`, r(5)],
    } : {
        0: [` + var(--R) / ${x}`, ` + var(--R) / ${y}`, r(0)],
        5: [ /* ---------> */ "", ` + var(--R) / ${x * store.ratio}`, r(1)],
        4: [` + var(--R) / ${-x}`, ` + var(--R) / ${y}`, r(2)],
        3: [` + var(--R) / ${-x}`, ` + var(--R) / ${-y}`, r(3)],
        2: [ /* ---------> */ "", ` + var(--R) / ${-x * store.ratio}`, r(4)],
        1: [` + var(--R) / ${x}`, ` + var(--R) / ${-y}`, r(5)],
    }
}
