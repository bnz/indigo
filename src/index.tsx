import { StrictMode } from "react"
import { render } from "react-dom"
import "modern-css-reset"
import "@fontsource/roboto"
import "./:root.css"
import "./index.css"
import { UIStore } from "./Storage/UIStore/UIStore"
import { Indigo } from "./jsx/Game/Indigo"
import { UIStoreProvider } from "./Storage/UIStore/UIStoreProvider"
import { Store } from "./Storage/Store/Store"
import { StoreProvider } from "./Storage/Store/StoreProvider"
import { LayoutWrapper } from "./jsx/Layout/LayoutWrapper/LayoutWrapper"
import { Drawer } from "./jsx/Layout/Drawer/Drawer"
import { MenuButton } from "./jsx/Layout/MenuButton/MenuButton"

const store = new Store()

render(
    <StrictMode>
        <UIStoreProvider store={new UIStore(store.dispose)}>
            <StoreProvider store={store}>
                <LayoutWrapper>
                    <Indigo />
                </LayoutWrapper>
                <Drawer />
                <MenuButton />
            </StoreProvider>
        </UIStoreProvider>
    </StrictMode>,
    document.getElementById("root"),
)
