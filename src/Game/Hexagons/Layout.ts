import { Orientation } from './Orientation'
import { Point } from './Point'
import { Hex } from './Hex'

export class Layout {

    constructor(
        public orientation: Orientation,
        public size: Point,
        public origin: Point,
    ) {
        // console.log('Layout:::constructor')
    }

    public static pointy: Orientation = new Orientation(
        Math.sqrt(3.0),
        Math.sqrt(3.0) / 2.0,
        0.0,
        3.0 / 2.0,
        Math.sqrt(3.0) / 3.0,
        -1.0 / 3.0,
        0.0,
        2.0 / 3.0,
        0.5,
    )

    public static flat: Orientation = new Orientation(
        3.0 / 2.0,
        0.0,
        Math.sqrt(3.0) / 2.0,
        Math.sqrt(3.0),
        2.0 / 3.0,
        0.0,
        -1.0 / 3.0,
        Math.sqrt(3.0) / 3.0,
        0.0,
    )

    public hexToPixel(h: Hex): Point {
        const M = this.orientation
        const size = this.size
        const origin = this.origin
        const x = (M.f0 * h.q + M.f1 * h.r) * size.x
        const y = (M.f2 * h.q + M.f3 * h.r) * size.y
        return new Point(x + origin.x, y + origin.y)
    }

    public pixelToHex(p: Point): Hex {
        const M = this.orientation
        const size: Point = this.size
        const origin: Point = this.origin
        const pt: Point = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y)
        const q: number = M.b0 * pt.x + M.b1 * pt.y
        const r: number = M.b2 * pt.x + M.b3 * pt.y
        return new Hex(q, r, -q - r)
    }

    public hexCornerOffset(corner: number): Point {
        const M = this.orientation
        const size = this.size
        const angle = 2.0 * Math.PI * (M.start_angle - corner) / 6.0
        return new Point(
            size.x * Math.cos(angle),
            size.y * Math.sin(angle),
        )
    }

    public polygonCorners(h: Hex): Point[] {
        const corners: Point[] = []
        const center: Point = this.hexToPixel(h)
        for (let i = 0; i < 6; i++) {
            const offset: Point = this.hexCornerOffset(i)
            corners.push(new Point(center.x + offset.x, center.y + offset.y))
        }
        return corners
    }

}
