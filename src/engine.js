export const CLASSES = [
  { id: 'knight', name: 'Knight', title: 'The oathkeeper', role: 'Vanguard', hp: 125, mp: 24, attack: 19, speed: 3, skill: 'Shield bash', cost: 6, description: 'Strike for 26 damage and weaken the next enemy attack.', color: '#91acaf', icon: 'shield' },
  { id: 'warrior', name: 'Warrior', title: 'The bloodbound', role: 'Brute', hp: 115, mp: 24, attack: 24, speed: 4, skill: 'Rending axe', cost: 7, description: 'A brutal strike for 39 damage.', color: '#bf7366', icon: 'axe' },
  { id: 'paladin', name: 'Paladin', title: 'The last light', role: 'Guardian', hp: 110, mp: 30, attack: 16, speed: 2, skill: 'Sacred light', cost: 8, description: 'Restore 35 health to the most wounded living ally.', color: '#d1b777', icon: 'sun' },
  { id: 'sorcerer', name: 'Sorcerer', title: 'The veilwalker', role: 'Arcanist', hp: 80, mp: 36, attack: 17, speed: 6, skill: 'Soulfire', cost: 9, description: 'Deal 35 arcane damage. Burns for 8 each round, for 2 rounds.', color: '#68bcc0', icon: 'spark' },
  { id: 'witch', name: 'Witch', title: 'The hexweaver', role: 'Occultist', hp: 85, mp: 32, attack: 17, speed: 5, skill: 'Siphon soul', cost: 8, description: 'Deal 27 damage and restore 20 health to yourself.', color: '#b383af', icon: 'moon' },
  { id: 'gunslinger', name: 'Gunslinger', title: 'The deadeye', role: 'Sharpshooter', hp: 90, mp: 28, attack: 22, speed: 7, skill: 'Deadeye shot', cost: 8, description: 'A precise shot for 38 damage.', color: '#c69c75', icon: 'crosshair' },
  { id: 'monk', name: 'Monk', title: 'The unbroken', role: 'Disciple', hp: 105, mp: 30, attack: 20, speed: 5, skill: 'Inner balance', cost: 8, description: 'Deal 20 damage and restore 14 health to every living ally.', color: '#8fb09d', icon: 'lotus' },
];

export const ENCOUNTERS = [
  { name: 'The Weeping Cavern', enemy: 'The Watchful Eye', title: 'Keeper of the first gate', hp: 195, attack: 21, reward: 75, description: 'Something ancient stirs beneath the roots. It has already seen you.', intent: 'Gazing strike', flavor: 'Beyond the light, the stone begins to breathe.' },
  { name: 'The Crimson Crossing', enemy: 'The Rootbound Horror', title: 'The hunger below', hp: 265, attack: 25, reward: 120, description: 'The roots tighten. Every step takes you closer to the heart.', intent: 'Crimson lash', flavor: 'The earth remembers every soul it has swallowed.' },
  { name: 'Heart of the Hollow', enemy: 'The Hollow Mother', title: 'The last thing in the dark', hp: 350, attack: 29, reward: 200, description: 'The source of the corruption opens its eye. End this nightmare.', intent: 'Hollow pulse', flavor: 'You stand where even the old gods feared to tread.' },
];

export function createGame(ids = ['knight', 'sorcerer', 'paladin']) {
  if (ids.length !== 3 || new Set(ids).size !== 3 || ids.some(id => !CLASSES.some(c => c.id === id))) throw new Error('Choose three unique heroes.');
  return { version: 1, status: 'preparing', depth: 0, round: 1, gold: 0, potions: 3, party: ids.map(id => { const c = CLASSES.find(c => c.id === id); return { id, hp: c.hp, mp: c.mp, guard: false }; }), enemy: null, queue: [], cursor: 0, log: [{ text: 'Your party gathers at the edge of the Hollow.', type: 'story' }] };
}

