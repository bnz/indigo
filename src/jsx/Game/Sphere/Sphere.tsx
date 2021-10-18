import { FC } from 'react'
import style from './Sphere.module.css'
import { AspectRatio } from '../../Components/AspectRatio/AspectRatio'
import cx from 'classnames'
import { PlayerId } from '../../../types'

interface PlayerPurpleProps {
    color: PlayerId
    alt?: boolean
}

export const Sphere: FC<PlayerPurpleProps> = ({ color, alt }) => (
    <AspectRatio>
        <div className={cx(style.wrapper, style[color], { [style.alt]: alt })} />
    </AspectRatio>
)
