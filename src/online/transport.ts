// Small transport boundary: tests can use in-memory channels without WebRTC or the public server.
export interface Channel {
    readonly peer: string
    readonly open: boolean
    send(data: unknown): void
    close(): void
    on(event: "open" | "close" | "error" | "data", callback: (data?: any) => void): void
}

export interface PeerEndpoint {
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
    // Uses PeerJS's default STUN/TURN configuration. Dedicated TURN credentials can be added later.
    const peer = id ? new Peer(id) : new Peer()
    return {
        connect: remote => peer.connect(remote, { reliable: true, serialization: "json" }),
        destroy: () => peer.destroy(),
        on: (event, callback) => { peer.on(event as any, callback) },
    }
}
