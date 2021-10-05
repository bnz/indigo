import React, { FC } from 'react'
import { Sphere } from '../Game/Sphere/Sphere'
import { PlayerId, StoneIds } from '../../types'
import { Stone } from '../Game/Stone/Stone'
import { StonesWrapper } from './StonesWrapper'
import styles from "./Rules.module.css"

export const Rules: FC = () => (
    <div className={styles.root}>
        <div className={styles.players}>
            <div>
                <Sphere color={PlayerId.Player1} />
            </div>
            <div>
                <Sphere color={PlayerId.Player2} />
            </div>
            <div>
                <Sphere color={PlayerId.Player3} />
            </div>
            <div>
                <Sphere color={PlayerId.Player4} />
            </div>
        </div>

        <StonesWrapper>
            <div />
            <div>
                {/*<Stone id={StoneIds.emerald0} />*/}
            </div>
            <div>
                {/*<Stone id={StoneIds.sapphire} />*/}
            </div>
            <div>
                {/*<Stone id={StoneIds.amber0} />*/}
            </div>
        </StonesWrapper>

        <p style={{ fontStyle: 'italic' }}>
            Извилистые дорожки – удивительные повороты – настоящее волшебство!
        </p>

        <p>
            Индиго – это тёмно-синий цвет, впервые добытый в древние времена из индийского растения индигоноски. Его
            глубокий синий оттенок использовали во многих культурах и религиях в качестве символа бесконечности и
            бессмертия. Этот цвет оказывает успокаивающее действие на организм человека, позволяя сохранять трезвый ум,
            который понадобится участникам этой игры для добычи наиболее дорогих драгоценных камней.
        </p>

        <h3>
            Замысел и цель игры
        </h3>

        <p>
            В игре «Индиго» задача игроков – собрать наиболее ценные камни. Для этого им предстоит прокладывать пути, по
            которым камни будут двигаться к выходам, ведущим к воротам игроков, расположенным по краям игрового поля.
            Одни и те же ворота могут принадлежать только одному или двум игрокам сразу. В первом случае только
            один игрок получит добытый камень, а во втором – оба игрока будут вознаграждены, независимо от того, кто
            именно занес камень в ворота!
        </p>

    </div>
)
