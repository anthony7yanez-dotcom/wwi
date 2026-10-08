# Character appearances, enemy animation and patrols

The seven original classes, established artwork and named companions remain unchanged. Protagonists choose male or female in the class-selection introduction. Gender changes presentation only; class rules, equipment, abilities and narrative access are equal. The chosen appearance persists in the hero record and appears in previews, battle, exploration and the character menu. Companions and non-recruitable counterparts keep their authored original appearance.

## Sheets and rendering

`src/sprites.js` centralizes original appearance defaults and selects the alternate sheet when the protagonist's gender differs. Returning heroes with no saved gender use their existing artwork. Choosing an appearance never assigns that appearance to an NPC sharing the same class.

Original battle sheets remain six columns by four rows: idle, attack, guard, ability. Original overworld sheets remain four columns by eight rows: south/west/north/east walking, then the same running directions.

New `public/assets/alternates/<class>.png` sheets each contain 72 drawn poses in six columns by twelve rows. Rows 0–3 contain idle, attack, guard and ability. Rows 4–7 walk south/west/north/east; rows 8–11 run those directions. CSS battle background positions use the sheet's row count; canvas movement uses the appropriate grid and a distance-based cycle. The alternate Knight's west-facing row is mirrored at render time to correct that sheet's right-facing artwork. Source images remain intact.

`public/assets/world/enemy-motions.png` contains three four-row blocks. Wolf rows 0–3 have five frames per row; Sentinel rows 4–7 and Warden rows 8–11 have six. Each block contains walking, normal attack, heavy attack and defeat. The renderer honors these differing column counts. The existing enemy sheet retains idle poses. `src/animations.js` defines species-specific animation labels, timings and grid metadata. Normal attacks and heavy attacks have separate drawn windup, impact and recovery poses. Enemy impact also schedules the hero's recoil and damage number. Finishing blows play defeat before showing victory.

Commands stay disabled until the entire hero/enemy sequence completes. Guard holds its defensive frame through the enemy response. Reduced motion uses a representative pose and short delays. The overworld's stationary guardians use a standing frame until the story enables their patrol.

## Authored patrol loops

`src/patrols.js` defines four closed loops, in world pixels:

| Spawn | Route | Speed |
| --- | --- | --- |
| Wood wolf | (304,336) → (400,336) → (400,384) → (304,384) → start | 34 px/s |
| Wood sentinel | (480,160) → (480,240) → (432,240) → (432,160) → start | 24 px/s |
| Glade wolf | (784,352) → (848,352) → (848,384) → (784,384) → start | 30 px/s |
| Shrine Warden | (480,304) → (544,304) → (544,352) → (480,352) → start | 18 px/s |

The Warden uses the existing shrine on older journeys and the inner sanctuary after the ritual confrontation on Chapter I journeys. Recruitment pacing and story gates remain unchanged.

Save `world.patrols` holds distance along each route. Position and facing are derived from it rather than stored as unrelated coordinates. Old saves may omit patrol data and start each enemy at its original position. Invalid route IDs, non-finite values and out-of-range distances fail save validation.

Only uncleared enemies on the active map advance. Collision checks protect walkable terrain. Dialogue, menus, hidden tabs, battle transitions and battles freeze updates. Patrol positions autosave with exploration and remain stable through a battle or retreat. Existing retreat grace prevents immediate repeat contact. Defeated spawns remain cleared permanently.

Rendering, minimap, proximity detection, explicit challenges and battle validation all use the same derived positions. Automatic contact retains its 32px radius. Explicit Interact chooses the closest enemy or object within 58px, so a nearby patrol does not take priority over a closer companion.

## Delivery and verification

The build embeds a lossless WebP encoding only when it is smaller than the original PNG. Original PNGs are preserved; delivery retains visible pixels and alpha. No server or image service is needed to play. The build refuses a standalone file above 100 MiB.

`npm test` covers both genders, old saves, invalid appearance data, deterministic patrol loops, corners, collision, paused and cleared enemies, dynamic contact, retreat and companion interaction. `npm run test:browser` includes all 14 class/gender choices, distinct drawn preview frames, every new sheet's 72 populated transparent poses, movement and reload, all nine enemy action sequences, pause/dialogue freezing, a moving enemy reaching a stationary player, mobile layouts, and standalone embedded asset decoding. Existing Chapter I, party and solo suites protect story and combat continuity.

## Rear-view battles and grounded exploration

`public/assets/battle/{class}.png` contains six columns and eight rows: male idle/attack/guard/ability, followed by the same female sequences. Battle sprites retain logical action rows 0–3 and use a gender row offset. Existing front-view sheets remain in character selection and the solo prototype. Formation places four actors along a foreground diagonal facing the far enemy field, with mobile spacing checked at 320px. Class poses are paired with smooth anticipation, advance, impact and recovery. Projectiles aim at the actual enemy rectangle; held guards and input locks remain intact.

The old enemy idle sheet has uneven vertical spacing. Party battles now use the newer twelve-row enemy atlas for idle and action rendering, respecting each species' column count, which prevents neighboring sprites leaking into the view. Overworld drawing locates the main connected silhouette in each atlas cell and anchors its feet to the collision position, excluding stray neighboring pixels and baked shadow padding. Source artwork remains unchanged.

Two separate battle environments provide quiet ground behind actors. Overworld backgrounds have reduced saturation/brightness while characters retain outlines and contact shadows. Interior camera zoom matches outdoor exploration for legibility. Gold objective diamonds, nearby labels, minimap markers, and Luma's optional path distinguish interactables from enemies.

`presentation.test.mjs` checks painted furniture/walls, resident collisions, old-position migration, quest milestone targets, locked routes, and reachability of every Chapter I interactable. `presentation-browser.mjs` checks all fourteen rear-view identities, formation/HUD boundaries on mobile, continuous movement, projectile aim, guidance preferences, and decoding the standalone artwork. ASCII85 embedding is byte-for-byte reversible and does not alter artwork or require external requests.
