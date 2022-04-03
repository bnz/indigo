import { observer } from "mobx-react"
import { CSSProperties, FC } from "react"
import svg from "../../../assets/hex.svg"
import { AllTiles, Data, IAllTiles } from "../../../types"

export interface TileProps {
    qr: string
    tile?: IAllTiles
}

const E: FC<{ style: CSSProperties }> = ({ style, children }) => (
    <div style={{
        backgroundColor: "#ccc", color: "#333", borderRadius: 2, position: "absolute", fontSize: "90%",
        padding: 1,
        lineHeight: 1,
        ...style,
    }}>
        {children}
    </div>
)

export const Tile: FC<Data<TileProps>> = observer(({ data }) => (
    <div
        data-qr={data.qr}
        style={{ backgroundImage: `url(${svg}#${(data.tile !== undefined && AllTiles[data.tile]) || "_"})` }}
    >
        {
            // @ts-ignore
            localStorage.getItem("DEBUG") === "true" && (
                <>
                    <E style={{ top: "5%", left: "50%" }}>2</E>
                    <E style={{ top: "20%", left: "17%" }}>3</E>
                    <E style={{ top: "20%", right: "17%" }}>1</E>
                    <E style={{ bottom: "20%", right: "17%" }}>0</E>
                    <E style={{ bottom: "20%", left: "17%" }}>4</E>
                    <E style={{ bottom: "5%", left: "50%" }}>5</E>
                    <div style={{
                        fontSize: "150%",
                        backgroundColor: "#ccc", color: "#666", borderRadius: 2, padding: 2, lineHeight: 1,
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    }}>
                        {data.qr}
                    </div>
                </>
            )}
    </div>
))
