import { FC } from 'react'
import { i18n } from "../../i18n/i18n"
import buttonStyles from "../Components/Button/Button.module.css"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"

export const StartButton: FC = () => (
    <button
        className={buttonStyles.main}
        onClick={useUIStore().gamePhase.goToPlayersSelection}
    >
        {i18n('button.startNewGame')}
    </button>
)
