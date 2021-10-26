import { Layout } from '../jsx/Game/Hexagons/Layout'
import { Orientation } from '../jsx/Game/Hexagons/Orientation'
import { OrientationType, PlayerId, PlayerMove, StoneIds, Stones, Tile, Tiles } from '../types'
import { PlayersStore } from "./PlayersStore/PlayersStore"
import { CSSProperties, MouseEvent } from 'react'

export interface iStore {
    layout: Layout
    renderLayout: Layout
    orientation: Orientation
    arenaElement: HTMLDivElement | null
    R: number
    isPointy: boolean
    tiles: Tiles
    tileEntries: [string, Tile][]
    orientationType: OrientationType
    playersStore: PlayersStore
    playerMove: PlayerMove
    gates: Record<number, number>
    playerMoveRouteTile: CSSProperties | undefined
    tileActionsPositionCSS: CSSProperties
    preSit: boolean
    stones: Stones
    isRouteCrossroad: boolean
    hoveredId: string | null
    getTmpCSS: CSSProperties
    dispose(): void
    nextMove(): void
    onMouseMove(event: MouseEvent<HTMLDivElement>): void
    debounce(...args: any[]): void
    onClick(): void
    cancelPreSitButton(e: MouseEvent<HTMLButtonElement | HTMLDivElement>): void
    cancelPreSit(): void
    applySitButton(e: MouseEvent<HTMLButtonElement>): void
    applySit(): void
    rotateLeftButton(e: MouseEvent<HTMLButtonElement>): void
    rotateLeft(): void
    rotateRightButton(e: MouseEvent<HTMLButtonElement>): void
    rotateRight(): void
    changeOrientation(orientation: "flat" | "pointy"): () => void
    getBackgroundUrlById(id: string): CSSProperties
    getGateway(position: number): PlayerId
    getStoneStyle(id: StoneIds): CSSProperties
}
