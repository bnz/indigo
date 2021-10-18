import { FC } from "react"
import cx from "classnames"
import { observer } from "mobx-react"
import { Sphere } from "../Sphere/Sphere"
import { useStore } from "../../../Store/StoreProvider"
import style from "./GatewaySeats.module.css"

export const GatewaySeats: FC = observer(() => {
    const store = useStore()

    return (
        <>
            {Object.entries(store.gates).map(([i]) => (
                <div key={i} className={cx(style.item, style[`g-${i}`])}>
                    <Sphere color={store.getGateway(parseInt(i, 10))} alt />
                </div>
            ))}
        </>
    )
})
