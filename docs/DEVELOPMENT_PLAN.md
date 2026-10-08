# The Hollow — project assessment and development plan

The player's [project vision](PROJECT_VISION.md) is the source of creative direction. This document assesses the current prototype and proposes the next stages. Proposed names, lore, mechanics, and scope below are recommendations, not approved canon. No gameplay or story changes have been made as part of this assessment.

## Intended experience

One protagonist chooses a starting class during the introduction and explores an interconnected, dying world. Towns, conversations, ruins, secrets, and environmental abilities give the journey meaning between dedicated turn-based encounters. The goal is to rekindle the sacred flame; a cult welcomes its extinction. Discoveries gradually complicate the player's understanding of the flame and the consequences of restoring it.

Golden Sun informs exploration, puzzle integration, pacing, and readable battles. Characters, lore, locations, and mechanics remain original. Existing dark pixel artwork establishes the visual identity: weathered armor, red corruption, cyan supernatural light, and warm firelight against deep shadows.

Preserve a single playable character and the seven existing class concepts. Do not add party members, class switching, a real-time apocalypse timer, or a replacement art direction without discussion. Major creative changes require the player's approval.

## Assessment of the current project

Baseline: commit `b6d7409`, inspected source, tests, build/server scripts, README, asset inventory, original character lineup, cavern artwork, and a representative animation sheet. The repository uses plain JavaScript ES modules, CSS, a Node static server, and Playwright. Runtime gameplay has no external services or dependencies.

| System | Working now | Missing for the vision |
| --- | --- | --- |
| Introduction | Name one hero; select and preview seven classes; class stays fixed | Flame-centered opening, dialogue-driven introduction, main menu |
| Exploration | A three-stop journey display | Direct movement, collision, connected maps, doors, environmental interaction, secrets |
| Dialogue and story | Intro prose, class backstories, encounter descriptions | NPCs, dialogue choices, persistent story flags, meaningful quests, gradual lore discoveries |
| Combat | Attack, one class ability, guard, potion, focus, burn and weakening; enemy response after each action | Exploration transitions, distinct enemy behavior, resistances, expanded abilities, boss phases |
| Progression | Three encounter rewards; levels and recovery at refuges | XP or authored progression model, discoverable abilities, equipment, relics, upgrades, useful gold spending |
| Inventory | Potion count and gold | Item collection, inventory management, equipment and relic slots |
| Interface | Class selection, character sheet, Codex, combat commands, logs, responsive layouts | Main menu, dialogue interface, quest journal, inventory/equipment/ability/relic screens |
| Persistence | Validated version-2 solo autosave; old party saves left intact | World position, quests, treasure state, story decisions, export/import and expanded save compatibility |
| Presentation | Class-specific attack/guard/ability frames, idle frames, effects, reduced-motion support | Directional walking, NPC/enemy animations, map art, region ambience, varied enemy visuals |
| Delivery | Static browser game and offline `play.html` | Asset-loading strategy as regions grow; continued offline packaging verification |

All three encounter definitions currently share the cavern eye presentation. Their HP, damage, and descriptions differ, but they are not three distinct animated enemy designs or boss mechanics. Gold is currently a reward counter. The journey panel is not a walkable map, and the objective card is not a quest system.

The current three-battle ending claims the corruption has ended. That should become a local victory within a larger journey if approved; defeating the cavern guardian must not resolve the sacred flame's entire mystery. Existing class backstories are useful seeds, but details such as a lost sun or an unknown voice need continuity review before being treated as world canon.

## Asset continuity

| Existing asset | Direct reuse | Additional work needed |
| --- | --- | --- |
| `public/assets/heroes.png` | Seven class designs, character art, visual reference | It is a lineup illustration, not a walking animation atlas |
| `public/assets/cavern.png` | Existing battle background and cavern atmosphere | The perspective illustration is not an overhead tilemap; author matching walkable map art and collision data separately |
| `public/assets/animations/*.png` | Seven transparent 1536 × 1024 sheets, each with six idle, attack, guard, and ability poses | These 24-pose sheets have no directional walking rows; create complementary walking sheets without overwriting them |
| Local fonts and CSS | Readable dark interface and established typography | New menus and exploration overlays should reuse the existing palette, type, focus states, and responsive behavior |
| `src/engine.js` and `src/animations.js` | Combat rules, class identities, move timing, animation effects | Separate combat from linear depth progression and make rewards/return destinations explicit |

