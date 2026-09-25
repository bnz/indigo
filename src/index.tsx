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
import { OnlineSession } from "./online/OnlineSession"
import { OnlineProvider } from "./online/OnlineProvider"

const store = new Store()
const uiStore = new UIStore(store.reset)
const online = new OnlineSession()
if (store.isNewGame) uiStore.gamePhase.goToPreGame()

render(
    <StrictMode>
        <UIStoreProvider store={uiStore}>
            <StoreProvider store={store}>
                <OnlineProvider session={online}>
                    <LayoutWrapper>
                        <Indigo />
                    </LayoutWrapper>
                    <Drawer />
                    <MenuButton />
                </OnlineProvider>
            </StoreProvider>
        </UIStoreProvider>
    </StrictMode>,
    document.getElementById("root"),
)
