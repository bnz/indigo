import { OrientationType, Tiles } from '../types'
import { Layout } from '../Game/Hexagons/Layout'
import { Point } from '../Game/Hexagons/Point'

export class __DEV__appendStyles {

    constructor(
        private smallSide: number,
        private largeSide: number,
        private ratio: number,
        private tiles: Tiles,
    ) {
        this.appendStyles()
    }

    private appendStyles() {
        window.setTimeout(() => {
            const head = document.getElementsByTagName('head')[0]
            if (head) {
                const style = document.createElement('style')
                style.setAttribute('data-qr', '')
                style.innerHTML = `${this.generateCoords('pointy')}\n${this.generateCoords('flat')}`
                head.appendChild(style)
                // console.log(style.innerHTML)
            }
        }, 0)
    }

    private generateCoords(orientation: OrientationType): string {
        const isPointy = orientation === 'pointy'

        const layout = new Layout(
            Layout[orientation],
            new Point(1, 1),
            new Point(
                0,
                isPointy ? this.largeSide : this.smallSide,
            ),
        )

        const arr: string[] = []

        Object.entries(this.tiles).forEach(([, { hex }]) => {
            const { x, y } = layout.hexToPixel(hex)
            arr.push(`.${orientation} [data-qr="${hex.id}"] { transform: translate(calc(${x - 1} * var(--R)), calc(${y - this.ratio} * var(--R))${isPointy ? `) rotate(-30deg)` : ')'}; }`)
        })

        return arr.join('\n')
    }
}