Retain all original artwork. New maps, NPCs, walking poses, and enemies should match the established silhouettes, pixel texture, colors, and lighting. New assets live alongside existing files. A temporary movement prototype may use a current idle pose, but it must not be presented as completed directional walking animation.

The standalone file is currently about 33.4 MiB. Embedding every future region indefinitely would become expensive. Keep the offline download for the first slice; introduce loading by region for the served version as content grows, with download packaging assessed separately.

## Recommended technical approach

Keep the browser platform, repository, combat code, and delivery workflow. No engine or framework migration is needed for the next milestone.

- Use Canvas 2D for an overhead world: tile layers, character movement, camera, depth ordering, and lighting. Use a fixed logical pixel resolution with nearest-neighbor scaling and a time-based update loop.
- Keep menus, dialogue, battle commands, journal, and accessibility controls in HTML/CSS. Canvas handles the world; the DOM handles readable, keyboard-accessible UI.
- Add explicit scene states for title, intro, exploration, dialogue, battle, and results. Freeze world movement while dialogue, menus, or combat is active.
- Keep world data separate from rendering: maps, collision, exits, interaction IDs, NPC dialogue, encounter definitions, and quest conditions are data. Use persistent IDs for collected treasure and completed interactions.
- Refactor battle initiation to accept an encounter ID and return location. Victory returns to the same map with appropriate rewards; avoid tying every battle to `depth + 1`.
- Save versioned world state: selected class, hero, inventory, equipment, location, story/quest flags, treasure, and encounter completion. Preserve existing saves; explicitly support continuing the old prototype or starting the new adventure rather than guessing a migration into unfinished story content.
- Continue unit tests for rules and progression, browser tests for movement/interactions/transitions, and standalone checks for offline assets. Maintain visible save-failure feedback and prevent double actions during animations.
- Extend the build pipeline deliberately for new modules. Its current fixed module list and import-stripping logic work for the prototype; use a real bundling step when the new scene/module structure requires it, preserving the standalone output.

Keyboard movement uses arrows/WASD; interact uses E/Enter. Touch controls belong in the first playable exploration implementation. Pause movement on lost focus, avoid diagonal speed boosts, respect collisions, and preserve interaction state after leaving and re-entering maps.

## Proposed cohesive design

The central loop is **explore → discover or speak → solve or prepare → battle → gain a meaningful tool → revisit or advance**.

Keep the present class strengths: Knight interrupts or weakens; Warrior breaks defenses; Paladin sustains; Sorcerer applies damaging magic; Witch drains and hexes; Gunslinger exploits openings; Monk balances offense and recovery. These are starting tactical identities, not a finalized expanded ability roster.

Proposal: an early flame-linked relic grants a shared exploration interaction, provisionally **Ember Sight**, which reveals concealed inscriptions or mechanisms. Sharing the core interaction keeps the story completable by every existing class. Later optional solutions may use class strengths, but essential routes must not exclude a starting class. The name, acquisition, and lore require approval.

Proposal: flame deterioration advances only at authored story events. Record an explicit flame stage and meaningful decisions; use those flags to alter dialogue, lighting, and authored encounter conditions. Walking, reading, revisiting, or taking time to solve a puzzle never decreases the flame. Avoid introducing a numerical timer until discussed.

Equipment should create understandable choices rather than automatic percentage inflation. Begin the larger slice with one weapon slot, one armor slot, and one relic slot; class-compatible gear changes a clearly described stat or effect. A relic should teach an interaction or alter a tactical decision. Expand upgrades after the core exploration/combat loop works.

Do not define the flame's true origin, final restoration cost, cult deity, or ending yet. Reveal a local clue in the first region and leave the larger answers open for collaborative development. Optional NPC motivations and lore should inform the world without making every conversation an exposition dump.

