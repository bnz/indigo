import { FC } from 'react'
import style from './AspectRatio.module.css'

export const AspectRatio: FC = ({ children }) => (
    <div className={style.container}>
        <div className={style.inner}>
            {children}
        </div>
    </div>
)
