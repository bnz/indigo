import type { FC } from "react"
import style from "./Sphere.module.css"
import cx from "classnames"
import { PlayerId } from "../../../types"

interface PlayerPurpleProps {
    color: PlayerId
    alt?: boolean
}

export const Sphere: FC<PlayerPurpleProps> = ({ color, alt }) => (
    <div className={cx(style.wrapper, style[color], { [style.alt]: alt })} />
)
