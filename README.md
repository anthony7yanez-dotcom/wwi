# The Hollow — A Fire Worth Keeping

A dark fantasy solo RPG with a playable exploration chapter and the existing animated turn-based combat prototype.

## Project direction

The [project vision](docs/PROJECT_VISION.md) establishes the intended story-driven adventure: one protagonist exploring a dying world, a sacred flame, a cult welcoming the darkness, environmental abilities, and strategic battles. The [assessment and development plan](docs/DEVELOPMENT_PLAN.md) records what the current prototype supports and proposes staged development of the first playable region. The first exploration milestone has been approved and implemented. Later stages remain proposals; see the current release details below.

## Download and play

On GitHub, choose **Code → Download ZIP**, extract it, and open **play.html** in your browser. This standalone file embeds the game code, artwork, animations, and fonts. No installation, server, or internet connection is needed to play. Browser-local saving depends on your browser permitting local-file storage.

## Your adventure

Name your wanderer and choose one of the seven established classes during the introduction. Preview each class's attack, guard, and ability before choosing. The new adventure begins in the **Ember Courtyard** and connects to the **Ruined Approach**.

Use **WASD / arrow keys** to walk. Hold the on-screen direction buttons for touch/pointer movement. Walk near someone or something, then press **E / Enter** or select **Interact**. Dialogue pauses movement; E/Enter advances it and Escape closes it. Your place in an unfinished conversation is saved.

Speak with the caretaker beside the fire to receive the local quest. Talk to the road traveler, collect the supply chest's two potions, read the old stones, and follow the eastern road. Raise the gate using its nearby mechanism, examine the unlit ward beyond it, then return to the caretaker. The quest journal records objectives and discoveries. Walls, structures, people, and the closed gate block movement; the camera follows you between the two maps.

The flame does not deteriorate while you walk, read dialogue, or explore. Its greater mystery remains unresolved. This release implements the first exploration milestone; map-triggered battles, equipment, exploration relics, additional regions, and the first integrated boss are future development stages.

Exploration currently reuses the established six-frame idle character poses with movement feedback. These are not new directional walking sheets. New map, NPC, and interaction-prop art complements the original character designs; all original artwork and battle sheets remain intact.

## Combat prototype

Choose **Combat prototype** from the intro or exploration sidebar, or open the game with `?mode=prototype`. This preserves the original three-encounter solo campaign, separate from the adventure. **Explore the new adventure** returns to your saved exploration progress.

Knight weakens enemy strikes; Warrior deals heavy axe damage; Paladin attacks and heals; Sorcerer burns enemies; Witch drains health; Gunslinger fires aimed shots; Monk attacks and restores balance. Every class can complete the combat prototype.

Each class's transparent 6-column × 4-row sheet contains 24 drawn poses: six idle, six attack, six guard, and six ability frames. Hero actions finish before enemy responses; guard holds its defensive pose through the strike. Reduced-motion settings show a short static action pose.

Use **1–4** for attack, ability, guard, and potion. Every third enemy strike is heavy and telegraphed. Guard reduces incoming damage by 75%, restores 5 focus, and recovers 8 health. Focus recovers by 3 after surviving a turn. Potions restore up to 50 health. Defeat three guardians; refuges grant a level, stronger attacks, full recovery, and another potion.

## Saving

Adventure progress uses `the-hollow-adventure-v1`: character, position, visited locations, quest flags, chest/gate/ward state, and unfinished dialogue. The combat prototype retains `the-hollow-solo-v2`; old party saves remain untouched. Switching modes preserves both journeys. New journey/adventure asks before replacing the current mode's save. Invalid saves return that mode to its intro, and unavailable browser storage displays a warning.

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

The 22 unit tests cover combat and exploration rules, including 70 seeded combat campaigns and local-quest completion with all seven classes. Browser tests exercise actual movement through the full quest, collisions, dialogue/menu pauses, one-time rewards, persistent conversations and positions, mode switching, touch/pointer input, mobile layouts, reduced motion, all class action animations, and the standalone bundle. The standalone check decodes every embedded PNG and verifies gameplay without external requests. Managed Chromium may block `file://` URLs; that direct-launch check reports a skip while the same offline HTML is tested through an intercepted local document route.

Browser tests use installed system Chromium, or a custom `CHROMIUM_PATH`. If system Chromium is unavailable, install the Playwright browser with `npx playwright install chromium`.

The build uses esbuild for JavaScript and embeds each asset once as a local blob URL, avoiding size limits on CSS variables. `npm run build` generates `dist/` and refreshes **play.html** at the repository root and in `dist/`. Build before distributing updates so the offline download matches the source. Serve `dist/` with any static web server.

The animation sheets and complementary world artwork are generated adaptations of the supplied reference. Original artwork and sheets are in `public/assets/`; new maps, NPCs, and props are in `public/assets/world/`; font licenses are in `public/fonts/`. The game is single-player and runs without accounts or multiplayer services.
