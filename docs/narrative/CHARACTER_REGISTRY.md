# Character registry and identity reconciliation

This document contains developer-only future story planning. Existing visual sheets and named identities remain canonical. Recruitment chapters below are a planned schedule, not implemented future content. Selected-class counterparts stay in the world as non-playable characters; never remove essential knowledge or story events on their route.

## Established seven

| Identity / class | Planned recruitment | Appearance / personality | Personal history, goal, and quest foundation | Relationships / knowledge boundary |
| --- | --- | --- | --- | --- |
| Ser Aldren — Knight | II | Existing armored blue-cloaked shield knight; reserved, patient, protective | Former ward-road knight stayed after his garrison abandoned displaced families. Duty versus choosing which people to protect. | Courtyard caretaker and refugees; sincere oath, local road history, no secret Engine knowledge. Counterpart keeps local defenses. |
| Ilyra — Paladin | II | Existing gold armor, pale cloak, hammer and shield; gentle, resolute, questioning | A sanctuary's remaining medicines now travel with her. Faith tested by the cost of preserving wards. | Sister Oryn and injured civilians; knows practiced rites, not their hidden source. Counterpart heals settlements and supplies essential ritual advice. |
| Cass Vey — Gunslinger | III | Existing brown coat, dark hat, red scarf and pistol; practical, sardonic, observant | Courier tracking a missing food-and-letter caravan. Deliveries become commitments to abandoned communities. | Road traveler, Harker, neglected routes; firsthand travel records, no omniscient history. Counterpart maintains courier network. |
| Tarin — Monk | III | Existing bare-armed, teal beads and red sash monk; compassionate, observant, stubborn | Searches for monastery pilgrims who never returned. Listening becomes a means to challenge inherited explanations. | Lost pilgrims and healers; studies rhythms and living environments. Counterpart offers monastery observations and shelter. |
| Mora — Witch | IV | Existing red/black robe, pointed hat and ritual staff; wry, guarded, loyal | Learned old root names from her grandmother; resists the Covenant's cruel commands. Her conflict tests liberation against inflicted harm. | Older woodland traditions and Covenant encounters; knows forbidden practices and abuses, not the complete Engine. Counterpart retains essential Covenant information. |
| Branna — Warrior | V | Existing fur mantle, heavy axe, red torn cloth; blunt, warm, impatient with cruelty | Carried three neighbors from a root-choked village; searches until missing people are accounted for. Strength and responsibility on the final pilgrimage. | Hill survivors, Aldren's displaced families; local catastrophe and practical terrain knowledge. Counterpart remains a survivor advocate. |
| Orrin — Sorcerer | VI | Existing hooded dark cloak and blue-flame staff; curious, dry humor, scholarly | Mapped old ward links and records their silence. Prior journals seed his later role interpreting sealed structures. Must confront what was left unpublished. | Independent archivists and ward records; incomplete observations earlier, earned discovery in VI. Counterpart provides indispensable historical access. |

All biographies and exploration abilities originate in `src/companions.js`. Extend rather than replace them. Every unchosen class ultimately has one corresponding recruit; no same-class duplicate is added. The protagonist remains named by the player and has their own ordinary-resident background.

## Provisional proposal reconciliation

| Proposed alternative | Retained identity fulfilling its narrative function | Adaptation |
| --- | --- | --- |
| Mara Voss / Warden | Aldren / Knight | Refugee protector and defense; retain shield armor and Oathbrace |
| Ilyra Sen / Emberwright | Ilyra / Paladin | Faith and local sacred warmth; retain healer/support combat and Kindle |
| Renn Vale / Wayfarer | Cass / Gunslinger | Forgotten roads and practical travel; retain courier story and Ricochet |
| Celyn Ardis / Luminant | Tarin / Monk | Healing, exploration, overlooked communities; retain monk design and Stillwater |
| Veyra Nox / Veilbinder | Mora / Witch | Forbidden magic and morally divided Covenant; retain Whisperroot |
| Tovan Krell / Oathblade | Branna / Warrior | Pilgrimage strength and protective conviction; preserve civilian rescue history, do not invent veteran knight service |
| Eron Thale / Scriptor | Orrin / Sorcerer | Sealed knowledge and historical investigation; seed notebooks earlier, retain Veil Sight |

