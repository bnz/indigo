import { CSSProperties } from "react"

export const cssBgUrl = (url: string): CSSProperties => ({
    backgroundImage: `url(${url})`,
})
