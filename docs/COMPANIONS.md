# Companion recruitment and party system

This is a core gameplay feature approved by the player's Section 16 specification. It replaces the previous single-playable-character restriction for the adventure. The separate combat prototype remains a solo campaign.

## Class choice and identity

The introduction fixes the protagonist's class for the journey. Each of the other six established classes has one named companion. The companion matching the protagonist's class never appears as a redundant recruit. No class switching occurs. Original character concepts, lineup artwork, and battle sheets are preserved; directional movement sheets adapt the same armor, clothing, weapons, and colors.

| Class | Companion | Personality and reason to travel | Recruitment event | Exploration ability |
| --- | --- | --- | --- | --- |
| Knight | Ser Aldren | A patient oathkeeper protecting displaced families | Accept the caretaker's quest, then speak in the courtyard | Oathbrace holds an unstable shrine arch while supplies and a letter are recovered |
| Warrior | Branna | Blunt, warm-hearted; searches for survivors of her hill settlement | Raise the approach gate, then speak on its near side | Sunder splits roots sealing a cache of village provisions |
| Paladin | Ilyra | Compassionate, questioning; carries sanctuary medicines between failing wards | Report the silent ward to the caretaker, then speak in the courtyard | Kindle rekindles a small shrine brazier and restores the party |
| Sorcerer | Orrin | Dryly humorous scholar recording the failing ward network | Inspect the approach ward, then find him in the Ashen Wood | Veil Sight reads a hidden inscription about links between wards |
| Witch | Mora | Wry and guarded; refuses to translate the cult's stolen inscriptions | Defeat the sentinel guarding the shrine road to free her | Whisperroot persuades roots to reveal medicines and a cruel ritual command |
| Gunslinger | Cass Vey | A practical courier tracing a missing food-and-letter caravan | Recover the abandoned travel pack, then speak nearby | Ricochet releases a high chain catch and a courier pouch |
| Monk | Tarin | Observant pilgrim searching for a lost monastery delegation | Clear the sentinel's road, then find him inside the shrine | Stillwater reveals a pilgrim token and restores party focus |

Each recruit has authored dialogue, a personal history, motivation, and a connection to the dying world. Recruitment dialogue responds to the protagonist's class. Invitation takes effect only on the last dialogue choice; Escape lets the player leave without recruiting. Unfinished recruitment conversations survive reload. The journal records leads and Party shows backstory, personality, motivation, combat role, and field ability.

The regional discoveries introduce personal quest threads. Extended personal quest arcs, relationship systems, and later character development are future content, not completed features in this chapter.

## Party management and combat

The expandable roster contains the protagonist and recruited companions. Up to four travel and enter battle; the protagonist always occupies the first slot. Early recruits fill open slots automatically, later recruits enter reserve. Party changes are allowed between encounters, including moving companions into and out of reserve. All recruits share experience and gain class-specific stats and stronger abilities; new recruits start at the protagonist's current level.

Each living active member receives a command each round: attack, ability, guard, or shared potion. The enemy responds after the party has acted. Downed members skip commands; allies can revive them with a potion or Paladin healing. Potions restore up to 50 health to the weakest ally. The active roster stays fixed during battle.

Class roles complement one another: Knight weakens the next enemy response, Warrior and Gunslinger deliver strong direct damage, Sorcerer burns across rounds, Witch drains health, Paladin heals the weakest ally while attacking, and Monk heals self and restores allies' focus. Guard restores health and focus and reduces that member's incoming damage by 75%. Living allies recover 3 focus after the enemy response.

Enemy health and attack scale with the active party. The shrine guardian telegraphs Rootquake against every living member, periodically resists basic attacks with a stone carapace, and increases its heavy-attack frequency after losing half its health. Coordinated guards, abilities, recovery and class combinations are useful throughout the encounter.

Victory persists removal of the defeated overworld enemy, grants gold and shared experience, and gives the roster a little recovery. Retreat keeps the enemy alive and grants enough movement grace to withdraw. Whole-party defeat returns the player to the courtyard fire with recovery; the enemy remains available. The fire restores the whole roster and replenishes a minimum of three potions.

## Exploration and persistence

Every recruited class contributes its field ability, including reserves; the protagonist supplies their chosen class's ability. Seven optional class interactions reveal supplies, inscriptions and personal leads. Their rewards are persistent and can be collected once. Field abilities cost no combat focus, and none blocks the main route before a needed companion can be recruited.

The four connected areas are the Ember Courtyard, Ruined Approach, Ashen Wood and Forsaken Shrine. Visible enemies trigger a dedicated battle on contact, or can be challenged using Interact. Four-frame walking and running cycles cover four directions for all seven characters; travelling companions follow the protagonist's path. Shift or the Run toggle increases movement speed. Reduced motion keeps navigation functional with a static directional pose.

Adventure saves use wrapper version 2 and a separate storage key. Existing version-1 exploration saves migrate their name, fixed class, supplies, position, quest flags and conversation into an initially solo roster. The old save remains intact. Saves include recruitment, active/reserve composition, member resources, partial-round commands, field discoveries, enemy clearance and battle return position. The original combat prototype and older party save keys remain separate.
