# The Hollow

A playable dark fantasy, turn-based browser RPG inspired by the supplied pixel-art reference. Select three of seven heroes and survive three encounters in a corrupted cavern.

## Play without installing anything

Download this repository using GitHub's **Code → Download ZIP**, extract the ZIP, then open **play.html** in your browser. This standalone file embeds the game code, artwork, and fonts. No Node.js installation, server, or internet connection is needed to play. Browser-local saving depends on your browser allowing storage for local files.

## Run

Requires Node.js 22 or later. No runtime packages or external services are needed.

```sh
cd /workspace/wwi
npm ci --cache /workspace/.npm-cache
npm run dev
```

The server listens on port 3000. Set `PORT` to use a different port. Art and fonts are served locally; gameplay works without external network access. The generated environment and hero sheet are adaptations of the supplied reference, stored in `public/assets/`. Font licenses are in `public/fonts/`.

## Play

Choose **Manage party** to select three unique heroes, then **Begin encounter**. Heroes act in speed order. Use the action buttons or keys **1–4** for attack, class ability, guard, and potion. The enemy attacks after all living heroes act, and attacks the whole party every third round. Clear an encounter to descend, recover health and focus, revive fallen heroes, and gain a potion. Clear the third encounter to win.

Knight weakens attacks; Warrior and Gunslinger deal heavy damage; Paladin heals the most wounded living ally; Sorcerer applies burning; Witch drains health; Monk heals the party. The Codex explains the rules in-game. Sound effects are optional and enabled with the sound button.

Progress saves automatically in browser local storage. **New expedition** resets the run after confirmation. Clearing browser storage removes saved progress.

## Validate and build

```sh
npm test
npm run test:browser
npm run build
```

The unit suite exercises combat, skills, turn order, healing, defeat, progression, and save validation. The browser suite starts its own server on port 3101 and verifies party selection, a full winning expedition, saved-game reloads, and desktop/mobile layouts. It uses system Chromium when installed; otherwise install Playwright Chromium with `npx playwright install chromium`. Set `CHROMIUM_PATH` for a custom executable.

`npm run build` writes the standalone static app to `dist/`. Serve that folder with any static web server. This is a single-player prototype: three encounters, no multiplayer or account backend.
