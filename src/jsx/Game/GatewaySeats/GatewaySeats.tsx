import { FC } from "react"
import cx from "classnames"
import { Sphere } from "../Sphere/Sphere"
import { useStore } from "../../../Storage/Store/StoreProvider"
import { getGateway } from "../../../Storage/Store/applyers/getGateway"
import style from "./GatewaySeats.module.css"

export const GatewaySeats: FC = () => {
    const store = useStore()

    return (
        <>
            {Object.entries(store.gates).map(([i]) => (
                <div key={i} className={cx(style.item, style[`g-${i}`])}>
                    <Sphere color={getGateway(store)(parseInt(i, 10))} alt />
                </div>
            ))}
        </>
    )
}
