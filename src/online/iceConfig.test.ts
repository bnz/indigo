import { iceServers } from "./iceConfig"

test("direct connections do not use the dead PeerJS relay hosts", () => {
    const servers = iceServers("")
    expect(servers.length).toBeGreaterThan(0)
    expect(servers.every(server => String(server.urls).startsWith("stun:"))).toBe(true)
    expect(JSON.stringify(servers)).not.toContain("turn.peerjs.com")
})

test("deployments can provide working TURN credentials and TLS transport", () => {
    expect(iceServers(JSON.stringify([{ urls: ["turns:relay.example.com:443?transport=tcp"], username: "temporary-user", credential: "temporary-password" }]))).toEqual([
        { urls: ["turns:relay.example.com:443?transport=tcp"], username: "temporary-user", credential: "temporary-password" },
    ])
})

test.each(["not-json", "{}", "[]", '[{"urls":"https://example.com"}]', '[{"urls":"turn:relay.example.com","credential":123}]'])
    ("invalid ICE configuration fails explicitly (%s)", configuration => {
        expect(() => iceServers(configuration)).toThrow("invalid-ice-config")
    })
