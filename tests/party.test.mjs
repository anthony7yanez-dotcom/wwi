import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES,createGame,initializeAdventure,heroStats,actor,act,setActiveMember,enemyIntent,validSave } from '../src/engine.js';
import { COMPANIONS,activeParty,partyMembers,availableCompanions } from '../src/companions.js';
import { createWorld,FIELD_NODES,canStand,interactWorld,finishWorldDialogue,beginWorldBattle,finishWorldBattle,validAdventureSave,migrateAdventureSave,moveWorld,RUN_SPEED } from '../src/world.js';
import { locomotionFrame } from '../src/world-view.js';
function adventure(id='knight'){return {game:initializeAdventure(createGame(id,'Ash')),world:createWorld(),version:2};}
function unlock(world){Object.assign(world.flags,{quest:true,caretaker:true,gate:true,ward:true,reported:true,forestChest:true});world.cleared=['wood-sentinel'];}
function visit(world,map,x,y){world.map=map;world.x=x;world.y=y;if(!world.visited.includes(map))world.visited.push(map);assert.ok(canStand(world,x,y));}
function recruit(save,id){const c=COMPANIONS.find(c=>c.id===id);visit(save.world,c.map,c.x,c.y+24);const talk=interactWorld(save.world,save.game);assert.equal(talk.finish,'recruit:'+id);assert.ok(finishWorldDialogue(save.world,talk.finish,save.game));}
function battle(save,spawn='wood-wolf'){visit(save.world,'forest',304,368);assert.ok(beginWorldBattle(save.world,save.game,spawn));}

