import { CSSProperties } from "react"
import { toHex } from "./toHex"
import { Store } from "../Store"

type GetTransformCSS = (store: Store) => (q: number, r: number, map: [x1?: string, y1?: string, r1?: string]) => CSSProperties

export const getTransformCSS: GetTransformCSS = (store) =>
    (q, r, [x1 = "", y1 = "", r1 = ""] = []) => {
        const { x, y } = store.renderLayout.hexToPixel(toHex(q, r))

        return {
            transform: `translate(${[
                `calc(${x - 1} * var(--R)${x1})`,
                `calc(${y - store.ratio} * var(--R)${y1})`,
            ].join(", ")})${r1}`,
        }
    }
