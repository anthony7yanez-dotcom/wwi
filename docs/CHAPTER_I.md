# Chapter I — Glimmer of Hope

## Continuity and current foundation

The repository already supplies the seven established class designs and battle sheets, four-direction walking/running sheets, the Ember Courtyard, Ruined Approach, Ashen Wood and Forsaken Shrine, named companion identities, controllable party combat, visible encounters, a Rootbound Warden boss, local dialogue/quest flags, and offline builds. Reuse these systems and preserve every existing asset.

The chapter brief supplies the central direction: an ordinary person chooses to resist the dying world's despair, investigates the local corruption, and achieves a small return of warmth. The central sacred flame is not rekindled and its origin is not revealed. Chapter II is outside this task.

## Focused development outline

| Phase | Playable experience | Existing assets/systems | Necessary additions |
| --- | --- | --- | --- |
| A: Introduction | A short, skippable four-scene opening contrasts the sacred flame's past importance with failing wards and everyday settlement life. Name the resident and choose the calling they have practiced. | Courtyard, forest and shrine backgrounds; all class previews and fixed-class rules | Fragile-flame opening artwork, original narration, saved cinematic progress, story-integrated class descriptions |
| B: Settlement | Explore home and communal buildings; hear fear, skepticism, faith and quiet support. Read a family note, collect supplies, inspect equipment, and accept the caretaker's ward investigation. | Courtyard geography, caretaker, traveler, gate/ward quest, protagonist movement | Enterable home and supply house, ordinary resident sprites and conversations, inventory/equipment, explicit commitment to act |
| C: Wilderness | The open ward road leads to corrupted wildlife, an abandoned camp, a useful protective item and fresh ritual evidence. Introduce combat through one readable encounter. | Approach, Ashen Wood, wolves, animated battle commands and rewards | A contextual battle tutorial, optional equipment discovery, story objective updates and first exploration technique |
| D: Ruins | Investigate the Forsaken Shrine. Read a clue, align three mechanisms in an authored order, and use a recovered exploration tool to release a sealed passage. Wrong attempts reset the puzzle without costing resources. | Shrine art, stones/props, sentinel and field-interaction architecture | A persistent puzzle state, hidden treasure and a small entrance mechanism; all classes must have a route through it |
| E: Climax (consistent with master bible) | Expand the existing shrine with an inner sanctuary. A cult ritualist argues for destruction and turns the Warden against the local light. Defeat the Warden, interrupt the corruption, restore a small sanctuary ember, then bring proof home. | Existing shrine/Warden/sentinel art and combat | Inner-sanctuary map, authored cult dialogue, boss gate, local ember restoration, settlement reactions and a clear chapter completion state |
| F: Polish and testing | Readable lighting, original optional synthesized music/ambience, scene transitions, uninterrupted saves, accessible input and reduced motion. | Existing canvas renderer, mobile controls, animation runner, tests and standalone bundler | Region-aware audio, atmosphere, complete chapter tests across starting classes, save migration, browser journey and offline validation |

## Companion pacing

Keep the complete established roster and party architecture. New Chapter I journeys meet Aldren, Branna, and Ilyra as local NPCs with reasons to stay; formal recruitment starts in Chapter II. Include the matching selected-class counterpart as a non-recruitable NPC. Existing recruited companions in older saves remain recruited. The reconciled future recruitment schedule and knowledge boundaries are in [the character registry](narrative/CHARACTER_REGISTRY.md).

## Success criteria

A new journey has an opening, settlement, connected wilderness, a solvable ruins puzzle, equipment with actual combat effects, a cult confrontation, a boss, a visibly restored local light, changed village dialogue, and a saved end-of-chapter moment. Every starting class can complete the main route without a specific optional recruit or grinding. The player knows what is happening to daily life and why they choose to act; the flame's ultimate cause remains a mystery.

## Artwork gaps

The current maps do not include an inhabited home interior or ordinary village resident atlas, and the existing opening uses cavern art. Add complementary assets for those gaps without replacing the original files. The inner sanctuary expands the existing shrine; its light is local, as required by the master bible.
