import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES, createGame } from '../src/engine.js';
import { MAPS, WALK_SPEED, createWorld, canStand, moveWorld, nearbyObject, interactWorld, finishWorldDialogue, questInfo, validWorld, validAdventureSave } from '../src/world.js';

function standNear(world,id){const object=MAPS[world.map].objects.find(o=>o.id===id);world.x=object.x;world.y=object.y+32;assert.ok(canStand(world,world.x,world.y));return object;}
function walk(world,dx,dy,frames){for(let i=0;i<frames;i++)moveWorld(world,dx,dy,1/60);}

test('world begins in a valid courtyard, with no elapsed-time flame countdown',()=>{
  const w=createWorld();assert.ok(validWorld(w));assert.equal(w.map,'courtyard');assert.equal(questInfo(w).step,0);
  const flags=structuredClone(w.flags);walk(w,1,0,30);walk(w,-1,0,30);assert.deepEqual(w.flags,flags);
});
test('movement is time-based, diagonal speed is normalized, and large deltas are capped',()=>{
  const a=createWorld(),b=createWorld();const start={x:a.x,y:a.y};walk(a,1,0,30);walk(b,1,1,30);
  assert.ok(Math.abs(Math.hypot(a.x-start.x,a.y-start.y)-WALK_SPEED*.5)<.001);
  assert.ok(Math.abs(Math.hypot(b.x-start.x,b.y-start.y)-WALK_SPEED*.5)<.001);
  const c=createWorld();moveWorld(c,1,0,10);assert.ok(c.x-start.x<=WALK_SPEED*.05+.001);
  const before=structuredClone(c);assert.equal(moveWorld(c,NaN,1,.01).moved,false);assert.deepEqual(c,before);
});
test('houses, perimeter, NPCs and the closed gate stop movement without tunneling',()=>{
  const w=createWorld();w.x=320;w.y=272;walk(w,0,-1,200);assert.ok(w.y>=32);assert.ok(canStand(w,w.x,w.y));
  assert.equal(canStand(w,100,100),false);assert.equal(canStand(w,400,304),false);assert.equal(canStand(w,10,368),false);
  w.map='approach';w.visited.push('approach');w.x=580;w.y=336;walk(w,1,0,120);assert.ok(w.x<=616);assert.ok(canStand(w,w.x,w.y));
  for(let y=232;y<=376;y+=4)assert.equal(canStand(w,636,y),false,'Closed gate cannot be bypassed');
  w.flags.gate=true;walk(w,1,0,60);assert.ok(w.x>636);
});
test('map exits connect in both directions and spawn clear of immediate exit triggers',()=>{
  const w=createWorld();w.x=920;w.y=336;let transition=false;
  for(let i=0;i<20;i++)transition=moveWorld(w,1,0,1/60).transition||transition;
  assert.ok(transition);assert.equal(w.map,'approach');assert.ok(w.x>28);assert.deepEqual(w.visited,['courtyard','approach']);
  w.x=40;walk(w,-1,0,20);assert.equal(w.map,'courtyard');assert.ok(w.x<932);assert.ok(validWorld(w));
});
test('interactions require proximity, and the supply chest awards exactly two potions once',()=>{
  const w=createWorld(),g=createGame('knight');assert.equal(nearbyObject(w),null);assert.equal(interactWorld(w,g),null);
  standNear(w,'chest');assert.equal(nearbyObject(w).id,'chest');assert.match(interactWorld(w,g).speaker,/Supplies/);assert.equal(g.potions,5);
  assert.match(interactWorld(w,g).lines[0],/empty/);assert.equal(g.potions,5);
});
test('quest acceptance and gate activation happen at the final dialogue choice',()=>{
  const w=createWorld(),g=createGame('witch');standNear(w,'caretaker');const talk=interactWorld(w,g);assert.equal(w.flags.quest,false);
  finishWorldDialogue(w,talk.finish);assert.equal(w.flags.quest,true);assert.equal(questInfo(w).step,1);
  w.map='approach';w.visited.push('approach');standNear(w,'lever');const lever=interactWorld(w,g);assert.equal(w.flags.gate,false);
  finishWorldDialogue(w,lever.finish);assert.equal(w.flags.gate,true);assert.equal(questInfo(w).step,2);
});
test('every class can finish the local quest and keep its class identity',()=>{
  for(const c of CLASSES){const g=createGame(c.id,'Ash'),w=createWorld();
    standNear(w,'caretaker');finishWorldDialogue(w,interactWorld(w,g).finish);
    standNear(w,'traveler');finishWorldDialogue(w,interactWorld(w,g).finish);
    standNear(w,'chest');interactWorld(w,g);
    w.map='approach';w.visited.push('approach');standNear(w,'lever');finishWorldDialogue(w,interactWorld(w,g).finish);
    standNear(w,'ward');interactWorld(w,g);assert.equal(questInfo(w).step,3);
    w.map='courtyard';standNear(w,'caretaker');finishWorldDialogue(w,interactWorld(w,g).finish);
    assert.equal(questInfo(w).complete,true);assert.equal(g.hero.id,c.id);assert.equal(g.potions,5);
    assert.ok(validAdventureSave({version:1,game:g,world:w}));
  }
});
test('save validation rejects invalid positions, broken flags and malformed conversation state',()=>{
  const game=createGame('monk'),world=createWorld(),save={version:1,game,world};assert.ok(validAdventureSave(save));
  for(const mutate of [w=>w.x=NaN,w=>w.x=10000,w=>w.map='missing',w=>w.flags.gate='yes',w=>w.flags.ward=true,w=>w.visited=['approach'],w=>w.conversation={id:'caretaker',page:99}]){const invalid=structuredClone(save);mutate(invalid.world);assert.equal(validAdventureSave(invalid),false);}
  standNear(world,'caretaker');world.conversation={...interactWorld(world,game),page:1};assert.ok(validAdventureSave(save));
  const restored=JSON.parse(JSON.stringify(save));assert.equal(restored.world.conversation.page,1);assert.equal(restored.world.conversation.finish,'accept');
  assert.ok(validAdventureSave({version:1,game:createGame(),world:null}));assert.equal(validAdventureSave({version:1,game:createGame(),world}),false);
});
