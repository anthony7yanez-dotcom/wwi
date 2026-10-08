import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,initializeAdventure} from '../src/engine.js';
import {createWorld,canStand,moveWorld,worldObjects,migrateAdventureSave,validAdventureSave,beginWorldBattle} from '../src/world.js';
import {startChapter,chapterFinish} from '../src/chapter.js';
import {questTarget,guideDestination,guidePath} from '../src/guidance.js';
const fixture=()=>{const game=initializeAdventure(createGame('knight','Ash')),world=startChapter(createWorld(),game);return {version:2,game,world};};
test('painted interior furniture, southern walls and residents stop running without closing the doorway',()=>{
 const {world,game}=fixture();world.map='home';
 for(const [x,y] of [[176,224],[594,192],[256,560],[704,560]])assert.equal(canStand(world,x,y,game),false);
 for(const [x,y] of [[480,544],[480,594],[256,456],[480,240]])assert.ok(canStand(world,x,y,game));
 Object.assign(world,{x:400,y:512});for(let i=0;i<20;i++)moveWorld(world,-1,0,.05,true,game);assert.ok(world.x>=392,'no tunneling into painted southern wall');
 Object.assign(world,{map:'courtyard',x:544,y:464});for(let i=0;i<20;i++)moveWorld(world,0,-1,.05,true,game);assert.ok(world.y>=452,'baker has a solid footprint');
});
test('older saves relocate from new furniture and walls while preserving identity, discoveries and battle return positions',()=>{
 const old=fixture();delete old.world.layoutVersion;Object.assign(old.world,{map:'home',x:200,y:208,visited:['courtyard','home']});
 assert.ok(validAdventureSave(old));const updated=migrateAdventureSave(old);assert.ok(updated);assert.equal(updated.world.layoutVersion,2);assert.ok(canStand(updated.world,updated.world.x,updated.world.y,updated.game));assert.deepEqual(updated.game,old.game);assert.deepEqual(updated.world.chapter,old.world.chapter);assert.deepEqual(updated.world.visited,old.world.visited);assert.equal(old.world.layoutVersion,undefined);
 assert.deepEqual(migrateAdventureSave(updated),updated);
});
test('newly visible companions cannot trap returning players inside their footprint',()=>{
 const game=initializeAdventure(createGame('knight')),world=createWorld();Object.assign(world,{map:'approach',x:464,y:352});world.flags.gate=true;
 assert.equal(canStand(world,world.x,world.y,game),false);
 for(let i=0;i<10;i++)moveWorld(world,0,-1,.05,false,game);
 assert.ok(world.y<332);assert.ok(canStand(world,world.x,world.y,game));
 // The exception permits escape, not walking into a new resident.
 for(let i=0;i<10;i++)moveWorld(world,0,1,.05,true,game);
 assert.ok(world.y<=332);
});
test('an older battle save keeps its combat state while moving both return positions clear of a companion',()=>{
 const game=initializeAdventure(createGame('knight')),world=createWorld();delete world.layoutVersion;
 Object.assign(world,{map:'forest',x:432,y:272,visited:['courtyard','forest'],patrols:{'wood-sentinel':80}});
 for(const flag of ['quest','caretaker','gate','ward','reported'])world.flags[flag]=true;
 assert.ok(beginWorldBattle(world,game,'wood-sentinel'));const old={version:2,game,world};assert.ok(validAdventureSave(old));
 const migrated=migrateAdventureSave(old);assert.ok(migrated);assert.deepEqual(migrated.game,game);
 assert.ok(canStand(migrated.world,migrated.world.x,migrated.world.y,migrated.game));
 const r=migrated.world.battle.returnTo;assert.ok(canStand({...migrated.world,map:r.map},r.x,r.y,migrated.game));assert.equal(migrated.world.battle.spawnId,'wood-sentinel');
});
test('fairy tracks discovered quest milestones without revealing the puzzle before its inscription',()=>{
 const s=fixture(),w=s.world,g=s.game;
 assert.equal(questTarget(w,g).id,'caretaker');w.flags.quest=true;w.flags.caretaker=true;
 assert.equal(questTarget(w,g).id,'lever');assert.equal(guideDestination(w,g).id,'exit-east');
 w.flags.gate=true;assert.equal(questTarget(w,g).id,'ward');w.flags.ward=true;assert.equal(questTarget(w,g).id,'caretaker');
 chapterFinish(w,g,'resolve','people');assert.equal(questTarget(w,g).id,'camp');w.chapter.camp=true;assert.equal(questTarget(w,g).id,'shrine-road');
 w.visited.push('shrine');assert.equal(questTarget(w,g).id,'shrine-stone');w.chapter.puzzleClue=true;
 for(const symbol of ['root','ward','ember']){assert.equal(questTarget(w,g).id,'rune-'+symbol);chapterFinish(w,g,'rune-'+symbol);}
 assert.equal(questTarget(w,g).id,'ruins-cache');chapterFinish(w,g,'take-mirror');assert.equal(questTarget(w,g).id,'ruins-seal');chapterFinish(w,g,'open-seal');assert.equal(questTarget(w,g).id,'cult-voice');
 w.chapter.ritualSeen=true;assert.equal(questTarget(w,g).id,'shrine-warden');w.cleared.push('shrine-warden');assert.equal(questTarget(w,g).id,'sanctuary-light');w.chapter.lightRestored=true;assert.equal(questTarget(w,g).id,'caretaker');w.chapter.completed=true;assert.equal(questTarget(w,g),null);
});
test('guide paths respect gate, floor and NPC collisions and all chapter interactables remain reachable',()=>{
 const s=fixture(),w=s.world,g=s.game;w.flags.gate=true;w.chapter.sealOpened=true;
 const spawn={courtyard:[464,368],approach:[64,336],forest:[64,336],shrine:[480,560],sanctuary:[480,560],home:[480,544],supply:[480,544]};
 for(const [map,[x,y]] of Object.entries(spawn)){
   Object.assign(w,{map,x,y});
   for(const object of worldObjects(w,g)){
     if(['cult','guardian'].includes(object.kind))continue;
     const path=guidePath(w,g,{...object,map});assert.ok(path.length,`${map}: ${object.id} reachable`);
     for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let t=0;t<=1;t+=.1)assert.ok(canStand(w,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,g),`${object.id}: path crosses a wall`);}
   }
 }
 Object.assign(w,{map:'approach',x:560,y:320});w.flags.gate=false;
 assert.equal(guidePath(w,g,{id:'ward',x:848,y:304,map:'approach'}).length,0);
 assert.equal(guideDestination(w,g).name,'Ember courtyard');
});
