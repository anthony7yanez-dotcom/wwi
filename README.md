# The Hollow — Chapter I: Glimmer of Hope

A dark fantasy, turn-based RPG set in Nhalis. An ordinary courtyard resident chooses to investigate failing sacred wards and bring a small light home.

## Download and play

[Download the game ZIP](https://github.com/anthony7yanez-dotcom/wwi/archive/refs/heads/main.zip), **extract it**, then open **wwi-main/play.html** in your browser. Open the HTML after extracting the ZIP; clicking the ZIP does not launch the game. The standalone file contains the game, artwork, animations, and fonts. No installation or connection is needed to play.

Older saves keep their existing adventure and recruited companions. To experience the new opening and Chapter I, start **New adventure**. Export a save through the new System menu before replacing progress you want to retain.

## Chapter I

Watch or skip the opening, name your character, and choose one of the seven established classes. Your class stays fixed. Explore the Ember Courtyard, your home, and Harker's supply house. Listen to neighbors, inspect the silent ward, and choose why you will act. Follow the connected road through the Ashen Wood to the Forsaken Shrine. Investigate the mechanisms, discover a class-independent exploration relic, enter the inner sanctuary, confront the ritual, and return home after restoring its local light.

Chapter I is complete when the caretaker recognizes your return. The First Fire's greater crisis remains. Chapters II–VI are documented for development and are not playable yet. Companions are introduced as local people in new Chapter I journeys; formal recruitment belongs to later chapters. Existing companion identities and artwork are preserved.

**WASD / arrows** walk, **Shift** runs, **E / Enter** interacts, and **P / Escape** opens management outside dialogue. Touch controls provide movement, Run, and Interact. Dialogue pauses movement and saves its page. Each class has four walking and four running poses for every direction, plus distinct attack, guard, and ability animations. Reduced motion follows your device setting.

The management menu includes Party, Character, Equipment, Relics, Inventory, Abilities, Journal, Lore Codex, Map, and System. Equipment changes affect actual attack, defense, or focus recovery. Discovered Wayflames provide fast travel. Lore entries retain their sources and appear through discoveries. System supports save/load, JSON save export/import, and optional original synthesized ambient music.

## Combat and party foundation

Visible enemies trigger animated battles on contact. Use **1–4** for attack, ability, guard, and potion; **R** retreats. Watch the telegraphed enemy move. Guard reduces incoming damage by 75% and restores health and focus. The Warden's stone shell resists basic attacks; its heavy Rootquake reaches all active allies, and its rhythm changes when wounded.

The party engine supports four active combatants, unique class companions, reserves, independent health/focus/equipment, shared progression, and reserve exploration abilities. Command each living active member before the enemy responds. Knight weakens strikes, Sorcerer burns, Paladin heals allies, Witch drains health, Monk restores party focus, and Warrior/Gunslinger deal direct damage. Older recruited parties remain functional. New Chapter I can be completed by every class without recruits or grinding.

Victory permanently clears an encounter and grants gold, experience, and recovery. Defeat returns you to the courtyard; the enemy remains. Rest at a hearth to recover the roster and replenish at least three potions. Exploration has no countdown to apocalypse.

## Saves and prototype

Adventure progress uses `the-hollow-adventure-v2`. It persists class, roster, equipment, supplies, position, dialogue pages, battle commands, quests, puzzle state, discovered lore, Wayflames, restored light, and chapter completion. Version 1 exploration saves migrate without losing their data. Browser-local saving depends on storage being available; use System → Download save file for a portable backup.

The **Combat prototype** preserves the original three-battle solo campaign and separate `the-hollow-solo-v2` save. Open it from the intro/sidebar or `?mode=prototype`. Switching modes preserves both journeys.

## Develop and verify

Requires Node.js 22+. The runtime needs no services, accounts, or credentials. All assets are local.

```sh
cd /workspace/wwi
npm ci --cache /workspace/.npm-cache
npm run dev
```

The server defaults to port 3000. `PORT` selects another port.

```sh
npm test
npm run build
npm run test:browser
```

Unit coverage includes all seven classes completing Chapter I alone, equipment effects, puzzle gates, story consistency, public lore boundaries, earlier campaigns, party tactics, movement, and save compatibility. Browser coverage exercises the introduction, characters and interiors, all 224 movement poses, battle animations, visible encounters, partial-round saves, shrine passage, ending, all ten menu tabs, gear, shop, Wayflames, portable saves, sound, and 390px/320px layouts.

Browser checks use system Chromium or `CHROMIUM_PATH`. Install Chromium through Playwright if needed. Managed Chromium blocks local file URLs; that check reports a skip. Tests load the same standalone HTML through the local server and verify its assets/gameplay require no additional network requests.

The build refreshes root **play.html** and `dist/play.html`; build before distribution. `dist/` also contains the static source and asset tree. Developer narrative documents are excluded from both player builds. Original artwork and sheets remain in `public/assets/`; adaptations and additional interiors complement them.

## Developer narrative references

These documents contain future story planning and spoilers; they are separate from the in-game codex.

- [Central lore bible](docs/narrative/LORE_BIBLE.md): public belief, objective history, faction knowledge, and reveal limits.
- [Character registry](docs/narrative/CHARACTER_REGISTRY.md): retained identities, proposed-name reconciliation, recruitment chapters, relationships, and knowledge boundaries.
- [Narrative dependencies](docs/narrative/NARRATIVE_DEPENDENCIES.md): six-chapter milestones, branching convergence, and Chapter I event conditions.
- [World and systems architecture](docs/narrative/WORLD_AND_SYSTEMS.md): regional connections, progression, management interface, persistence, and release boundaries.
- [Chapter I outline](docs/CHAPTER_I.md) and [original brief](docs/narrative/CHAPTER_I_BRIEF.md).
- [Party foundation](docs/COMPANIONS.md) and [original project vision](docs/PROJECT_VISION.md).
