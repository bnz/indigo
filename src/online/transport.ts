import { iceServers } from "./iceConfig"

// Small transport boundary: tests can use in-memory channels without WebRTC or the public server.
export interface Channel {
    readonly peer: string
    readonly open: boolean
    send(data: unknown): void
    close(): void
    on(event: "open" | "close" | "error" | "data" | "iceStateChanged", callback: (data?: any) => void): void
}

export interface PeerEndpoint {
    readonly open?: boolean
    connect(id: string): Channel
    destroy(): void
    on(event: "open" | "connection" | "error" | "disconnected" | "close", callback: (data?: any) => void): void
}

export type PeerFactory = (id?: string) => Promise<PeerEndpoint>

export const createPeer: PeerFactory = async id => {
    // The self-contained browser build avoids Webpack 4's ESM/CJS interop limitations.
    await import("peerjs/dist/peerjs.js")
    const { Peer } = (window as unknown as { peerjs: { Peer: typeof import("peerjs").Peer } }).peerjs
    // PeerJS Cloud performs signaling; game state travels over reliable WebRTC data channels.
    const options = { config: { iceServers: iceServers() }, secure: true }
    const peer = id ? new Peer(id, options) : new Peer(options)
    return {
        get open() { return peer.open },
        connect: remote => peer.connect(remote, { reliable: true, serialization: "json" }),
        destroy: () => peer.destroy(),
        on: (event, callback) => { peer.on(event as any, callback) },
    }
}
