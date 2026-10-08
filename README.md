# The Hollow — The Lone Descent

A dark fantasy solo turn-based RPG inspired by the supplied pixel-art reference.

## Download and play

On GitHub, choose **Code → Download ZIP**, extract it, and open **play.html** in your browser. This standalone file embeds the game code, artwork, animations, and fonts. No installation, server, or internet connection is needed to play. Browser-local saving depends on your browser permitting local-file storage.

## Your journey

The story begins with an awakening at the mouth of the Hollow. Name your wanderer, then choose one of seven classes during the intro. Preview attack, guard, and ability animations before committing to your calling. You control one hero throughout the campaign; start a new journey to choose a different class.

Knight weakens enemy strikes; Warrior deals heavy axe damage; Paladin attacks and heals; Sorcerer burns enemies; Witch drains health; Gunslinger fires powerful aimed shots; Monk attacks and restores balance. All seven classes can complete the solo campaign.

Each class has a transparent 6-column × 4-row animation sheet containing 24 drawn poses: six idle, six attack, six guard, and six ability frames. Frame playback changes limbs, weapons, clothing, and spell effects. Hero actions finish before the enemy reacts. Reduced-motion settings show a short static action pose instead of cycling frames.

Use buttons or keys **1–4** for attack, class ability, guard, and potion. The enemy responds after each action. Every third strike is heavy; its next move is shown beneath the battlefield. Guard reduces incoming damage by 75%, restores 5 focus, and recovers 8 health. Focus also recovers by 3 after surviving a turn. Potions restore up to 50 health.

Defeat three guardians. At each refuge, your hero gains a level, stronger attacks and abilities, full health and focus, and an additional potion. The Codex and character sheet explain your current abilities and stats.

Solo progress autosaves under `the-hollow-solo-v2`. Older party saves are left untouched under their previous key; the new campaign starts at its own intro. **New journey** asks for confirmation before resetting the solo save.

## Develop

Requires Node.js 22+. Runtime gameplay needs no services or credentials. All assets are local.

```sh
cd /workspace/wwi
npm ci --cache /workspace/.npm-cache
npm run dev
```

The server listens on port 3000. Use `PORT` to choose another port.

```sh
npm test
npm run build
npm run test:browser
```

The unit suite validates solo combat, class selection, healing, enemy telegraphs, defeat, leveling, and saved games. It also completes the campaign with every class across ten seeded runs each. Browser tests validate the actual intro, pose-changing animations for all seven classes, input locking, a complete solo campaign, saves, mobile screens, reduced motion, and the standalone download.

Browser tests use installed system Chromium, or a custom `CHROMIUM_PATH`. If system Chromium is unavailable, install the Playwright browser with `npx playwright install chromium`.

`npm run build` generates `dist/` and refreshes **play.html** at the repository root and in `dist/`. Build before distributing updates so the offline download matches the source. Serve `dist/` with any static web server.

The new animation sheets are generated adaptations of the supplied reference. Original artwork and sheets are in `public/assets/`; font licenses are in `public/fonts/`. The game remains a three-encounter single-player prototype without accounts or multiplayer.
