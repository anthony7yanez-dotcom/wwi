# The Hollow — A Fire Worth Keeping

A dark fantasy RPG with four connected exploration areas, staged companion recruitment, party-based turn-based battles, and directional walking/running animations.

## Download and play

[Download the game ZIP](https://github.com/anthony7yanez-dotcom/wwi/archive/refs/heads/main.zip), extract it, and open **wwi-main/play.html** in a browser. Open the HTML after extracting the ZIP. This standalone file embeds the game, artwork, animations and fonts; no installation or internet connection is required. Saving uses browser-local storage when available.

## Explore and recruit

Name your wanderer and choose one of seven classes in the introduction. Your class stays fixed. Each unchosen class has a named companion who joins through a story event; the complete party is not available immediately.

The **Ember Courtyard** connects to the **Ruined Approach**, **Ashen Wood** and **Forsaken Shrine**. Speak to the caretaker, raise the gate, inspect the silent ward and report your findings. Continue east into the wood and follow its northern road to the shrine. Visible enemies begin battles on contact. The shrine guardian protects evidence of a recent ritual; the sacred flame's larger mystery remains unresolved.

Use **WASD / arrows** to walk, **Shift** to run, and **E / Enter** to interact. Touch controls include a direction pad, Run toggle and Interact. Dialogue pauses movement and saves your page; Escape closes it. Each class has 32 drawn movement poses: four walking steps and four running steps in each of four directions. Active companions follow your path with their own movement sheets. Reduced motion uses static directional poses.

The **Party** menu shows names, histories, motivations, roles and field abilities. Four characters can travel and fight, including the protagonist. Recruited reserves still supply exploration abilities and gain experience. Look for class ability interactions: split roots, brace an arch, read a veiled inscription, speak to listening roots, kindle a brazier, release a high chain catch, or still a pool. These reveal one-time rewards and personal story leads.

Recruitment and role details are in [the companion system](docs/COMPANIONS.md). The [project vision](docs/PROJECT_VISION.md) remains the source of story direction. Extended personal quest arcs, equipment/relic systems, additional abilities and further regions are future work.

## Fight together

Command each living ally once per round; the enemy responds after the party. Use **1–4** for attack, ability, guard and potion. **R** retreats to the road.

Knight weakens enemy strikes; Warrior and Gunslinger deliver heavy direct damage; Sorcerer applies a two-round burn; Witch drains health; Paladin heals the weakest ally while attacking; Monk heals self and restores 3 focus to every ally. Abilities grow with levels. Guard reduces incoming damage by 75%, recovers 8 health and 5 focus. Living members recover 3 focus after the enemy phase. Shared potions heal or revive the weakest ally by up to 50 health.

Watch the enemy intent. The Rootbound Warden's **Rootquake hits every living party member**; coordinate guards. Its stone carapace resists basic attacks, and it attacks heavily more often when wounded. Enemy stats scale with active party size. Companions cannot be swapped during an encounter.

Victory clears the map enemy permanently and grants gold, shared experience and a little recovery. Defeat returns the party to the courtyard fire; the enemy remains. Rest at the fire to restore the whole roster and replenish at least three potions. Exploration never advances an apocalypse timer.

## Saving and the original prototype

Adventure progress uses `the-hollow-adventure-v2`, including recruitment, active/reserve composition, resources, partial battle rounds, discoveries, defeated enemies, position and unfinished dialogue. Existing `the-hollow-adventure-v1` saves migrate automatically; their old data remains intact. New adventure asks before replacing the current save.

**Combat prototype** retains the original three-encounter solo campaign, seven class animations and separate `the-hollow-solo-v2` save. Open it from the intro/sidebar or with `?mode=prototype`. Switching modes preserves both journeys. Older party saves remain untouched.

## Develop

Requires Node.js 22+. Runtime gameplay has no services, accounts or credentials. All assets are local.

```sh
cd /workspace/wwi
npm ci --cache /workspace/.npm-cache
npm run dev
```

The server uses port 3000; `PORT` can select another port.

```sh
npm test
npm run build
npm run test:browser
```

Unit tests cover solo combat and campaigns, movement/collisions, all seven starting classes' recruitment coverage, party turns, coordinated defense, healing/revival, reserve exploration abilities, rewards/recovery and save migration. Browser tests exercise actual movement, dialogue and recruitment, all 224 directional poses, class battle animations, enemy contact transitions, saved partial rounds, boss defense, desktop and 390px/320px layouts, and embedded offline gameplay without external requests.

Browser checks use installed system Chromium or `CHROMIUM_PATH`. Install a browser with `npx playwright install chromium` if needed. Managed Chromium may block `file://`; direct launch then reports a skip while the same self-contained HTML is tested through an intercepted local document route.

The esbuild build refreshes **play.html** at the repository root and in `dist/`. Each unique asset becomes a short blob URL, avoiding Chromium limits on CSS variables. Build before distributing changes. `dist/` also contains the static source/asset tree for hosting.

Original artwork and battle sheets are preserved in `public/assets/`; generated adaptations matching the supplied reference include the directional sheets in `public/assets/overworld/` and region/enemy art in `public/assets/world/`. Font licenses are in `public/fonts/`.
