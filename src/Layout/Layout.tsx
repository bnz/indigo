import { FC } from "react"
import { Drawer } from "./Drawer/Drawer"
import { Wrapper } from "./Wrapper/Wrapper"
import { MenuButton } from "./MenuButton/MenuButton"

export const Layout: FC = ({ children }) => {
    return (
        <>
            <Wrapper>
                {children}
            </Wrapper>
            <Drawer />
            <MenuButton />
        </>
    )
}
