import { FC } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import styles from "./LayoutWrapper.module.css"

export const LayoutWrapper: FC = observer(({ children }) => (
    <div className={styles.root} style={{ ["--R" as string]: `${useStore().R}px` }}>
        {children}
    </div>
))
