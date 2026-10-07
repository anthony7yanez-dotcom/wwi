import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES, ENCOUNTERS, createGame, actor, startEncounter, act, descend, validSave } from '../src/engine.js';
const zero = () => 0;

test('party requires three unique, known classes', () => {
  assert.throws(() => createGame(['knight', 'knight', 'witch']));
  assert.throws(() => createGame(['knight', 'witch']));
  assert.throws(() => createGame(['knight', 'witch', 'unknown']));
  assert.equal(validSave(createGame()), true);
});
test('heroes act by speed and enemy only attacks at end of round', () => {
  const s = createGame(); startEncounter(s);
  assert.equal(actor(s).id, 'sorcerer');
  act(s, 'attack', zero); assert.equal(actor(s).id, 'knight');
  assert.equal(s.party[0].hp, 125);
  act(s, 'attack', zero); assert.equal(actor(s).id, 'paladin');
  act(s, 'attack', zero); assert.equal(s.party[0].hp, 104);
  assert.equal(s.round, 2); assert.equal(actor(s).id, 'sorcerer');
});
test('insufficient focus and invalid actions do not consume the turn', () => {
  const s = createGame(); startEncounter(s); actor(s).mp = 0;
  const before = structuredClone(s);
  assert.equal(act(s, 'skill').ok, false);
  assert.equal(act(s, 'invalid').ok, false);
  assert.deepEqual(s, before);
});
test('soulfire damages now and burns on two subsequent enemy turns', () => {
  const s = createGame(); startEncounter(s); act(s,'skill',zero);
  assert.equal(s.enemy.hp,160); assert.equal(s.enemy.burn,2);
  act(s,'guard',zero); act(s,'guard',zero);
  assert.equal(s.enemy.hp,152); assert.equal(s.enemy.burn,1);
  for(let i=0;i<3;i++) act(s,'guard',zero);
  assert.equal(s.enemy.hp,144); assert.equal(s.enemy.burn,0);
});
test('guard mitigates enemy attack and restores focus', () => {
  const s = createGame(); startEncounter(s); s.party[0].mp = 0;
  act(s,'attack',zero); act(s,'guard',zero); act(s,'attack',zero);
  assert.equal(s.party[0].hp,118); assert.equal(s.party[0].mp,7);
});
test('shield bash weakens the enemy for the round', () => {
  const s = createGame(); startEncounter(s);
  act(s,'attack',zero); act(s,'skill',zero); act(s,'attack',zero);
  assert.equal(s.party[0].hp,111); assert.equal(s.enemy.weak,false);
});
test('paladin heals the most wounded living ally, without resurrecting', () => {
  const s = createGame(); startEncounter(s); s.party[0].hp = 50; s.party[1].hp = 10;
  act(s,'guard',zero); act(s,'guard',zero); act(s,'skill',zero);
  assert.equal(s.party[1].hp,45);
  assert.ok(s.log.some(l => l.text.includes('35 health to Sorcerer')));
});
test('witch and monk abilities restore health while dealing damage', () => {
  const s = createGame(['witch','monk','paladin']); startEncounter(s);
  s.party[0].hp = 30; act(s,'skill',zero);
  assert.equal(s.party[0].hp,50); assert.equal(s.enemy.hp,168);
  s.party[1].hp = 40; act(s,'skill',zero);
  assert.equal(s.party[0].hp,64); assert.equal(s.party[1].hp,54); assert.equal(s.enemy.hp,148);
});
test('potions consume inventory only when usable, and healing is capped', () => {
  const s = createGame(); startEncounter(s);
  assert.equal(act(s,'potion').ok,false); assert.equal(s.potions,3);
  actor(s).hp = 70; act(s,'potion',zero);
  assert.equal(s.party[1].hp,80); assert.equal(s.potions,2);
});
test('each third round attacks all living heroes', () => {
  const s = createGame(); startEncounter(s);
  for(let i=0;i<6;i++) act(s,'guard',zero);
  const before = s.party.map(p => p.hp);
  for(let i=0;i<3;i++) act(s,'guard',zero);
  assert.ok(s.party.every((p,i) => p.hp < before[i]));
});
test('victory rewards gold; descent restores, revives, and advances', () => {
  const s = createGame(); startEncounter(s); s.party[0].hp = 0; s.queue = [1,2]; s.enemy.hp = 1;
  act(s,'attack',zero);
  assert.equal(s.status,'victory'); assert.equal(s.gold,75);
  const gold = s.gold; assert.equal(act(s,'attack').ok,false); assert.equal(s.gold,gold);
  assert.equal(descend(s),true); assert.equal(s.depth,1); assert.equal(s.party[0].hp,63); assert.equal(s.potions,4);
  assert.equal(s.enemy.hp,265); assert.equal(validSave(s),true);
});
test('three victories complete the expedition and cannot descend again', () => {
  const s = createGame(); startEncounter(s);
  for(let i=0;i<3;i++) {s.enemy.hp = 1; act(s,'attack',zero); if(i<2) descend(s);}
  assert.equal(s.status,'complete'); assert.equal(s.gold,395); assert.equal(descend(s),false);
});
test('party wipe ends combat and fallen heroes are removed from queue', () => {
  const s = createGame(); startEncounter(s); s.party.forEach(p=>p.hp=1); s.round=3;
  for(let i=0;i<3;i++) act(s,'attack',zero);
  assert.equal(s.status,'defeat'); assert.equal(actor(s),null); assert.equal(act(s,'attack').ok,false);
});
test('save validation rejects corrupted state and preserves a live battle', () => {
  const s=createGame(); startEncounter(s); act(s,'attack',zero);
  assert.equal(validSave(JSON.parse(JSON.stringify(s))),true);
  for(const mutate of [s=>s.party[0].hp=-1,s=>s.depth=10,s=>s.queue=[1,1],s=>s.cursor=99,s=>s.enemy.maxHp=1000,s=>s.party[0].id='invalid',s=>s.log=null]) {
    const corrupt=structuredClone(s); mutate(corrupt); assert.equal(validSave(corrupt),false);
  }
});
