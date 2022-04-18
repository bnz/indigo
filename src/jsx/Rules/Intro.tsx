import type { FC } from "react"
import { Sphere } from "../Game/Sphere/Sphere"
import { PlayerId, StoneId } from "../../types"
import { StonesWrapper } from "./StonesWrapper"
import styles from "./Rules.module.css"
import { Stone } from "../Game/Stone/Stone"
import { StartButton } from "./StartButton"
import { i18n } from "../../i18n/i18n"
import buttonStyles from "../Components/Button/Button.module.css"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"

export const Intro: FC = () => (
    <div className={styles.root}>
        <h2>
            Indigo
        </h2>

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
                <Stone id={StoneId.emerald0} isStatic />
            </div>
            <div>
                <Stone id={StoneId.sapphire} isStatic />
            </div>
            <div>
                <Stone id={StoneId.amber0} isStatic />
            </div>
        </StonesWrapper>

        <StartButton />

        <p style={{ fontStyle: "italic", textAlign: "center" }}>
            Извилистые дорожки – удивительные повороты – настоящее волшебство!
        </p>

        <p>
            Индиго – это тёмно-синий цвет, впервые добытый в древние времена из индийского растения индигоноски. Его
            глубокий синий оттенок использовали во многих культурах и религиях в качестве символа бесконечности и
            бессмертия. Этот цвет оказывает успокаивающее действие на организм человека, позволяя сохранять трезвый ум,
            который понадобится участникам этой игры для добычи наиболее дорогих драгоценных камней.
        </p>

        <div style={{ textAlign: "center", margin: "calc(var(--spacing) * 5) 0" }}>
            <button className={buttonStyles.button} onClick={useUIStore().toggleDrawer}>
                {i18n("button.readRules")}
            </button>
        </div>

    </div>
)
