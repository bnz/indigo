import type { FC } from "react"
import { observer } from "mobx-react"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { getTransformCSS } from "../../../Storage/Store/applyers/getTransformCSS"
import styles from "./CollisionEffects.module.css"

export const CollisionEffects: FC = observer(() => {
    const store = useStore()

    return (
        <>
            {store.collisions.map(({ stoneIds, q, r }) => (
                <div
                    key={stoneIds.join("-")}
                    className={styles.root}
                    data-testid="collision-effect"
                    data-collision={stoneIds.join(",")}
                    style={getTransformCSS(store)(q, r, [])}
                >
                    <i className={styles.flash} />
                    <i className={styles.wave} />
                    <i className={styles.waveLate} />
                    {Array.from({ length: 8 }, (_, index) => <i className={styles.spark} key={index} />)}
                </div>
            ))}
        </>
    )
})
