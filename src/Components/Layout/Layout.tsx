import { FC } from "react"
import { Drawer } from "./Drawer/Drawer"
import { MenuButton } from "./MenuButton/MenuButton"
import wrapperStyles from "./Wrapper/Wrapper.module.css"

export const Layout: FC = ({ children }) => (
    <>
        <div className={wrapperStyles.root}>
            {children}
        </div>
        <Drawer />
        <MenuButton />
    </>
)
