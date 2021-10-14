import { FC, useCallback, useState } from "react"
import { i18n } from "../../../../i18n/i18n"
import buttonStyles from "../../../Button/Button.module.css"
import { Dialog } from "../../../Dialog/Dialog"
import { RestartButton } from "./RestartButton"

export const RestartGame: FC = () => {
    const [dialogVisible, setDialogVisible] = useState(false)
    const close = useCallback(() => {
        setDialogVisible(false)
    }, [])

    return (
        <>
            <button className={buttonStyles.restart} onClick={() => {
                setDialogVisible(true)
            }}>
                {i18n("button.restart")}
            </button>
            {dialogVisible && (
                <Dialog
                    heading={`${i18n("button.restartGame")}?`}
                    close={close}
                    footer={
                        <>
                            <button className={buttonStyles.text} onClick={close}>
                                {i18n("button.cancel")}
                            </button>
                            <RestartButton />
                        </>
                    }
                >
                    <div style={{ textAlign: "center" }}>
                        {i18n("currentGameWillBeLost")}
                    </div>
                </Dialog>
            )}
        </>
    )
}

