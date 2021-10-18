import { StrictMode } from "react"
import { render } from "react-dom"
import "modern-css-reset"
import "@fontsource/roboto"
import "./:root.css"
import "./index.css"
import { UI } from "./Store/UI"
import { Layout } from "./jsx/Layout/Layout"
import { Indigo } from "./jsx/Game/Indigo"
import { UIProvider } from "./Store/UIProvider"
import { Store } from "./Store/Store"
import { StoreProvider } from "./Store/StoreProvider"

render(
    <StrictMode>
        <UIProvider store={new UI()}>
            <StoreProvider store={new Store()}>
                <Layout>
                    <Indigo />
                </Layout>
            </StoreProvider>
        </UIProvider>
    </StrictMode>,
    document.getElementById("root"),
)
