import { FC } from "react"
import { observer } from "mobx-react"
import buttonStyles from "../../../Components/Button/Button.module.css"
import { i18n } from "../../../../i18n/i18n"
import { useUIStore } from "../../../../Storage/UIStore/UIStoreProvider"

export const RestartButton: FC = observer(() => (
    <button className={buttonStyles.main} onClick={useUIStore().restartGame}>
        {i18n("button.restart")}
    </button>
))
