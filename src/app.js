import { CLASSES, ENCOUNTERS, createGame, actor, startEncounter, act, descend, validSave } from './engine.js';
import { characterMove } from './animations.js';

const paths = {
  sword: '<path d="m14 3 7-1-1 7-11 11-5-5Z"/><path d="m4 13 7 7M3 21l4-4M14 3l6 6"/>',
  shield: '<path d="M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Z"/><path d="M12 6v11M7 11h10"/>',
  spark: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/>',
  flask: '<path d="M9 2h6M10 2v6l-5 9a3 3 0 0 0 3 5h8a3 3 0 0 0 3-5l-5-9V2M8 14h8"/>',
  map: '<path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3ZM9 2v17M15 5v17"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M2 20v-3a7 7 0 0 1 14 0v3M17 4a3 3 0 0 1 0 6M19 14a5 5 0 0 1 3 5"/>',
  book: '<path d="M12 5c-4-3-8-2-10-1v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1ZM12 5v16"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  sound: '<path d="m11 3-6 5H2v8h3l6 5ZM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',
  mute: '<path d="m11 3-6 5H2v8h3l6 5ZM16 9l6 6m0-6-6 6"/>',
  expand: '<path d="M8 2H2v6M16 2h6v6M2 16v6h6M22 16v6h-6"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="m12 6 4 6-4 6-4-6Z"/>',
  fire: '<path d="M12 2c1 7 6 6 6 12a6 6 0 0 1-12 0c0-3 2-6 4-7 0 4 2 4 2 4s2-4 0-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
  crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 1v6m0 10v6M1 12h6m10 0h6"/>',
  axe: '<path d="m5 22 12-18M11 4c4-2 8-1 11 3l-5 6c-2-3-5-4-8-3Z"/>',
  lotus: '<path d="M12 21C3 20 2 14 2 9c6 0 10 5 10 12 0-7 4-12 10-12 0 5-1 11-10 12ZM12 21C6 14 7 7 12 2c5 5 6 12 0 19Z"/>',
  flag: '<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
  reset: '<path d="M3 9a9 9 0 1 1 0 7M3 2v7h7"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  heart: '<path d="M12 21 3 12a6 6 0 0 1 9-8 6 6 0 0 1 9 8Z"/>',
};
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const roman = ['I', 'II', 'III'];
const key = 'the-hollow-save-v1';
let state = createGame();
try { const saved = JSON.parse(localStorage.getItem(key)); if (validSave(saved)) state = saved; } catch { /* A fresh expedition is safe if local storage is unavailable. */ }
let sound = false, busy = false, panel = 'log', modal = null, selection = [], notice = '', storageWarning = false;
let audio, motion = null;
const app = document.querySelector('#app');
function persist() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageWarning = true; } }
function tone() {
  if (!sound) return;
  try { audio ||= new AudioContext(); audio.resume(); const osc = audio.createOscillator(), gain = audio.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(220, audio.currentTime); osc.frequency.exponentialRampToValueAtTime(75, audio.currentTime + .2); gain.gain.setValueAtTime(.045, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .24); osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + .25); } catch { sound = false; }
}
function sprite(id, className = '') { const index = CLASSES.findIndex(c => c.id === id); const [left,right] = [[20,342],[343,627],[630,931],[934,1198],[1200,1496],[1500,1797],[1801,2073]][index]; return `<div class="sprite ${className}" style="--crop-width:${right-left};--sheet-position:${left/(2073-(right-left))*100}%" role="img" aria-label="${CLASSES[index].name} pixel art"></div>`; }
function hpBar(value, max, type = '') { return `<div class="meter ${type}"><span style="width:${Math.max(0, value / max * 100)}%"></span></div>`; }
function moveEffects(heroClass) {
  return `<div class="move-effects effect-${motion.effect}" aria-hidden="true"><span class="move-arc"></span><span class="move-ring"></span><span class="move-ring second"></span><span class="move-sigil">${icon(motion.action === 'guard' ? 'shield' : heroClass.icon, 100)}</span><span class="move-flash"></span><span class="move-motes">${[0,1,2,3,4].map(n=>`<i style="--particle:${n}"></i>`).join('')}</span></div>`;
}
function render() {
  const encounter = ENCOUNTERS[state.depth], current = actor(state), currentClass = current && CLASSES.find(c => c.id === current.id), playing = state.status === 'battle';
  const enemyHp = state.enemy?.hp ?? encounter.hp;
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="/" aria-label="The Hollow home"><span class="brand-sigil">${icon('spark', 29)}</span><span>THE HOLLOW<small>A TURN-BASED RPG</small></span></a>
      <nav aria-label="Main navigation"><button class="nav-item active" data-action="expedition">${icon('map', 17)}<span>Expedition</span></button><button class="nav-item" data-action="party">${icon('people', 17)}<span>Party</span></button><button class="nav-item" data-action="codex">${icon('book', 17)}<span>Codex</span></button></nav>
      <div class="header-actions"><span class="autosave"><i></i>${storageWarning ? 'Save unavailable' : 'Autosave on'}</span><button class="icon-button" data-action="sound" aria-label="${sound ? 'Mute sound' : 'Enable sound'}" title="${sound ? 'Mute sound' : 'Enable sound'}">${icon(sound ? 'sound' : 'mute', 18)}</button><button class="icon-button fullscreen" data-action="fullscreen" aria-label="Toggle fullscreen" title="Fullscreen">${icon('expand', 17)}</button></div>
    </header>
    <main>
      <section class="page-heading"><div><div class="eyebrow"><span class="tiny-diamond"></span> THE DESCENT <span class="eyebrow-separator">/</span> EXPEDITION 001</div><h1>${encounter.name}<span class="title-dot">.</span></h1><p>${encounter.description}</p></div><div class="depth-badge"><span>DEPTH</span><strong>${roman[state.depth]} <em>/ III</em></strong><div class="depth-dots">${roman.map((r,i) => `<i class="${i <= state.depth ? 'filled' : ''}"></i>`).join('')}</div></div></section>
      <div class="game-layout">
        <section class="battle-column" aria-label="Battlefield">
          <div class="arena depth-${state.depth} ${state.status === 'complete' ? 'cleansed' : ''}" data-resolving="${busy}" data-phase="${motion ? 'hero' : 'idle'}">
            <div class="arena-shade"></div>
            <div class="arena-top"><span class="location-label">${icon('map', 14)} THE HOLLOW <span>/</span> FLOOR 0${state.depth + 1}</span><span class="encounter-label"><i></i>${playing ? 'IN COMBAT' : state.status === 'preparing' ? 'UNEXPLORED' : state.status === 'defeat' ? 'PARTY FALLEN' : 'AREA CLEARED'}</span></div>
            <div class="enemy-hud"><div class="enemy-heading"><span class="enemy-icon">${icon('crosshair', 17)}</span><div><strong>${encounter.enemy}</strong><small>${encounter.title}</small></div><span class="level-badge">LV. ${state.depth + 3}</span></div>${hpBar(enemyHp, encounter.hp, 'enemy-meter')}<div class="enemy-numbers"><span>${state.enemy?.burn ? `${icon('fire', 12)} BURNING · ${state.enemy.burn} TURNS` : 'ELITE CREATURE'}</span><span>${enemyHp} <em>/ ${encounter.hp}</em></span></div></div>
            <div class="stage-party">${state.party.map((p,i) => { const c = CLASSES.find(c => c.id === p.id), moving = motion?.heroId === p.id; return `<div class="stage-hero ${p.hp <= 0 ? 'fallen' : ''} ${current?.id === p.id ? 'stage-active' : ''} ${p.guard ? 'guarding' : ''} ${moving ? 'performing' : ''}" data-hero="${p.id}" data-move="${moving ? motion.action : 'idle'}" style="--slot:${i};--fx-color:${moving ? motion.color : c.color};${moving ? `--move-name:${motion.name};--move-duration:${motion.duration}ms` : ''}">${sprite(p.id)}<span class="hero-shadow"></span><span class="guard-ward" aria-hidden="true">${icon('shield',100)}</span>${moving ? moveEffects(c) : ''}<div class="stage-name">${current?.id === p.id ? '<i></i>' : ''}${moving ? motion.label : c.name}${p.guard ? icon('shield',12) : ''}</div></div>`; }).join('')}</div>
            ${!playing ? `<div class="arena-message ${state.status === 'preparing' ? 'intro-message' : ''}"><span>${state.status === 'preparing' ? 'YOUR STORY BEGINS BELOW' : state.status === 'defeat' ? 'THE LIGHT HAS FADED' : state.status === 'complete' ? 'THE HOLLOW IS SILENT' : 'A MOMENT OF RESPITE'}</span><h2>${state.status === 'preparing' ? 'Into the unknown.' : state.status === 'defeat' ? 'Darkness prevails.' : state.status === 'complete' ? 'Dawn will come again.' : 'The way opens.'}</h2><button class="primary-button" data-action="${state.status === 'preparing' ? 'begin' : state.status === 'victory' ? 'descend' : 'restart'}">${state.status === 'preparing' ? 'Begin encounter' : state.status === 'victory' ? 'Descend deeper' : 'New expedition'}${icon('arrow',17)}</button></div>` : ''}
            <div class="arena-bottom"><span>${icon('fire',14)} ${playing ? `ROUND ${String(state.round).padStart(2,'0')}` : 'THE TORCHES ARE LIT'}</span><span>${playing ? `${currentClass.name}'s turn` : encounter.flavor}</span><span class="arena-corner">${icon('expand',14)}</span></div>
          </div>
          <div class="turn-strip"><span class="eyebrow">TURN ORDER</span><div class="turn-tokens">${(state.queue.length ? state.queue : [1,0,2]).filter(i => state.party[i].hp > 0).map((i,position) => `<span class="turn-token ${playing && position === state.cursor ? 'current' : ''} ${playing && position < state.cursor ? 'used' : ''}">${icon(CLASSES.find(c => c.id === state.party[i].id).icon,15)}${CLASSES.find(c => c.id === state.party[i].id).name}${position < state.cursor && playing ? icon('check',12) : ''}</span>`).join('')}<span class="turn-arrow">${icon('chevron',14)}</span><span class="turn-token enemy-token">${icon('crosshair',15)}The Eye</span></div><span class="round-number">${playing ? `Round ${state.round}` : 'Party acts first'}</span></div>
          <div class="party-section-heading"><h3>Your party <span>03 / 03</span></h3><button class="text-button" data-action="party">${state.status === 'preparing' ? 'Manage party' : 'View party'}${icon('people',15)}</button></div>
          <div class="party-cards">${state.party.map(p => { const c = CLASSES.find(c => c.id === p.id); return `<article class="hero-card ${current?.id === p.id ? 'selected' : ''} ${p.hp <= 0 ? 'dead' : ''}" style="--class-color:${c.color}"><div class="hero-portrait">${sprite(p.id)}</div><div class="hero-details"><div class="hero-card-heading"><h3>${c.name}</h3><span>${current?.id === p.id ? 'YOUR TURN' : p.hp <= 0 ? 'FALLEN' : c.role.toUpperCase()}</span></div><div class="stat-row"><span>${icon('heart',11)} HP</span><b>${p.hp}<em> / ${c.hp}</em></b></div>${hpBar(p.hp,c.hp)}<div class="stat-row focus-stat"><span>${icon('spark',11)} FOCUS</span><b>${p.mp}<em> / ${c.mp}</em></b></div>${hpBar(p.mp,c.mp,'focus-meter')}</div></article>`; }).join('')}</div>
        </section>
        <aside class="side-column">
          <section class="quest-card"><div class="eyebrow">${icon('flag',14)} CURRENT OBJECTIVE</div><h2>${state.status === 'complete' ? 'A light in the dark' : 'Silence the watcher'}</h2><p>${state.status === 'complete' ? 'The corruption has ended. Your party has survived the Hollow.' : 'Defeat the guardian and find a way deeper into the Hollow.'}</p><div class="quest-footer"><span>${icon('coin',15)} ${state.status === 'complete' ? state.gold : encounter.reward} gold</span><span>${state.status === 'complete' ? 'COMPLETED' : 'MAIN QUEST'}</span></div></section>
          <section class="journal"><div class="journal-tabs"><button data-action="log" class="${panel === 'log' ? 'active' : ''}">Battle log</button><button data-action="journey" class="${panel === 'journey' ? 'active' : ''}">Journey</button><span class="journal-dot"></span></div><div class="journal-content" aria-live="polite" aria-label="${panel === 'log' ? 'Battle log' : 'Journey'}">${panel === 'log' ? state.log.slice(-7).map((l,i,arr) => `<div class="log-entry ${esc(l.type)} ${i === arr.length-1 ? 'latest' : ''}"><span class="log-marker">${l.type === 'damage' ? icon('sword',12) : l.type === 'heal' ? icon('spark',12) : l.type === 'enemy' ? icon('crosshair',12) : '<i></i>'}</span><p>${esc(l.text)}</p></div>`).join('') : ENCOUNTERS.map((e,i) => `<div class="journey-stop ${i === state.depth ? 'here' : ''}"><span>${i < state.depth || state.status === 'complete' ? icon('check',15) : roman[i]}</span><div><strong>${e.name}</strong><small>${i < state.depth || state.status === 'complete' ? 'Cleared' : i === state.depth ? 'Current location' : 'Unexplored'}</small></div></div>`).join('')}</div><div class="journal-bottom">${icon('book',13)} Every descent leaves a story.</div></section>
          <section class="supplies"><span>EXPEDITION SUPPLIES</span><div><span>${icon('flask',18)}<b>${state.potions}</b><small>Potions</small></span><span>${icon('coin',18)}<b>${state.gold}</b><small>Gold</small></span><span>${icon('people',18)}<b>${state.party.filter(p => p.hp > 0).length}<em>/3</em></b><small>Alive</small></span></div></section>
        </aside>
      </div>
      <section class="command-bar" aria-label="Combat actions"><div class="command-context"><span class="command-symbol">${icon(currentClass?.icon || 'sword',26)}</span><div><span class="eyebrow">${playing ? 'MAKE YOUR MOVE' : 'PREPARE FOR THE DESCENT'}</span><h3>${playing ? `${currentClass.name}'s turn` : state.status === 'preparing' ? 'Your party is ready' : state.status === 'victory' ? 'Take a breath. Then go deeper.' : state.status === 'complete' ? 'The Hollow remembers your names.' : 'Gather your courage again.'}</h3></div></div><div class="commands">${[
        ['attack','sword','Attack','Basic strike',true],
        ['skill',currentClass?.icon || 'spark',currentClass?.skill || 'Ability',playing ? `${currentClass.cost} focus` : 'Class ability',!playing || current.mp >= currentClass.cost],
        ['guard','shield','Guard','+5 focus · less damage',true],
        ['potion','flask','Potion',`${state.potions} remaining`,playing && state.potions > 0 && current.hp < currentClass.hp],
      ].map(([action,ic,label,sub,available],i) => `<button class="command ${action === 'attack' ? 'attack-command' : ''}" data-action="${action}" ${!playing || busy || !available ? 'disabled' : ''} title="${action === 'skill' && currentClass ? currentClass.description : label}"><span class="keycap">${i+1}</span>${icon(ic,22)}<span><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}</div></section>
      <footer class="page-footer"><span><i></i>${notice || 'Choose carefully. The dark is patient.'}</span><span>1–4 to act <b>·</b> ${sound ? 'Sound on' : 'Sound off'} <b>·</b> <button data-action="restart">New expedition</button></span></footer>
    </main>
    <dialog id="game-dialog" aria-labelledby="dialog-title"></dialog>`;
  if (modal) renderModal();
}
function renderModal() {
  const dialog = document.querySelector('#game-dialog');
  let content;
  if (modal === 'party') {
    const editing = state.status === 'preparing';
    content = `<div class="eyebrow">SEVEN SOULS. ONE DESCENT.</div><h2 id="dialog-title">Gather your party<span>.</span></h2><p>${editing ? 'Choose three heroes. A balanced party is a light in the dark.' : 'Your formation is locked for this expedition. Start a new run to change heroes.'}</p><div class="class-grid">${CLASSES.map(c => `<button data-action="choose" data-class="${c.id}" class="class-choice ${selection.includes(c.id) ? 'chosen' : ''}" ${!editing ? 'disabled' : ''} aria-pressed="${selection.includes(c.id)}"><span class="selection-mark">${selection.includes(c.id) ? icon('check',13) : '+'}</span>${sprite(c.id)}<h3>${c.name}</h3><span>${c.role}</span><small>${c.hp} HP <i>·</i> ${c.mp} focus</small></button>`).join('')}</div><div class="party-help">${selection.map(id => {const c=CLASSES.find(c=>c.id===id);return `<p><b>${c.skill}</b> ${c.description}</p>`;}).join('')}</div><div class="modal-footer"><span>${selection.length} / 3 HEROES SELECTED</span><button class="primary-button" data-action="${editing ? 'save-party' : 'close'}" ${editing && selection.length !== 3 ? 'disabled' : ''}>${editing ? 'Confirm party' : 'Return to expedition'}${icon('arrow',16)}</button></div>`;
  } else if (modal === 'codex') {
    content = `<div class="eyebrow">THE TRAVELER'S COMPANION</div><h2 id="dialog-title">Surviving the Hollow<span>.</span></h2><p>A small guide for the long way down.</p><div class="codex-grid">${[['sword','Every move matters','Your living heroes act in speed order. After all have acted, the enemy attacks. Every third round, its attack hits the entire party.'],['spark','Spend your focus wisely','Each class has a unique ability. Focus recovers by 2 each round; guarding restores an additional 5. Soulfire keeps burning after the cast.'],['shield','Keep the light alive','Guard reduces damage by 65%. Potions restore 45 health to the acting hero. Paladins heal the most wounded living ally. Fallen heroes cannot act.'],['map','Three gates to dawn','Clear three encounters to end the corruption. Between floors, the party recovers health and full focus, fallen allies revive, and you receive a potion.']].map(([ic,title,text])=>`<article>${icon(ic,24)}<h3>${title}</h3><p>${text}</p></article>`).join('')}</div><div class="modal-footer"><span>KEYBOARD: 1 ATTACK · 2 ABILITY · 3 GUARD · 4 POTION</span><button class="primary-button" data-action="close">Return${icon('arrow',16)}</button></div>`;
  } else {
    content = `<div class="eyebrow">A NEW BEGINNING</div><h2 id="dialog-title">Return to the surface?</h2><p>Your current expedition will be replaced. Choose a new party and descend again.</p><div class="modal-footer"><button class="secondary-button" data-action="close">Keep exploring</button><button class="primary-button" data-action="confirm-restart">New expedition${icon('reset',16)}</button></div>`;
  }
  dialog.innerHTML = `<button class="modal-close" data-action="close" aria-label="Close dialog">×</button>${content}`;
  dialog.showModal();
  dialog.addEventListener('cancel', () => { modal = null; });
  dialog.addEventListener('click', e => { if(e.target === dialog) closeModal(); });
}
function closeModal() { modal = null; document.querySelector('#game-dialog')?.close(); }
function openModal(type) { modal = type; selection = state.party.map(p => p.id); renderModal(); }
const animationDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
function floatingNumber(parent, value, healing = false) {
  const number = document.createElement('span');
  number.className = `damage-number${healing ? ' healing-number' : ''}`;
  number.setAttribute('aria-hidden', 'true'); number.textContent = `${healing ? '+' : '−'}${value}`;
  parent.append(number);
}
function launchProjectile() {
  const ranged = ['sorcerer', 'witch', 'gunslinger'].includes(motion.heroId);
  if (!ranged || !['attack','skill'].includes(motion.action)) return;
  const arena = app.querySelector('.arena'), hero = app.querySelector(`[data-hero="${motion.heroId}"]`);
  const bounds = arena.getBoundingClientRect(), origin = hero.getBoundingClientRect();
  const x = origin.left - bounds.left + origin.width * .78, y = origin.top - bounds.top + origin.height * .25;
  const projectile = document.createElement('span');
  projectile.className = `move-projectile ${motion.heroId === 'gunslinger' ? 'tracer' : motion.effect === 'siphon-soul' ? 'soul' : ''}`;
  projectile.setAttribute('aria-hidden','true');
  projectile.style.cssText = `left:${x}px;top:${y}px;--fx-color:${motion.color};--move-duration:${motion.duration}ms;--travel-x:${bounds.width*.59-x}px;--travel-y:${bounds.height*.26-y}px`;
  arena.append(projectile);
}
async function performAction(action) {
  // Resolve a copy first so unusable actions never animate or spend a turn.
  const current = actor(state), next = structuredClone(state), previousEvents = new Set(next.log);
  const result = act(next, action);
  if (!result.ok) { notice = result.reason; render(); return; }
  const move = characterMove(current.id, action);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  motion = { ...move, duration: reduced ? 120 : move.duration, heroId: current.id, action };
  busy = true; notice = ''; render(); launchProjectile(); tone();
  try {
    await animationDelay(motion.duration * .55);
    if (result.damage > 0) {
      const hud = app.querySelector('.enemy-hud');
      hud.classList.add('contact'); floatingNumber(hud, result.damage);
      hud.querySelector('.enemy-meter > span').style.width = `${next.enemy.hp / next.enemy.maxHp * 100}%`;
      hud.querySelector('.enemy-numbers > span:last-child').innerHTML = `${next.enemy.hp} <em>/ ${next.enemy.maxHp}</em>`;
    }
    for (const hero of next.party) {
      const previous = state.party.find(p => p.id === hero.id);
      if (hero.hp > previous.hp) {
        const target = app.querySelector(`[data-hero="${hero.id}"]`);
        target.classList.add('receiving-heal'); floatingNumber(target, hero.hp - previous.hp, true);
      }
    }
    await animationDelay(motion.duration * .45);
    const incoming = next.log.filter(entry => entry.type === 'enemy' && !previousEvents.has(entry));
    // Only this action's enemy turn can produce incoming damage.
    if (next.round !== state.round || next.status === 'defeat') {
      const strikes = incoming.map(entry => entry.text.match(/: (\w+) takes (\d+) damage\./)).filter(Boolean);
      if (strikes.length) {
        app.querySelector('.arena').dataset.phase = 'enemy';
        app.querySelector('.performing')?.classList.remove('performing');
        for (const [,name,damage] of strikes.slice(-state.party.filter(p => p.hp > 0).length)) {
          const cls = CLASSES.find(c => c.name === name), target = cls && app.querySelector(`[data-hero="${cls.id}"]`);
          if (target) { target.classList.add('taking-hit'); floatingNumber(target, damage); }
        }
        await animationDelay(reduced ? 80 : 440);
      }
    }
    state = next; persist();
  } finally { busy = false; motion = null; render(); }
}
async function handle(action, element) {
  if (busy) return;
  if (['attack','skill','guard','potion'].includes(action)) {
    await performAction(action); return;
  }
  switch(action) {
    case 'begin': startEncounter(state); tone(); persist(); render(); break;
    case 'descend': descend(state); tone(); persist(); render(); break;
    case 'party': openModal('party'); break;
    case 'codex': openModal('codex'); break;
    case 'restart': openModal('restart'); break;
    case 'confirm-restart': state = createGame(); notice = ''; closeModal(); persist(); render(); openModal('party'); break;
    case 'close': closeModal(); break;
    case 'choose': { const id = element.dataset.class; if (selection.includes(id)) selection = selection.filter(x => x !== id); else if (selection.length < 3) selection.push(id); const scroll = document.querySelector('#game-dialog').scrollTop; document.querySelector('#game-dialog').close(); renderModal(); document.querySelector('#game-dialog').scrollTop = scroll; break; }
    case 'save-party': if (selection.length === 3) { state = createGame(selection); closeModal(); persist(); render(); } break;
    case 'log': case 'journey': panel = action; render(); break;
    case 'sound': sound = !sound; tone(); render(); break;
    case 'fullscreen': try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { notice = 'Fullscreen is unavailable in this browser.'; render(); } break;
    case 'expedition': closeModal(); window.scrollTo({ top:0, behavior:'smooth' }); break;
  }
}
app.addEventListener('click', e => { const button = e.target.closest('[data-action]'); if(button && !button.disabled) handle(button.dataset.action, button); });
document.addEventListener('keydown', e => { if (modal || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return; const action = { '1':'attack','2':'skill','3':'guard','4':'potion' }[e.key]; if (action && state.status === 'battle') { e.preventDefault(); handle(action); } });
render();