## Roadmap and completion criteria

| Stage | Deliverable | Ready when |
| --- | --- | --- |
| 1. Assessment and direction | Preserved vision, asset/system audit, technical plan, proposed slice | Player reviews the direction and approves the first exploration milestone |
| 2. Core exploration | Two connected maps, movement/collision/camera, doors, dialogue, chest, persistent interaction state | Player walks between maps, talks, collects a chest once, and reloads at the correct position |
| 3. Battle integration | Existing animated combat triggered from the map | Encounter starts once; controls lock correctly; victory returns to exploration; defeat has a recovery/retry path |
| 4. Progression foundations | Basic inventory/equipment, one discovered exploration relic, ability/journal UI | Collected gear/relic changes behavior, equipment respects class, and saves preserve all changes |
| 5. First region | A small settlement, approach, and shrine/cavern; local NPC stories, optional secret, exploration puzzle | Every class can finish the region; exploration and dialogue naturally explain the immediate objective |
| 6. First major boss | Adapt existing cavern/eye art into a local boss milestone | Distinct telegraphed patterns and a phase change reward tactical choices; victory resolves the local quest and opens the next route |
| 7. Expansion | Additional regions, enemies, abilities, quests, decisions | Each chapter builds on the established loop and receives continuity/balance review |
| 8. Polish throughout | Walking animations, effects, ambience, menus, accessibility, performance | Slice meets readability, input, save, mobile, offline, and animation checks before content expansion |

Stage 3 reuses the tested combat prototype; stage 4 reuses class selection. We are adding missing adventure systems rather than recreating those features. Polish accompanies each stage and receives a dedicated pass before sharing the complete slice.

## Smallest next playable milestone — proposed for approval

Build a **small settlement courtyard and connected ruined approach**. Names and final geography remain provisional. Use current class choice and existing art; do not add playable companions or switch classes.

The player can:

1. Create one character using the existing seven-class introduction.
2. Walk around the courtyard using keyboard or touch controls, with solid walls and readable exits.
3. Talk to two NPCs: a caretaker concerned about a failing local fire, and a traveler with a personal concern. Their identities and final dialogue remain proposals.
4. Open a supply chest once and see the potion count change.
5. Receive a simple objective, recorded in a small quest journal, to inspect an unlit ward on the approach.
6. Activate a mundane switch or brazier mechanism to open the path. The first milestone demonstrates interaction/state without finalizing the future relic's lore.
7. Return between the two maps and reload without losing position, chest collection, dialogue progress, or the opened path.

This is the next functional exploration milestone, not the full vertical slice. Do not replace the current combat download before the new flow works. The subsequent integrated slice adds the exploration relic puzzle, equipment discovery, map-triggered battle, cavern boss, and a local resolution suggesting the cult's involvement.

First integrated slice target: roughly 15–25 minutes with exploration, dialogue, one optional secret, one ability-gated puzzle, ordinary combat, a meaningful upgrade, and the local boss. Duration is a scope target to validate through playtesting, not a promised production schedule.

## Validation and review

- Assessment baseline: all 14 engine tests pass, including 70 seeded campaigns across all seven classes. The complete browser suite also passes: intro/class choice, a full campaign, saved-game reload, mobile layouts, all 21 class action animations, input locking, guard timing, reduced motion, and embedded offline assets.
- Next milestone tests: collision/door behavior, diagonal movement, frozen movement during dialogue, one-time chest reward, quest and switch persistence, reload at valid positions, keyboard/touch input, and no viewport overflow.
- Integrated-slice tests: all classes can solve mandatory gates; encounter return positions persist; victory rewards occur once; equipment/relic effects match descriptions; defeat cannot soft-lock; new and old save paths remain explicit.
- Before expanding: review atmosphere, exploration pacing, dialogue length, readable interactions, animation continuity, and what the player actually learns about the flame.

Await approval of the next milestone before changing the introduction, core scene flow, or adding the proposed setting and NPC dialogue. This follows the player's immediate instructions in the project vision; preserving the prompt and writing this plan do not alter existing creative decisions.
