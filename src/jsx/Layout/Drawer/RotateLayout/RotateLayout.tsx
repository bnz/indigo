import { FC } from "react"
import styles from "./RotateLayout.module.css"
import { observer } from "mobx-react"
import { useStore } from "../../../../Store/StoreProvider"

export const RotateLayout: FC = observer(() => {
    const store = useStore()
    const isPointy = store.isPointy

    return (
        <div className={styles.wrap}>
            <button
                disabled={!isPointy}
                className={styles.flat}
                onClick={() => store.changeOrientation("flat")}
            />
            <button
                disabled={isPointy}
                className={styles.pointy}
                onClick={() => store.changeOrientation("pointy")}
            />
        </div>
    )
})
