import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASS_SKILLS, learnSkill, validSkills, ALCHEMIST } from '../src/skills.js';
import { CLASSES, createGame, initializeAdventure, heroStats, startEncounter, act, actor, enemyIntent, encounterHP, validSave } from '../src/engine.js';
import { activeParty } from '../src/companions.js';
import { createWorld, validAdventureSave, migrateAdventureSave, canStand, activeEnemies, finishWorldDialogue, interactWorld } from '../src/world.js';
import { startChapter } from '../src/chapter.js';
import { startSecond } from '../src/chapter-two.js';
import { PATROLS, patrolLength, patrolPose } from '../src/patrols.js';
import { enemyMove } from '../src/animations.js';
import { ENEMY_VISUALS } from '../src/enemy-art.js';
const zero=()=>0;
function game(id='knight',level=1){const s=initializeAdventure(createGame(id,'Ash'));s.hero.level=level;s.hero.hp=heroStats(s.hero).hp;s.hero.mp=heroStats(s.hero).mp;return s;}
function journey(id='knight'){const s=game(id),w=createWorld();startChapter(w,s);Object.assign(w,{map:'supply',x:224,y:264});w.visited.push('supply');return {game:s,world:w,version:2};}
function recruit(s,id){const h={id,level:s.hero.level,guard:false};Object.assign(h,{hp:heroStats(h).hp,mp:heroStats(h).mp});s.companions.push(h);s.activeIds.push(id);return h;}
test('each class learns four distinct lessons progressively, pays exactly once, and preserves old saves',()=>{
 const names=new Set();for(const c of CLASSES){const save=journey(c.id),s=save.game,w=save.world;s.gold=200;
  const dialogue=interactWorld(w,s);assert.equal(dialogue.id,'alchemist');w.conversation={...dialogue,page:0};assert.ok(validAdventureSave(save));assert.equal(learnSkill(s,w,s.hero.id,CLASS_SKILLS[c.id][0].id),false);w.conversation=null;assert.ok(finishWorldDialogue(w,'training',s));
  for(const skill of CLASS_SKILLS[c.id]){assert.ok(!names.has(skill.name));names.add(skill.name);if(skill.level>1)assert.equal(learnSkill(s,w,c.id,skill.id),false);s.hero.level=skill.level;s.xp=[0,25,70,150][skill.level-1];s.hero.hp=heroStats(s.hero).hp;s.hero.mp=heroStats(s.hero).mp;const before=s.gold;assert.ok(learnSkill(s,w,c.id,skill.id));assert.equal(s.gold,before-skill.price);assert.equal(learnSkill(s,w,c.id,skill.id),false);assert.ok(validAdventureSave(save));assert.deepEqual(migrateAdventureSave(save),save);}
  assert.equal(s.hero.skills.length,4);assert.equal(s.gold,75);const old=journey(c.id);assert.ok(validAdventureSave(old));assert.equal(old.game.hero.skills,undefined);
 }
 assert.equal(names.size,28);
});
test('training requires the actual alchemist, recruited class, level, prior lesson and gold',()=>{
 const save=journey('witch'),s=save.game,w=save.world;const knight=recruit(s,'knight');s.activeIds=['witch'];
 assert.equal(learnSkill(s,w,'knight','knight-lesson-1'),true);assert.equal(learnSkill(s,w,'paladin','paladin-lesson-1'),false);
 w.map='courtyard';assert.equal(learnSkill(s,w,'witch','witch-lesson-1'),false);w.map='supply';w.x=480;assert.equal(learnSkill(s,w,'witch','witch-lesson-1'),false);w.x=224;
 assert.ok(learnSkill(s,w,'witch','witch-lesson-1'));s.hero.level=2;s.hero.mp=heroStats(s.hero).mp;assert.equal(learnSkill(s,w,'witch','witch-lesson-2'),false);s.gold=25;assert.ok(learnSkill(s,w,'witch','witch-lesson-2'));assert.equal(s.gold,0);
 for(const bad of [null,[],['bad'],['knight-lesson-1'],['witch-lesson-1','witch-lesson-1'],['witch-lesson-4']])assert.equal(validSkills({...s.hero,skills:bad}),Array.isArray(bad)&&bad.length===0);
 assert.ok(validSkills(knight));assert.equal(canStand(w,ALCHEMIST.x,ALCHEMIST.y,s),false);assert.ok(canStand(w,224,264,s));
});
test('all 28 techniques spend focus, execute advertised effects, and count as one command',()=>{
 for(const c of CLASSES)for(const skill of CLASS_SKILLS[c.id]){const s=game(c.id,4),other=c.id==='knight'?'paladin':'knight',h=recruit(s,other);s.hero.skills=CLASS_SKILLS[c.id].map(s=>s.id);s.hero.hp=60;h.hp=60;h.mp=0;startEncounter(s,'marsh-ogre');const before=s.hero.mp;const r=act(s,'skill:'+skill.id,zero);assert.ok(r.ok,skill.name);assert.equal(actor(s).id,other);assert.equal(s.acted.length,1);assert.equal(s.hero.mp,before-skill.cost+(skill.effects.partyFocus||0));assert.equal(r.damage,skill.effects.damage?skill.effects.damage+12:0);assert.ok(validSave(s));
  if(skill.effects.partyHeal)assert.equal(h.hp,60+skill.effects.partyHeal);if(skill.effects.heal)assert.equal(s.hero.hp,60+skill.effects.heal);if(skill.effects.weak)assert.equal(s.enemy.weak,true);if(skill.effects.burn)assert.equal(s.enemy.burn,2);if(skill.effects.breakArmor)assert.equal(s.enemy.armorBreak,2);if(skill.effects.partyFocus)assert.equal(h.mp,skill.effects.partyFocus);if(skill.effects.partyGuard)assert.equal(s.partyWard,true);
 }
 const s=game();startEncounter(s,'ash-wolf');const before=structuredClone(s);assert.equal(act(s,'skill:knight-lesson-1').ok,false);assert.deepEqual(s,before);s.hero.skills=['knight-lesson-1'];s.hero.mp=0;assert.equal(act(s,'skill:knight-lesson-1').ok,false);
});
test('a shared ward survives later ally commands, guards the whole wave and resets after one phase',()=>{
 const s=game('knight',4);const h=recruit(s,'paladin');s.hero.skills=['knight-lesson-1'];startEncounter(s,'marsh-ogre');s.round=3;const damage=enemyIntent(s).damage;act(s,'skill:knight-lesson-1',zero);const partial=structuredClone(s);assert.ok(validSave(partial));const hit=act(s,'attack',zero);assert.equal(hit.enemyHits.length,2);assert.ok(hit.enemyHits.every(h=>h.damage===Math.round(damage*.25)));assert.equal(s.partyWard,false);assert.ok(!h.guard);
});
test('new encounters are tougher while in-progress legacy battle health remains valid',()=>{
 const s=game();startEncounter(s,'ash-wolf');assert.equal(s.enemy.maxHp,101);assert.equal(enemyIntent(s).damage,12);delete s.battleRules;delete s.partyWard;delete s.enemy.armorBreak;s.enemy.maxHp=90;s.enemy.hp=90;assert.ok(validSave(s));assert.equal(encounterHP(s),90);assert.equal(enemyIntent(s).damage,10);
});
test('skeleton armor is bypassed by piercing and stripped by an armor break',()=>{
 const s=game('warrior',4);s.hero.skills=['warrior-lesson-1','warrior-lesson-2','warrior-lesson-3'];startEncounter(s,'bone-guard');const attack=act(s,'attack',zero);assert.equal(attack.damage,Math.round(heroStats(s.hero).attack*.78));const r=act(s,'skill:warrior-lesson-3',zero);assert.equal(r.damage,60);assert.equal(s.enemy.armorBreak,1);assert.equal(act(s,'attack',zero).damage,heroStats(s.hero).attack);
 const p=game('gunslinger',4);p.hero.skills=['gunslinger-lesson-1','gunslinger-lesson-2','gunslinger-lesson-3'];startEncounter(p,'bone-guard');assert.equal(act(p,'skill:gunslinger-lesson-3',zero).damage,72);
});
test('burning suppresses undead regeneration, guarding denies focus drain and limits vampire healing',()=>{
 const s=game('sorcerer',4);startEncounter(s,'hollow-undead');assert.equal(act(s,'attack',zero).enemyHealed,9);assert.equal(act(s,'skill',zero).enemyHealed,undefined);
 const unguarded=game(),guarded=game();for(const g of [unguarded,guarded]){startEncounter(g,'veil-succubus');g.round=3;g.hero.mp=10;}act(unguarded,'attack',zero);act(guarded,'guard',zero);assert.equal(unguarded.hero.mp,9);assert.equal(guarded.hero.mp,18);
 const aggressive=game(),defensive=game();for(const g of [aggressive,defensive]){startEncounter(g,'beacon-vampire');g.round=3;g.enemy.hp-=50;}const a=act(aggressive,'attack',zero),b=act(defensive,'guard',zero);assert.ok(a.enemyHealed>b.enemyHealed);assert.equal(a.enemyHealed,Math.round(a.enemyDamage*.4));
});
test('existing enemies have species-specific special moves and recoil alongside attack/heavy/death',()=>{
 for(const id of ['wolf','sentinel','warden']){const s=game();startEncounter(s,{wolf:'ash-wolf',sentinel:'cult-sentinel',warden:'root-warden'}[id]);s.round=4;assert.equal(enemyIntent(s).animation,'special');assert.ok(enemyMove(id,'special').frames.length>=5);assert.equal(enemyMove(id,'hurt').duration,320);}
});
test('all five new patrols stay on walkable terrain, scale by ecology and have distinct action poses',()=>{
 const s=journey('witch');s.world.chapter.completed=true;s.world.chapter.lightRestored=true;s.world.chapter.puzzleSolved=true;s.world.chapter.puzzle=['root','ward','ember'];s.world.chapter.sealOpened=true;s.world.chapter.ritualSeen=true;s.world.chapter.committed=true;s.world.chapter.decision='act';s.world.chapter.camp=true;startSecond(s.world,s.game);s.world.chapterTwo.requested=true;s.world.chapterTwo.brace=true;s.world.chapterTwo.record=true;s.world.chapterTwo.kindled=true;s.world.chapterTwo.decision='shelter';
 for(const [id,map,sprite] of [['hollows-skeleton','hollows','skeleton'],['hollows-succubus','hollows','succubus'],['greyfen-ogre','greyfen','ogre'],['greyfen-undead','greyfen','undead'],['beacon-vampire','beacon','vampire']]){s.world.map=map;for(let d=0;d<patrolLength(id);d+=2){const p=patrolPose(id,d);assert.ok(canStand(s.world,p.x,p.y,s.game),id+' '+d);}assert.ok(activeEnemies(s.world).some(e=>e.id===id));for(const action of ['attack','heavy','death','hurt']){const m=enemyMove(sprite,action);assert.equal(m.rows,10);assert.ok(m.frames.every(f=>f>=0&&f<6));}assert.ok(PATROLS[id]);}
 assert.ok(ENEMY_VISUALS.ogre.worldHeight>ENEMY_VISUALS.vampire.worldHeight);assert.ok(ENEMY_VISUALS.warden.battleHeight>ENEMY_VISUALS.wolf.battleHeight*1.8);
});
test('new enemy tactics remain beatable by every Chapter II starting class without mandatory lessons',()=>{
 for(const c of CLASSES)for(const id of ['bone-guard','veil-succubus','marsh-ogre','hollow-undead','beacon-vampire'])for(let seed=1;seed<=3;seed++){
  const s=game(c.id,3);for(const companion of ['knight','paladin'])if(companion!==c.id)recruit(s,companion);s.potions=3;startEncounter(s,id);let random=seed,moves=0;const rng=()=>((random=(random*1664525+1013904223)>>>0)/4294967296);
  while(s.status==='battle'&&moves++<200){const h=actor(s),stats=heroStats(h),wounded=activeParty(s).some(m=>m.hp>0&&m.hp<heroStats(m).hp*.3);const command=enemyIntent(s).heavy?'guard':wounded&&s.potions?'potion':h.mp>=stats.cost?'skill':'attack';assert.ok(act(s,command,rng).ok);assert.ok(validSave(s));}
  assert.equal(s.status,'victory',`${c.id}, ${id}, seed ${seed}`);
 }
});
