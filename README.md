# Indigo

A local, pass-and-play adaptation of the Indigo board game, built with React, TypeScript and MobX.

## Run locally

Tested with Node.js 20 and Yarn Classic.

```sh
yarn install --frozen-lockfile
npm start
```

Open http://localhost:9876. The port is configured in `.env`.
To check from another device on the same network, run `HOST=0.0.0.0 npm start`
and open the host computer's address on port 9876.

## Stage 1

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

## Verification

```sh
CI=true npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npm run build
```

Tests cover movement, collisions, center releases, scoring and ties, illegal placements,
50 seeded complete games for each player count, atomic saving, reload during animation, input locking and restart.

## Production deployment

Every commit pushed to `main` is tested, built, and deployed to GitHub Pages by
`.github/workflows/deploy.yml`. A failed test or build prevents deployment.

GitHub Pages must use the `gh-pages` branch with the `/ (root)` folder as its source.
The `public/CNAME` file preserves the `indigo.bonez.me` custom domain in every deployment.

## Next stages

1. Local player setup, optional hand privacy, and further mobile/accessibility improvements.
2. Complete rules localization and tooling updates, without changing verified gameplay.
