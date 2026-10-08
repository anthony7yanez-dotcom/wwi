# The Hollow — Chapters I & II

A dark fantasy, turn-based RPG set in Nhalis. An ordinary courtyard resident chooses to investigate failing sacred wards and bring a small light home.

## Download and play

[Download the game ZIP](https://github.com/anthony7yanez-dotcom/wwi/archive/refs/heads/main.zip), **extract it**, then open **wwi-main/play.html** in your browser. Open the HTML after extracting the ZIP; clicking the ZIP does not launch the game. The standalone file contains the game, artwork, animations, and fonts. No installation or connection is needed to play.

Older saves keep their existing adventure, character appearance, and recruited companions. Choose male or female in the class-selection intro when starting a new adventure. To experience the new opening and Chapter I, start **New adventure**. For a new download/folder, export your old journey through Menu → System → Download save file, then use **Import a save file** on the updated game’s opening screen. No temporary character or restart is required. Browser storage may differ between extracted folders.

## Chapter I

Watch or skip the opening, name your character, select male or female, and choose one of the seven established classes. Your class stays fixed. Explore the Ember Courtyard, your home, and Harker's supply house. Listen to neighbors, inspect the silent ward, and choose why you will act. Follow the connected road through the Ashen Wood to the Forsaken Shrine. Investigate the mechanisms, discover a class-independent exploration relic, enter the inner sanctuary, confront the ritual, and return home after restoring its local light.

Chapter I is complete when the caretaker recognizes your return. The First Fire's greater crisis remains. Chapter II is now playable; Chapters III–VI remain documented future content. Companions are introduced as local people in new Chapter I journeys; formal recruitment begins in Chapter II. Existing companion identities and artwork are preserved.

**WASD / arrows** walk, **Shift** runs, **E / Enter** interacts, and **P / Escape** opens management outside dialogue. Touch controls provide movement, Run, and Interact. Dialogue pauses movement and saves its page. Both genders are available for every class with distinct appearances and attack, guard, and ability animations. Existing sprite sheets have four walking/running poses per direction; new alternate appearances have six. Your choice follows you into exploration, combat, and the character menu. Reduced motion follows your device setting. Gold diamonds mark the current objective; Luma, a road fairy, follows a walkable route toward it. **G** or the guidance button shows/hides her route, and the choice is saved. Nearby objects display their names. Interior furniture, walls and residents have collision footprints; older saves are moved to nearby safe ground when necessary.

The management menu includes Party, Character, Equipment, Relics, Inventory, Abilities, Journal, Lore Codex, Map, and System. Equipment changes affect actual attack, defense, or focus recovery. Discovered Wayflames provide fast travel. Lore entries retain their sources and appear through discoveries. System supports save/load, JSON save export/import, and optional original synthesized ambient music and combat/exploration sound effects. Use the speaker icon to enable sound; browsers require a player gesture.

## Chapter II — Weight of a Promise

After completing Chapter I, return to the caretaker and accept the petition from Lornwatch. Continue your saved journey without restarting. Explore Lornwatch, Greyfen March, the Mourning Hollows, and the Beacon of Thorns, with physical return roads and new Wayflames.

Aldren (Knight) and Ilyra (Paladin) can join for their own reasons. If you chose their class, that counterpart remains an NPC and your own exploration ability performs their task. Brace the crossing, recover the dated records, kindle the sanctuary cup, and choose between full refugee warmth, uncertain rain channels, or a rationed beacon. Every route can finish; its cost changes settlement dialogue and local conditions. The optional blanket delivery and camp conversation persist. Two different class abilities in one round break the Thornbound Sentinel’s renewing shell. Completing the chapter earns a functional defensive relic. The next Sablewood road remains closed pending Chapter III development.

## Alchemist lessons and enemy ecology

Neris Vale works behind the bench in the courtyard supply house. Speak to her and choose **Study techniques**. Each of the seven classes has four unique lessons: the first is free at level 1, then lessons cost 25 / 40 / 60 gold at levels 2 / 3 / 4. Learn them in order for the protagonist or any recruited companion, including reserves. Lessons persist in saves and appear in Menu → Abilities. During that character’s battle turn, use the additional technique buttons or keys **5–8**. Techniques offer armor breaking, piercing strikes, burns, weakness, healing, focus sharing, and a ward protecting the entire party for one enemy phase. They retain your selected class.

Only the protagonist is drawn while exploring; recruited companions remain in menus, exploration puzzles, and combat. Wolves are smaller than people, and ogres/guardians are larger. The Mourning Hollows now hold skeletons and a Covenant-bound succubus; Greyfen has an ogre and an undead pilgrim; a vampire patrols the beacon’s outer court. These optional encounters have saved patrol routes and distinct walking, attack, heavy, recoil, and collapse poses. Skeleton armor rewards piercing/breaks; burning suppresses undead regeneration; guarding denies focus-draining curses and limits vampire siphons; the ogre’s telegraphed crush hits the party. Existing wolves, cult sentinels, and wardens also have animated howls, invocations, and root renewal.

New adventure encounters have 12% more health and 15% stronger strikes. Battles already saved under the previous rules retain their original health and damage until the next encounter. The combat prototype keeps its existing balance.

## Combat and party foundation

Battles use a diagonal view with the party in the near foreground, seen from behind, and enemies across the far side. Both genders of all seven classes have rear-view attack, guard and ability frames. Uneven atlas rows are measured at runtime and visible feet anchored consistently. Paladin impact frames retain the full character; Monk strikes face the enemy; wolf collapse reads all six poses. Dedicated battle backgrounds, contact shadows, cleaner silhouettes and smoothly eased movement improve separation without changing the established designs.

Visible enemies walk authored, repeating patrol loops and trigger animated battles on contact, including when an enemy walks into you. Wolves, cult sentinels, and the Warden have unique walking, normal attack, heavy attack, and defeat sequences. Patrols pause during dialogue, management menus, battle transitions, and battles; cleared enemies stay gone. Use **1–4** for attack, ability, guard, and potion; **R** retreats. Watch the telegraphed enemy move. Guard reduces incoming damage by 75% and restores health and focus. The Warden's stone shell resists basic attacks; its heavy Rootquake reaches all active allies, and its rhythm changes when wounded.

The party engine supports four active combatants, unique class companions, reserves, independent health/focus/equipment, shared progression, and reserve exploration abilities. Command each living active member before the enemy responds. Knight weakens strikes, Sorcerer burns, Paladin heals allies, Witch drains health, Monk restores party focus, and Warrior/Gunslinger deal direct damage. Older recruited parties remain functional. New Chapter I can be completed by every class without recruits or grinding.

Victory permanently clears an encounter and grants gold, experience, and recovery. Defeat returns you to the courtyard; the enemy remains. Rest at a hearth to recover the roster and replenish at least three potions. Exploration has no countdown to apocalypse.

## Saves and prototype

Adventure progress uses `the-hollow-adventure-v2`. It persists class, gender, patrol route positions, roster, equipment, supplies, position, dialogue pages, battle commands, quests, puzzle state, discovered lore, Wayflames, restored light, and chapter completion. Version 1 exploration saves migrate without losing their data. Browser-local saving depends on storage being available; use System → Download save file for a portable backup.

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

Unit coverage includes all seven classes completing Chapter I alone and all 21 class/decision routes completing Chapter II, thorn-shell cooperation, sound lifecycle, frame registration, equipment effects, puzzle gates, story consistency, public lore boundaries, earlier campaigns, party tactics, movement, and save compatibility. Browser coverage exercises the introduction, characters and interiors, all original 224 movement poses, 504 new alternate-character poses, both genders for all seven classes, enemy action animations and moving patrol contact, visible encounters, partial-round saves, shrine passage, ending, all ten menu tabs, gear, shop, Wayflames, portable saves, sound, Chapter II recruitment/choices/boss/backtracking and 390px/320px layouts.

Browser checks use system Chromium or `CHROMIUM_PATH`. Install Chromium through Playwright if needed. Managed Chromium blocks local file URLs; that check reports a skip. Tests load the same standalone HTML through the local server and verify its assets/gameplay require no additional network requests.

The build refreshes root **play.html** and `dist/play.html`; build before distribution. `dist/` also contains the static source and asset tree. Developer narrative documents are excluded from both player builds. The standalone embeds lossless WebP where it saves space; source PNGs and their visible pixels remain intact. A reversible ASCII85 byte encoding keeps the expanded artwork under the standalone size limit. The build rejects standalone files above 100 MiB. Original artwork and sheets remain in `public/assets/`; adaptations and additional interiors complement them.

## Developer narrative references

These documents contain future story planning and spoilers; they are separate from the in-game codex.

- [Central lore bible](docs/narrative/LORE_BIBLE.md): public belief, objective history, faction knowledge, and reveal limits.
- [Character registry](docs/narrative/CHARACTER_REGISTRY.md): retained identities, proposed-name reconciliation, recruitment chapters, relationships, and knowledge boundaries.
- [Narrative dependencies](docs/narrative/NARRATIVE_DEPENDENCIES.md): six-chapter milestones, branching convergence, and Chapter I event conditions.
- [World and systems architecture](docs/narrative/WORLD_AND_SYSTEMS.md): regional connections, progression, management interface, persistence, and release boundaries.
- [Chapter I outline](docs/CHAPTER_I.md) and [original brief](docs/narrative/CHAPTER_I_BRIEF.md).
- [Party foundation](docs/COMPANIONS.md) and [original project vision](docs/PROJECT_VISION.md).
