import { FC } from "react"
import { Drawer } from "./Drawer/Drawer"
import { Wrapper } from "./Wrapper"

export const MainLayout: FC = ({ children }) => {
    return (
        <>
            <Drawer />
            <Wrapper>
                {children}
            </Wrapper>
        </>
    )
}
