import React, { FC } from "react"
import { observer } from "mobx-react"
import buttonStyles from "../../../Button/Button.module.css"
import { i18n } from "../../../../i18n/i18n"
import { useUIStore } from "../../../../Store/UIProvider"

export const RestartButton: FC = observer(() => (
    <button className={buttonStyles.main} onClick={useUIStore().restartGame}>
        {i18n("button.restart")}
    </button>
))
