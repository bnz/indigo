// PeerJS 1.5.5's bundled TURN hostnames no longer resolve. Use explicit STUN
// servers for direct connections; a deployment can supply its own working TURN.
export const iceServers = (configuration = process.env.REACT_APP_ICE_SERVERS): RTCIceServer[] => {
    if (!configuration) return [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
    ]
    try {
        const servers = JSON.parse(configuration)
        if (!Array.isArray(servers) || !servers.length) throw new Error()
        return servers.map(server => {
            const urls = typeof server?.urls === "string" ? [server.urls] : server?.urls
            if (!Array.isArray(urls) || !urls.length || !urls.every(url => typeof url === "string" && /^(stun|stuns|turn|turns):\S+$/.test(url)) ||
                (server.username !== undefined && typeof server.username !== "string") ||
                (server.credential !== undefined && typeof server.credential !== "string")) throw new Error()
            return { urls, ...(server.username !== undefined ? { username: server.username } : {}),
                ...(server.credential !== undefined ? { credential: server.credential } : {}) }
        })
    } catch { throw new Error("invalid-ice-config") }
}