test('all seven starting choices produce six distinct, staged companions with no duplicate protagonist class',()=>{
 for(const cls of CLASSES){const s=adventure(cls.id);assert.equal(s.game.companions.length,0);assert.equal(availableCompanions(s.world,s.game).length,0);unlock(s.world);
  for(const c of COMPANIONS.filter(c=>c.id!==cls.id))recruit(s,c.id);
  assert.equal(partyMembers(s.game).length,7);assert.equal(s.game.companions.length,6);assert.equal(s.game.hero.id,cls.id);assert.equal(new Set(partyMembers(s.game).map(h=>h.id)).size,7);assert.equal(activeParty(s.game).length,4);assert.ok(validAdventureSave(s));
  assert.equal(finishWorldDialogue(s.world,'recruit:'+cls.id,s.game),false);
 }
});
test('recruitment is gated by story, distance and final choice; identities and dialogue respond to starting class',()=>{
 const a=adventure('paladin'),b=adventure('witch');visit(a.world,'courtyard',656,384);assert.equal(finishWorldDialogue(a.world,'recruit:knight',a.game),false);
 a.world.flags.quest=true;b.world.flags.quest=true;visit(b.world,'courtyard',656,384);
 const talk=interactWorld(a.world,a.game);assert.equal(a.game.companions.length,0);assert.notDeepEqual(talk.lines,interactWorld(b.world,b.game).lines);assert.ok(talk.lines[0].includes('courtyard'));
 a.world.x=464;assert.equal(finishWorldDialogue(a.world,talk.finish,a.game),false);a.world.x=656;assert.ok(finishWorldDialogue(a.world,talk.finish,a.game));assert.equal(finishWorldDialogue(a.world,talk.finish,a.game),false);
});
test('party management caps four, locks the protagonist and prevents mid-battle changes',()=>{
 const s=adventure();unlock(s.world);for(const c of COMPANIONS.filter(c=>c.id!=='knight'))recruit(s,c.id);
 assert.equal(setActiveMember(s.game,'knight'),false);assert.equal(setActiveMember(s.game,'monk'),false);
 assert.ok(setActiveMember(s.game,s.game.activeIds[1]));assert.ok(setActiveMember(s.game,'monk'));assert.equal(s.game.activeIds[0],'knight');battle(s);assert.equal(setActiveMember(s.game,'monk'),false);assert.ok(validAdventureSave(s));
});
test('each living member acts before the enemy; shield bash protection lasts through the whole party phase',()=>{
 const s=adventure();unlock(s.world);recruit(s,'warrior');battle(s);const initial=s.game.hero.hp;
 const first=act(s.game,'skill',()=>0);assert.equal(first.enemyDamage,0);assert.equal(s.game.round,1);assert.equal(s.game.enemy.weak,true);assert.equal(actor(s.game).id,'warrior');assert.equal(s.game.hero.hp,initial);assert.ok(validAdventureSave(s));
 const second=act(s.game,'attack',()=>0);assert.ok(second.enemyDamage>0);assert.equal(s.game.round,2);assert.equal(s.game.enemy.weak,false);assert.deepEqual(s.game.acted,[]);assert.equal(actor(s.game).id,'knight');assert.ok(validAdventureSave(s));
});
test('Paladin heals wounded allies, Monk restores party focus, and potion revives a downed protagonist',()=>{
 const s=adventure('paladin');unlock(s.world);recruit(s,'warrior');battle(s);s.game.companions[0].hp=30;const light=act(s.game,'skill',()=>0);assert.equal(light.healTargetId,'warrior');assert.equal(s.game.companions[0].hp,60);
 s.game.hero.hp=0;const potion=act(s.game,'potion',()=>0);assert.equal(potion.healTargetId,'paladin');assert.ok(s.game.hero.hp>0);assert.ok(validSave(s.game));
 const m=adventure('monk');unlock(m.world);recruit(m,'warrior');battle(m);m.game.companions[0].mp=0;act(m.game,'skill',()=>0);assert.equal(m.game.companions[0].mp,3);
});
test('boss heavy wave hits all living members and coordinated guards mitigate every target',()=>{
 const s=adventure('knight');unlock(s.world);recruit(s,'warrior');visit(s.world,'shrine',480,336);assert.ok(beginWorldBattle(s.world,s.game,'shrine-warden'));s.game.round=3;assert.ok(enemyIntent(s.game).heavy);
 act(s.game,'guard',()=>0);const hit=act(s.game,'guard',()=>0);assert.equal(hit.enemyHits.length,2);assert.ok(hit.enemyHits.every(h=>h.damage<=9));assert.ok(activeParty(s.game).every(h=>!h.guard));
 s.game.round=4;assert.ok(enemyIntent(s.game).shell);const shell=act(s.game,'attack',()=>0);assert.equal(shell.damage,Math.round(heroStats(s.game.hero).attack*.6));assert.ok(validAdventureSave(s));
});
test('reserve exploration abilities and protagonist abilities unlock one-time discoveries, never consume combat focus',()=>{
 const s=adventure();unlock(s.world);for(const c of COMPANIONS.filter(c=>c.id!=='knight'))recruit(s,c.id);
 for(const n of FIELD_NODES){visit(s.world,n.map,n.x,n.y+24);const talk=interactWorld(s.world,s.game),before=s.game.gold;assert.equal(talk.finish,'field:'+n.classId);assert.ok(finishWorldDialogue(s.world,talk.finish,s.game));assert.equal(s.world.flags[n.id],true);assert.equal(s.game.gold,before+(n.gold||0));assert.equal(finishWorldDialogue(s.world,talk.finish,s.game),false);assert.ok(validAdventureSave(s));}
 const alone=adventure('witch'),n=FIELD_NODES.find(n=>n.classId==='warrior');visit(alone.world,n.map,n.x,n.y+24);assert.match(interactWorld(alone.world,alone.game).lines[1],/Requires Sunder/);assert.equal(finishWorldDialogue(alone.world,'field:warrior',alone.game),false);
});
test('victory persists enemy removal and rewards all recruits; retreat and defeat leave enemies available',()=>{
 const s=adventure('warrior');unlock(s.world);recruit(s,'paladin');battle(s);s.game.enemy.hp=1;act(s.game,'attack',()=>0);assert.ok(validAdventureSave(s));assert.ok(finishWorldBattle(s.world,s.game,'victory'));assert.equal(s.game.xp,25);assert.equal(s.game.gold,30);assert.ok(partyMembers(s.game).every(h=>h.level===2));assert.ok(s.world.cleared.includes('wood-wolf'));assert.ok(validAdventureSave(s));assert.equal(finishWorldBattle(s.world,s.game,'victory'),false);
 const r=adventure();battle(r);act(r.game,'guard',()=>0);assert.ok(finishWorldBattle(r.world,r.game,'retreat'));assert.equal(r.world.cleared.length,0);assert.equal(r.world.grace,96);assert.ok(validAdventureSave(r));
 battle(r);r.game.hero.hp=1;act(r.game,'attack',()=>0);assert.equal(r.game.status,'defeat');assert.ok(validAdventureSave(r));assert.ok(finishWorldBattle(r.world,r.game,'defeat'));assert.equal(r.world.map,'courtyard');assert.equal(r.game.hero.hp,heroStats(r.game.hero).hp);assert.ok(validAdventureSave(r));
});
test('old exploration saves migrate without losing quests, supplies, position or conversation',()=>{
 const g=createGame('witch'),w=createWorld();w.conversation={...interactWorld({...w,x:400,y:336},g),page:1};w.x=400;w.y=336;
 const old={version:1,game:g,world:w},copy=structuredClone(old),m=migrateAdventureSave(old);assert.ok(validAdventureSave(m));assert.deepEqual(old,copy);assert.equal(m.world.conversation.page,1);assert.equal(m.game.hero.id,'witch');assert.deepEqual(m.game.companions,[]);
 for(const mutate of [s=>s.game.companions.push({...s.game.hero}),s=>s.game.activeIds.push('witch'),s=>s.game.companions.push(null),s=>s.game.acted=['missing'],s=>s.world.cleared=['missing']]){const bad=structuredClone(m);mutate(bad);assert.equal(validAdventureSave(bad),false);}
});
test('all four regions connect, running is faster, and animation rows use actual facing and locomotion',()=>{
 const s=adventure();s.world.flags.gate=true;visit(s.world,'approach',926,336);moveWorld(s.world,1,0,.05,true);assert.equal(s.world.map,'forest');visit(s.world,'forest',480,42);moveWorld(s.world,0,-1,.05,true);assert.equal(s.world.map,'shrine');visit(s.world,'shrine',480,598);moveWorld(s.world,0,1,.05,true);assert.equal(s.world.map,'forest');
 const a=createWorld(),b=createWorld();moveWorld(a,1,0,.05);moveWorld(b,1,0,.05,true);assert.ok(b.x>a.x);assert.ok(Math.abs(b.x-464-RUN_SPEED*.05)<.001);
 for(const [i,d] of ['south','west','north','east'].entries()){assert.equal(locomotionFrame(d,true,false,12).row,i);assert.equal(locomotionFrame(d,true,true,15).row,i+4);assert.equal(locomotionFrame(d,true,true,15,true).frame,0);assert.equal(locomotionFrame(d,false,true,15).mode,'idle');}
});

