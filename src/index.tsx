import { StrictMode } from "react"
import { render } from "react-dom"
import "modern-css-reset"
import "@fontsource/roboto"
import "./:root.css"
import "./index.css"
import { UI } from "./Store/UI"
import { Layout } from "./Components/Layout/Layout"
import { Indigo } from "./Components/Game/Indigo"
import { UIProvider } from "./Store/UIProvider"

render(
    <StrictMode>
        <UIProvider store={new UI()}>
            <Layout>
                <Indigo />
            </Layout>
        </UIProvider>
    </StrictMode>,
    document.getElementById("root"),
)