export function actor(state) { return state.status === 'battle' ? state.party[state.queue[state.cursor]] : null; }
export function log(state, text, type = 'normal') { state.log.push({ text, type }); if (state.log.length > 60) state.log.shift(); }
export function startEncounter(state) {
  if (!['preparing', 'victory'].includes(state.status) || state.depth >= ENCOUNTERS.length) return false;
  const encounter = ENCOUNTERS[state.depth];
  state.enemy = { hp: encounter.hp, maxHp: encounter.hp, burn: 0, weak: false };
  state.status = 'battle'; state.round = 1; state.cursor = 0;
  state.party.forEach(p => { p.guard = false; });
  state.queue = state.party.map((p, i) => i).filter(i => state.party[i].hp > 0).sort((a, b) => CLASSES.find(c => c.id === state.party[b].id).speed - CLASSES.find(c => c.id === state.party[a].id).speed);
  log(state, `${encounter.enemy} awakens. Your party acts first.`, 'story');
  return true;
}
function win(state) {
  state.gold += ENCOUNTERS[state.depth].reward;
  log(state, `${ENCOUNTERS[state.depth].enemy} falls. +${ENCOUNTERS[state.depth].reward} gold.`, 'heal');
  state.status = state.depth === ENCOUNTERS.length - 1 ? 'complete' : 'victory';
}
export function act(state, action, rng = Math.random) {
  const hero = actor(state); if (!hero || hero.hp <= 0) return { ok: false, reason: 'It is not your turn.' };
  const cls = CLASSES.find(c => c.id === hero.id);
  if (!['attack', 'skill', 'guard', 'potion'].includes(action)) return { ok: false, reason: 'Unknown action.' };
  if (action === 'skill' && hero.mp < cls.cost) return { ok: false, reason: 'Not enough focus.' };
  if (action === 'potion' && (state.potions <= 0 || hero.hp === cls.hp)) return { ok: false, reason: state.potions <= 0 ? 'No potions left.' : 'Health is already full.' };
  let damage = 0; hero.guard = false;
  if (action === 'attack') { damage = cls.attack + Math.floor(rng() * 5); log(state, `${cls.name} attacks for ${damage} damage.`, 'damage'); }
  if (action === 'guard') { hero.guard = true; hero.mp = Math.min(cls.mp, hero.mp + 5); log(state, `${cls.name} braces. Incoming damage reduced by 65%; +5 focus.`, 'normal'); }
  if (action === 'potion') { state.potions--; const healed = Math.min(45, cls.hp - hero.hp); hero.hp += healed; log(state, `${cls.name} drinks a potion. +${healed} health.`, 'heal'); }
  if (action === 'skill') {
    hero.mp -= cls.cost;
    switch (hero.id) {
      case 'knight': damage = 26; state.enemy.weak = true; break;
      case 'warrior': damage = 39; break;
      case 'paladin': {
        const target = state.party.filter(p => p.hp > 0).sort((a, b) => a.hp / CLASSES.find(c => c.id === a.id).hp - b.hp / CLASSES.find(c => c.id === b.id).hp)[0];
        const max = CLASSES.find(c => c.id === target.id).hp; const healed = Math.min(35, max - target.hp); target.hp += healed;
        log(state, `Sacred light restores ${healed} health to ${CLASSES.find(c => c.id === target.id).name}.`, 'heal'); break;
      }
      case 'sorcerer': damage = 35; state.enemy.burn = 2; break;
      case 'witch': damage = 27; hero.hp = Math.min(cls.hp, hero.hp + 20); break;
      case 'gunslinger': damage = 38; break;
      case 'monk': damage = 20; state.party.filter(p => p.hp > 0).forEach(p => { p.hp = Math.min(CLASSES.find(c => c.id === p.id).hp, p.hp + 14); }); break;
    }
    if (damage) log(state, `${cls.name} uses ${cls.skill}. ${damage} damage${hero.id === 'sorcerer' ? ' + burning' : hero.id === 'witch' ? ' + self-healing' : hero.id === 'monk' ? ' + party healing' : ''}.`, 'damage');
  }
  state.enemy.hp = Math.max(0, state.enemy.hp - damage);
  if (state.enemy.hp === 0) { win(state); return { ok: true, damage }; }
  state.cursor++;
  if (state.cursor >= state.queue.length) {
    if (state.enemy.burn > 0) { state.enemy.hp = Math.max(0, state.enemy.hp - 8); state.enemy.burn--; log(state, 'Soulfire burns for 8 damage.', 'damage'); }
    if (!state.enemy.hp) { win(state); return { ok: true, damage }; }
    const living = state.party.filter(p => p.hp > 0);
    const sweep = state.round % 3 === 0;
    const targets = sweep ? living : [living[Math.min(living.length - 1, Math.floor(rng() * living.length))]];
    for (const target of targets) {
      const hit = Math.max(1, Math.round((ENCOUNTERS[state.depth].attack + Math.floor(rng() * 5)) * (state.enemy.weak ? .65 : 1) * (target.guard ? .35 : 1) * (sweep ? .8 : 1)));
      target.hp = Math.max(0, target.hp - hit);
      log(state, `${sweep ? 'The cavern trembles' : ENCOUNTERS[state.depth].intent}: ${CLASSES.find(c => c.id === target.id).name} takes ${hit} damage.${target.hp === 0 ? ' Fallen.' : ''}`, 'enemy');
    }
    state.enemy.weak = false;
    if (state.party.every(p => p.hp <= 0)) { state.status = 'defeat'; log(state, 'Your light fades. The Hollow claims another party.', 'enemy'); return { ok: true, damage }; }
    state.round++; state.cursor = 0;
    state.queue = state.queue.filter(i => state.party[i].hp > 0);
    state.party.forEach(p => { p.guard = false; if (p.hp > 0) p.mp = Math.min(CLASSES.find(c => c.id === p.id).mp, p.mp + 2); });
  }
  return { ok: true, damage };
}
export function descend(state) {
  if (state.status !== 'victory') return false;
  state.depth++;
  state.party.forEach(p => { const c = CLASSES.find(c => c.id === p.id); p.hp = Math.min(c.hp, Math.max(p.hp, Math.ceil(c.hp * .3)) + 25); p.mp = c.mp; });
  state.potions++; log(state, 'A quiet refuge. Each hero recovers health and focus. +1 potion.', 'heal');
  return startEncounter(state);
}
export function validSave(s) {
  if (!s || s.version !== 1 || !['preparing','battle','victory','complete','defeat'].includes(s.status) || !Number.isInteger(s.depth) || s.depth < 0 || s.depth > 2 || !Number.isInteger(s.round) || s.round < 1 || !Number.isInteger(s.gold) || s.gold < 0 || !Number.isInteger(s.potions) || s.potions < 0) return false;
  if (!Array.isArray(s.party) || s.party.length !== 3 || new Set(s.party.map(p => p.id)).size !== 3 || !s.party.every(p => { const c = CLASSES.find(c => c.id === p.id); return c && Number.isFinite(p.hp) && p.hp >= 0 && p.hp <= c.hp && Number.isFinite(p.mp) && p.mp >= 0 && p.mp <= c.mp && typeof p.guard === 'boolean'; })) return false;
  if (!Array.isArray(s.log) || !s.log.every(l => typeof l.text === 'string' && typeof l.type === 'string') || !Array.isArray(s.queue) || new Set(s.queue).size !== s.queue.length || !s.queue.every(i => Number.isInteger(i) && i >= 0 && i <= 2) || !Number.isInteger(s.cursor) || s.cursor < 0) return false;
  if (s.status !== 'preparing' && (!s.enemy || !Number.isFinite(s.enemy.hp) || s.enemy.hp < 0 || s.enemy.maxHp !== ENCOUNTERS[s.depth].hp || s.enemy.hp > s.enemy.maxHp || !Number.isInteger(s.enemy.burn) || s.enemy.burn < 0 || s.enemy.burn > 2 || typeof s.enemy.weak !== 'boolean')) return false;
  if (s.status === 'battle' && (!s.enemy.hp || s.cursor >= s.queue.length || s.queue.some(i => s.party[i].hp <= 0))) return false;
  return true;
}
