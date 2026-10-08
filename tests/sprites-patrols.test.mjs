import test from 'node:test';
import assert from 'node:assert/strict';
import {CLASSES,createGame,chooseClass,initializeAdventure,validSave} from '../src/engine.js';
import {characterAppearance,memberAppearance,ORIGINAL_GENDER} from '../src/sprites.js';
import {PATROLS,patrolLength,patrolPose} from '../src/patrols.js';
import {createWorld,activeEnemies,advanceEnemyPatrols,canStand,nearbyEnemy,nearbyInteraction,beginWorldBattle,finishWorldBattle,validAdventureSave,migrateAdventureSave} from '../src/world.js';
import {enemyMove} from '../src/animations.js';

test('every class supports both genders with equal rules and locked identity',()=>{
 for(const c of CLASSES)for(const gender of ['male','female']){
  const game=createGame(c.id,'Ash',gender);assert.ok(validSave(game));assert.equal(game.hero.gender,gender);
  assert.equal(game.hero.hp,c.hp);assert.equal(game.hero.mp,c.mp);assert.equal(chooseClass(game,'monk','male'),false);
  assert.equal(characterAppearance(c.id,gender).alternate,gender!==ORIGINAL_GENDER[c.id]);
  const companion={id:c.id};assert.equal(memberAppearance({hero:{id:'other',gender}},companion).alternate,false);
 }
 const intro=createGame();intro.selectedGender='female';assert.ok(validSave(intro));chooseClass(intro,'knight');assert.equal(intro.hero.gender,'female');
 assert.equal(chooseClass(createGame(),'knight','unknown'),false);
});
test('old appearance and save data survive without silently assigning a new gender',()=>{
 const game=initializeAdventure(createGame('witch')),world=createWorld();delete game.hero.gender;delete world.patrols;
 const old={version:2,game,world};assert.ok(validAdventureSave(old));assert.deepEqual(migrateAdventureSave(old),old);
 assert.equal(characterAppearance(game.hero.id,game.hero.gender).gender,'female');
 for(const mutate of [s=>s.game.hero.gender='bad',s=>s.game.selectedGender='bad',s=>s.world.patrols=[],s=>s.world.patrols={unknown:1},s=>s.world.patrols={'wood-wolf':Infinity},s=>s.world.patrols={'wood-wolf':-1},s=>s.world.patrols={'wood-wolf':patrolLength('wood-wolf')}]){const invalid=structuredClone(old);mutate(invalid);assert.equal(validAdventureSave(invalid),false);}
});
test('patrol loops are deterministic, turn at corners and remain on walkable terrain',()=>{
 for(const map of ['forest','shrine']){
  const world=createWorld();world.map=map;world.visited.push(map);world.x=map==='forest'?240:480;world.y=map==='forest'?336:560;
  const before=activeEnemies(world);assert.ok(advanceEnemyPatrols(world,1/60));
  for(let i=0;i<2000;i++){advanceEnemyPatrols(world,.05);for(const enemy of activeEnemies(world))assert.ok(canStand(world,enemy.x,enemy.y),enemy.id);}
  assert.notDeepEqual(activeEnemies(world),before);assert.ok(validAdventureSave({version:2,game:initializeAdventure(createGame('knight')),world}));
  for(const enemy of activeEnemies(world)){const pose=patrolPose(enemy.id,world.patrols[enemy.id]);assert.equal(pose.x,enemy.x);assert.equal(pose.y,enemy.y);}
 }
 assert.deepEqual(patrolPose('wood-wolf',96).facing,'south');assert.deepEqual(patrolPose('wood-wolf',144).facing,'west');
 const w=createWorld();w.map='forest';advanceEnemyPatrols(w,100);assert.equal(w.patrols['wood-wolf'],PATROLS['wood-wolf'].speed*.05);
});
test('dialogue, battle, inactive maps and cleared enemies stop patrol progression',()=>{
 const w=createWorld();assert.equal(advanceEnemyPatrols(w,.05),false);w.map='forest';w.cleared=['wood-sentinel'];advanceEnemyPatrols(w,.05);assert.equal(w.patrols['wood-sentinel'],undefined);
 const snapshot=structuredClone(w.patrols);w.conversation={};assert.equal(advanceEnemyPatrols(w,.05),false);assert.deepEqual(w.patrols,snapshot);
 w.conversation=null;w.battle={};assert.equal(advanceEnemyPatrols(w,.05),false);assert.deepEqual(w.patrols,snapshot);
});
test('battle contact uses the moving enemy position and retreat preserves route and grace',()=>{
 const game=initializeAdventure(createGame('paladin','Ash','female')),world=createWorld();world.map='forest';world.visited.push('forest');world.patrols['wood-wolf']=96;
 world.x=304;world.y=336;assert.equal(beginWorldBattle(world,game,'wood-wolf'),false);
 world.x=400;world.y=336;assert.equal(nearbyEnemy(world).id,'wood-wolf');assert.ok(beginWorldBattle(world,game,'wood-wolf'));
 const save={version:2,game,world};assert.ok(validAdventureSave(save));assert.deepEqual(migrateAdventureSave(save),save);
 assert.ok(finishWorldBattle(world,game,'retreat'));assert.equal(world.grace,96);assert.equal(world.patrols['wood-wolf'],96);assert.ok(!world.cleared.includes('wood-wolf'));
});
test('three enemy identities have distinct normal, heavy and death animation rows',()=>{
 const rows=new Set();for(const id of ['wolf','sentinel','warden'])for(const action of ['attack','heavy','death']){const move=enemyMove(id,action);assert.ok(!rows.has(move.row));rows.add(move.row);assert.ok(move.duration>=600);assert.ok(move.columns>=5);}
});
test('a closer companion remains interactable when an enemy patrols nearby',()=>{
 const game=initializeAdventure(createGame('knight')),world=createWorld();world.map='forest';world.flags.forestChest=true;world.x=864;world.y=424;world.patrols['glade-wolf']=96;
 assert.equal(nearbyEnemy(world,58).id,'glade-wolf');assert.equal(nearbyInteraction(world,game).object.id,'companion-gunslinger');
 world.x=848;world.y=352;assert.equal(nearbyInteraction(world,game).enemy.id,'glade-wolf');
});
