import { FC } from "react"
import { StoreProvider } from "./Store/StoreProvider"
import { Store } from "./Store/Store"
import { Layout } from "./Layout/Layout"
import { Indigo } from "./Game/Indigo"
import { UIProvider } from "./Store/UIProvider"
import { UI } from "./Store/UI"

export const App: FC = () => (
    <StoreProvider store={new Store()}>
        <UIProvider store={new UI()}>
            <Layout>
                <Indigo />
            </Layout>
        </UIProvider>
    </StoreProvider>
)
