# Six-chapter dependency and reveal map

Future chapters are architecture only. Chapter I is the implementation boundary. All chapter transitions require explicit development authorization.

| Chapter / theme | Entry prerequisites | Essential milestones and convergence | Locations / major boss | Clue and knowledge ceiling |
| --- | --- | --- | --- | --- |
| I — Glimmer of Hope / hope | Name, fixed class, ordinary resident background | Caretaker → gate → cold ward → conscious resolve → wood evidence → three mechanisms + universal mirror → ritual → Warden → local light → return home | Ember Courtyard / Ruined Approach / Ashen Wood / Forsaken Shrine & inner sanctuary; Rootbound Warden | Ambiguous religious yielding inscription; no mechanism explanation |
| II — Weight of a Promise / responsibility | I complete; journey expands | Synod interest → requests → Lornwatch's endangered beacon → choose immediate rescue, uncertain alternative, or sacrifice → converge on regional aid; first recruitment candidates | Lornwatch / Greyfen March / Mourning Hollows / Beacon of Thorns; Thornbound Sentinel | Lost settlements coincide with beacons; dates do not establish complete cause |
| III — The First Fire / history and faith | II region helped, any valid decision outcome | Gather fragmented records → contradictory gift/instrument accounts → explore archive and temple → acquire route to original sanctuary; next two candidates | Sablewood Expanse / Veyl Crossing / Glassward Caves / Sunken Archive / Temple of First Vow; Votive Colossus | Organisms beyond flame with plausible alternative; faith still reasonably credible |
| IV — Psalms of Ash / rebellion and deception | III destination learned | Investigate Covenant divisions → rescue innocents → stop escaped summon → confront Vaska's incomplete warning → choose to continue pilgrimage; Mora candidate or counterpart | Ashen Frontier / Blackmere Refuge / Hollow Descent / Cathedral of Unspoken Names / Underwake; Weeping Host | Ancient Covenant/keeper seal relationship, no complete proof or safe extinction plan |
| V — Flame Ascendant / sacrifice and apparent triumph | IV confrontation; sanctuary route and required relics reachable on every branch | Unite accumulated abilities → pilgrimage trials → multi-phase apparent final boss → rekindle First Fire → sincere worldwide celebration; Branna candidate or counterpart | Pilgrim's Spine / Last Hearth / Embervault / Crownheart Citadel / Heart of Embers; Hollow Sovereign | Brief mechanical sound, seals/chains, pain, odd symbol, distant silence; purpose withheld |
| VI — The Hollow Dawn / consequence and resistance | V rekindling, time passage | Selective recovery and disappearances → return to changed places → Orrin investigation → sealed foundations → extraction truth → dependent settlements dilemma → interrupt renewed control → unstable system and protagonist disappearance | Veinways / Silent Dominion / Chamber of Tithes / Throne Beneath Fire; Eternal Warden | Full Engine relationship exposed through accumulated evidence; fate and remaining Keepers unresolved |

## Chapter I event dependencies

`src/chapter.js` centralizes Chapter I state and objectives. Existing road flags are reused rather than duplicating them.

| Event | Required state | Committed consequence |
| --- | --- | --- |
| Name / class | Intro completed or skipped | Class becomes immutable; inventory initialized; chapter I begins |
| Accept investigation | Caretaker final dialogue | `flags.quest`, `flags.caretaker`; courtyard Wayflame discovered |
| Raise gate | Mechanism final interaction | `flags.gate`; physical road opens |
| Inspect ward | Gate open and nearby ward | `flags.ward`; caretaker gains resolve conversation |
| Choose resolve | Ward discovered; explicit final response | `committed`, `resolve`, `flags.reported`; all three choices converge, wording retained |
| Camp observation | Reach the wood camp | `camp`, sourced Covenant discovery; optional clue never locks the route |
| Shrine mechanisms | Interact in ROOT → WARD → EMBER order | Persistent prefix, solved state; wrong input resets without cost |
| Mirror | Pilgrim cache final choice | Owned relic and universal Read Sigil; never class-locked |
| Open passage | Puzzle solved and mirror acquired | `sealOpened`; northern passage becomes traversable |
| Ritual confrontation | Inner sanctuary entry / ritualist dialogue | `ritualSeen`; guardian encounter becomes active |
| Warden victory | Valid triggered encounter and combat victory | Cleared spawn, shared experience, pendant; no duplicate reward |
| Shelter local ember | Guardian defeated, brazier final choice | `lightRestored`, warm settlement reactions, return objective, sanctuary Wayflame |
| Return to caretaker | Local light restored | `completed`; chapter ending, persisted `endingSeen` after acknowledgement |

Exploration may precede the recommended objective. Conclusions must never claim progress not actually earned. The final commitment is required before completion; optional conversations, house visits, gear, camp evidence, and class discoveries enrich the journey without blocking the critical path.

## Controlled branching

Chapter I's three resolve choices express why the player acts. All converge on the same shrine route; the selected wording persists for later callbacks. Class selection changes the resident background, combat, field interactions, and matching counterpart dialogue. It never hides the mirror, route, lore, or completion.

Chapter II decisions should persist a named outcome, affected population, regional conditions, NPC relationships, and costs. Every outcome provides a route to III. Companion trust and personal quests may influence V's pilgrimage details or VI's reactions, but never remove required relic access or the rekindling event.

Optional rewards need fallbacks for mandatory exploration checks. The protagonist's chosen class counts as the matching exploration capability. Selected-class counterparts provide essential narrative information without becoming duplicate party members. A character's survival branch requires another credible source for essential information.

## Authoring verification before future content

For each chapter, exercise seven starting-class routes, recruited versus counterpart scenes, side-quest omissions, each major decision outcome, and save/reload at important dialogue and battle states. Assert essential milestones remain reachable, unique rewards cannot repeat, NPC responses use explicit facts, and discovered lore never exceeds its reveal chapter. Chapter V rekindling remains possible across all coherent branches. Chapter VI revelation must explain earlier evidence without contradicting it.
