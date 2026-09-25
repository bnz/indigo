# Indigo

An adaptation of the Indigo board game with local pass-and-play and browser-to-browser online rooms, built with React, TypeScript and MobX.

## Run locally

Tested with Node.js 20 and Yarn Classic.

```sh
yarn install --frozen-lockfile
npm start
```

Open http://localhost:9876. The port is configured in `.env`.
To check from another device on the same network, run `HOST=0.0.0.0 npm start`
and open the host computer's address on port 9876.

## Local play

- Two to four people take turns on one device. Three-player games have two shared gateways per player; four-player games use shared gateways throughout.
- Click or tap an empty cell, rotate the tile, then confirm with **Place tile**. On desktop, double-clicking a selected cell also places the tile.
- Arrow keys or the mouse wheel rotate, Enter places, Escape cancels selection, and R changes board orientation.
- The engine resolves a complete turn before animation starts. Input is locked during animation.
- Emeralds leave the center first, the sapphire leaves last, and colliding gems are removed.
- Gate-to-gate paths are rejected. Scores and tie-breakers determine all winners.
- Scores are visible, and a new tile is drawn for the incoming player. Private hands/screens are not implemented.

New games are saved as an atomic snapshot under the `game-v2` localStorage key.
Reloading during animation restores the completed turn, without replaying scoring.
Legacy saves in `game` are left untouched but are not loaded by the corrected engine.

Rules reference: https://www.ultraboardgames.com/indigo/game-rules.php

## Online play (2–4 browsers)

1. Choose **Play by invitation / Играть по ссылке** on the start screen or in the menu.
2. Enter your name and create a room.
3. Copy the invitation link and send it to the other players. Each player opens it in their own browser, enters a name, and joins.
4. The host starts the game once 2–4 participants are connected. Only the player whose turn it is can rotate/select/place a tile.
5. The **Room / Комната** dropdown shows participants, the invitation link, connection errors, and the leave/reconnect buttons.

The existing local game remains available. Joining or leaving an online room does not reset its `game-v2` save or its screen, theme, and language preferences.

### Connection and hosting

- The site is still a static application: there is no application server or central game database.
- PeerJS Cloud handles signaling. Moves and state snapshots travel over reliable WebRTC DataChannels using PeerJS's default STUN/TURN configuration.
- No API key or subscription is needed for this initial setup. PeerJS is loaded only when connecting to a room.
- Public signaling/relay services are best-effort. Restricted networks may still fail to connect; the UI reports a timeout and offers reconnection. A dedicated TURN service is not configured.
- Serve the site over HTTPS (or localhost for development). Invitation URLs use `#/room/<id>`, so static hosting needs no route rewrites. For remote friends, use the deployed URL, not a localhost invitation.

### State and reconnection

- The creator's browser is the host and authoritative writer. It validates the sender's reserved seat, turn, state revision, tile type, and placement using the same rules as local play.
- Only confirmed placements are synchronized. Tile selection and rotation previews stay local; the host draws the next tile and broadcasts the resulting snapshot.
- Every participant saves the confirmed room snapshot and their own rejoin token under `indigo-room-v1:<room>`. Per-device rendering state is saved separately under `game-online-v1:<room>:<token>`.
- Move requests have an ID and a base revision. Duplicate/stale requests cannot apply a move twice. Missed acknowledgements trigger state resynchronization.
- Heartbeats detect disconnected participants. The game pauses until everyone reconnects; the host never advances a missing player's turn automatically.
- Reloading or returning through the same invitation restores the player's reserved seat from that browser's storage. The start screen also offers **Return to online room** for the most recent room.
- The host must return using the same browser/profile. There is no host migration or server-side recovery if the host's local storage is lost. Clearing a guest's storage also loses that guest's rejoin token; new players cannot take seats after the game starts.
- To test multiple players on one computer, use separate browser profiles/isolated contexts. Tabs sharing localStorage represent the same participant, not extra players.

## Verification

```sh
CI=true npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npm run build
```

Tests cover movement, collisions, center releases, scoring and ties, illegal placements,
50 seeded complete games for each player count, atomic saving, reload during animation, input locking and restart.
Online tests use an in-memory transport to cover a four-player round, turn/placement validation,
stale and duplicate messages, capacity and protocol rejection, lost acknowledgements,
heartbeat timeouts, guest/host reload, and isolation from local saves.

## Production deployment

Every commit pushed to `main` is tested, built, and deployed to GitHub Pages by
`.github/workflows/deploy.yml`. A failed test or build prevents deployment.

GitHub Pages must use the `gh-pages` branch with the `/ (root)` folder as its source.
The `public/CNAME` file preserves the `indigo.bonez.me` custom domain in every deployment.

## Next stages

1. Local player setup, optional hand privacy, and further mobile/accessibility improvements.
2. Complete rules localization and tooling updates, without changing verified gameplay.