The mappings preserve seven classes while adapting story functions. They do not rename equipment or convert existing weapon sheets to mismatched classes. Eron can remain a referenced independent scholar if later approved, but is not an eighth recruit or replacement protagonist counterpart.

## Recurring NPCs

| Character | Biography and relationships | Appearances / progression | Knowledge limits |
| --- | --- | --- | --- |
| Courtyard caretaker (established) | Tends the shared fire and knows the protagonist as a neighbor. Local emotional anchor. | I: investigation request, commitment conversation, return celebration. Later returns respond to local outcomes. | Knows old wards once answered; does not know why they fail. Elder Maelin is a provisional identity pending explicit reconciliation, not a silent rename. |
| Road traveler (established) | Carries a letter to a sister in a possibly abandoned village. | I: barred road, thanks after gate. Later missing-family quest can continue. | Personal travel losses; no controlled-history revelations. |
| Sister Oryn | Compassionate Synod priestess shares remaining medicine. Knows Ilyra's healing work. | I: credible public teaching and changed hope after warmth. Later faith-versus-institution arc. | Religious practice and local suffering; learns institutional corruption through evidence, not foreknowledge. |
| Harker | Traveling merchant, repairs useful things, postpones debts until harvest. | I: supply house, functional equipment/potion shop. Future regions: relic restoration, regional rumors, ordinary world reactions. | Reports what he witnessed or heard with source; no secret system certainty. |
| Tavi and their mother | Young courtyard resident asks whether summer returns; family counts firewood. | I: fragile everyday hope and warm-stone reaction. Recurring emotional measure of the hero's actions. | No adult political or hidden-history exposition. |
| High Regent Serath (future) | Public authority gives legitimacy, access, supplies; personal interest in rekindling. | II onward as approved; not an obvious early villain. | Knows more than disclosed; player sees only warranted evidence. |
| Mother Vaska (future) | Uncompromising Covenant revolutionary; consistent opposition and responsibility for followers' harm. | IV ideological confrontation, later reassessment. | Partial suppressed history; cannot conclusively demonstrate safe extinction early. |
| Archivist Calia Renn (future) | Preserves neglected or dangerous physical records. | III research and maps; later contradictions and investigation. | Incomplete scholarly interpretation, explicit provenance. |
| Elder Maelin (provisional) | Starting elder remembers stronger sacred light and inherited sayings. | Can be reconciled with the established caretaker only with approval. | Contradictions are inherited and misunderstood, not knowingly spoiled. |
| Luma (I) | A small road fairy carrying a warm ember; patient and practical. Optional visual guide, never a recruit or combatant. | I: points to the active discovered objective and navigable road; guidance can be hidden. | Knows local roads and the protagonist’s recorded objectives. Offers no hidden history, prophecy, or undiscovered puzzle solution. |
| Covenant ritualist (I) | An unnamed extremist attempting to break the local sanctuary seal. | I confrontation activates guardian; no faction-wide moral verdict. | Destructive methods and limited ideology; never delivers the hidden truth. |

## Party and narrative invariants

The protagonist is always active and retains their selected class. Maximum four active members; recruits above the cap are reserves. Shared experience progresses reserves; equipment and relic ownership are individual and unique. Exploration checks consult the overall recruited roster. Formation can change between encounters, not mid-round.

New Chapter I journeys meet Aldren, Branna, and Ilyra as local people who have reasons to stay. They include the selected-class counterpart and do not automatically recruit anyone. Existing older adventures retain their already recruited roster and established scenes; never delete companions to enforce new pacing retroactively.

Future story scenes must resolve an identity to one of: protagonist, recruited member, unchosen but not yet recruited candidate, or selected-class non-playable counterpart. Essential information is delivered on every route. Personal quests can change trust, rewards, and optional dialogue; essential chapter milestones must remain reachable.
