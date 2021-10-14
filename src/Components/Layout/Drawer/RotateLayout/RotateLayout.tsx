import React, { FC, useState } from "react"
import styles from "./RotateLayout.module.css"

export const RotateLayout: FC = () => {
    const [selected, setSelected] = useState<"flat" | "pointy">("pointy")

    return (
        <div className={styles.wrap}>
            <button
                disabled={selected === "flat"}
                className={styles.flat}
                onClick={() => setSelected("flat")}
            />
            <button
                disabled={selected === "pointy"}
                className={styles.pointy}
                onClick={() => setSelected("pointy")}
            />
        </div>
    )
}
