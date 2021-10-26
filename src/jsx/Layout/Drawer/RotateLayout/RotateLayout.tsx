import { FC } from "react"
import styles from "./RotateLayout.module.css"
import { observer } from "mobx-react"
import { useStore } from "../../../../Store/StoreProvider"
import { changeOrientation } from "../../../../Store/applyers/changeOrientation"

export const RotateLayout: FC = observer(() => {
    const store = useStore()
    const isPointy = store.isPointy

    return (
        <div className={styles.wrap}>
            <button
                disabled={!isPointy}
                className={styles.flat}
                onClick={changeOrientation(store)("flat")}
            />
            <button
                disabled={isPointy}
                className={styles.pointy}
                onClick={changeOrientation(store)("pointy")}
            />
        </div>
    )
})
