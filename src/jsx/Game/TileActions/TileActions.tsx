/* eslint-disable react-hooks/exhaustive-deps */
import { FC } from "react"
import { observer } from "mobx-react"
import cx from "classnames"
// import CheckRoundedIcon from '@material-ui/icons/CheckRounded'
// import CloseRoundedIcon from '@material-ui/icons/CloseRounded'
// import RotateLeftRoundedIcon from '@material-ui/icons/RotateLeftRounded'
// import RotateRightRoundedIcon from '@material-ui/icons/RotateRightRounded'
// import Fab from '@material-ui/core/Fab'
import style from "./TileActions.module.css"
import { KeyboardActions } from "../../Components/KeyboardActions/KeyboardActions"
import { useStore } from "../../../Store/StoreProvider"

export const TileActions: FC = observer(() => {
    const store = useStore()

    if (!store.preSit) {
        return null
    }

    // window.matchMedia("")

    return (
        <div className={style.root} onClick={store.cancelPreSitButton}>
            <KeyboardActions actions={{
                Escape: store.cancelPreSit,
                Enter: store.applySit,
            }} />
            <div className={style.container} style={store.tileActionsPositionCSS}>
                {/*<Fab className={cx(style.button, style.left)} onClick={store.applySitButton}>*/}
                {/*    <CheckRoundedIcon />*/}
                {/*</Fab>*/}
                {/*<Fab className={cx(style.button, style.right)} onClick={store.cancelPreSitButton}>*/}
                {/*    <CloseRoundedIcon />*/}
                {/*</Fab>*/}
                {!store.isRouteCrossroad && (
                    <>
                        {/*<Fab className={cx(style.button, style.top)} onClick={store.rotateRightButton}>*/}
                        {/*    <RotateLeftRoundedIcon />*/}
                        {/*</Fab>*/}
                        {/*<Fab className={cx(style.button, style.bottom)} onClick={store.rotateLeftButton}>*/}
                        {/*    <RotateRightRoundedIcon />*/}
                        {/*</Fab>*/}
                    </>
                )}
            </div>
        </div>
    )
})