test('every starting class can complete all four regional encounters with staged recruitment and coordinated tactics',()=>{
 for(const cls of CLASSES){const s=adventure(cls.id);Object.assign(s.world.flags,{caretaker:true,quest:true,gate:true,ward:true,reported:true});
  for(const id of ['knight','warrior','paladin'])if(id!==cls.id)recruit(s,id);
  for(const [spawn,map,x,y] of [['wood-wolf','forest',304,368],['wood-sentinel','forest',480,192],['glade-wolf','forest',784,384],['shrine-warden','shrine',480,336]]){
   if(spawn==='wood-sentinel'&&cls.id!=='sorcerer')recruit(s,'sorcerer');
   if(spawn==='glade-wolf'){s.world.flags.forestChest=true;for(const id of ['witch','gunslinger'])if(id!==cls.id)recruit(s,id);}
   if(spawn==='shrine-warden'&&cls.id!=='monk')recruit(s,'monk');
   visit(s.world,map,x,y);assert.ok(beginWorldBattle(s.world,s.game,spawn));let actions=0;
   while(s.game.status==='battle'&&actions++<180){const h=actor(s.game),stats=heroStats(h),intent=enemyIntent(s.game),weakest=activeParty(s.game).find(m=>m.hp<heroStats(m).hp*.3);const action=intent.heavy?'guard':weakest&&s.game.potions?'potion':h.mp>=stats.cost?'skill':'attack';assert.ok(act(s.game,action,()=>.35).ok);assert.ok(validAdventureSave(s));}
   assert.equal(s.game.status,'victory',`${cls.name} should beat ${spawn} with coordinated commands`);assert.ok(finishWorldBattle(s.world,s.game,'victory'));assert.ok(validAdventureSave(s));
  }
  assert.equal(s.game.gold,245);assert.equal(s.game.xp,180);assert.equal(s.game.hero.level,4);assert.equal(s.game.companions.length,6);assert.equal(s.game.hero.id,cls.id);
 }
});
