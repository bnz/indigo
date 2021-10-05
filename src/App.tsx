import { FC } from "react"
import { Layout } from "./Components/Layout/Layout"
import { Indigo } from "./Components/Game/Indigo"
import { UIProvider } from "./Store/UIProvider"
import { UI } from "./Store/UI"

export const App: FC = () => (
    <UIProvider store={new UI()}>
        <Layout>
            <Indigo />
        </Layout>
    </UIProvider>
)
