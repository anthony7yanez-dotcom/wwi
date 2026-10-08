import { secondTarget } from './chapter-two.js';
import { MAPS, mapExits, worldObjects, activeEnemies, canStand } from './world.js';

// The guide knows the roads and the player's discovered objectives, never
// undiscovered history. Chapter milestones remain the source of quest truth.
export function questTarget(world,game){
  if(world.chapterTwo)return secondTarget(world,game);const f=world.flags,c=world.chapter;
  let map,id;
  if(c?.completed){const o=worldObjects({...world,map:'courtyard'},game).find(o=>o.id==='caretaker');return {...o,map:'courtyard',name:'The caretaker’s Lornwatch petition'};}if(!c&&f.shrine)return null;
  if(!f.quest||f.ward&&(!f.reported||c&&!c.committed)){map='courtyard';id='caretaker';}
  else if(!f.gate){map='approach';id='lever';}
  else if(!f.ward){map='approach';id='ward';}
  else if(c){
    if(c.lightRestored){map='courtyard';id='caretaker';}
    else if(world.cleared.includes('shrine-warden')){map='sanctuary';id='sanctuary-light';}
    else if(c.ritualSeen){return activeEnemies({...world,map:'sanctuary'}).find(e=>e.id==='shrine-warden')&&{...activeEnemies({...world,map:'sanctuary'}).find(e=>e.id==='shrine-warden'),name:'Rootbound Warden',kind:'enemy'};}
    else if(c.sealOpened){map='sanctuary';id='cult-voice';}
    else if(c.puzzleSolved){map='shrine';id=c.technique?'ruins-seal':'ruins-cache';}
    else if(world.visited.includes('shrine')){map='shrine';id=c.puzzleClue?'rune-'+['root','ward','ember'][c.puzzle.length]:'shrine-stone';}
    else {map='forest';id=c.camp?'forest-sign':'camp';}
  }else{map='shrine';id=world.cleared.includes('shrine-warden')?'shrine-altar':'shrine-warden';}
  // After the camp, the next objective is the shrine road itself.
  if(c?.camp&&!world.visited.includes('shrine')&&!c.sealOpened){return {id:'shrine-road',name:'Forsaken Shrine',map:'shrine',x:480,y:560,kind:'route'};}
  const object=worldObjects({...world,map},game).find(o=>o.id===id);
  return object?{...object,map}:activeEnemies({...world,map}).find(e=>e.id===id)?{...activeEnemies({...world,map}).find(e=>e.id===id),name:'Rootbound Warden',kind:'enemy'}:null;
}

export function guideDestination(world,game){
  const target=questTarget(world,game);if(!target)return null;
  if(target.map===world.map)return {...target,target,local:true};
  const queue=[{map:world.map,first:null}],seen=new Set([world.map]);
  while(queue.length){
    const node=queue.shift();
    for(const exit of mapExits({...world,map:node.map})){
      if(seen.has(exit.destination))continue;
      const first=node.first||exit;
      if(exit.destination===target.map){
        return {id:'exit-'+first.edge,kind:'exit',map:world.map,x:first.edge==='east'?932:first.edge==='west'?28:480,y:first.edge==='north'?36:first.edge==='south'?604:336,name:first.label,target,local:false};
      }
      seen.add(exit.destination);queue.push({map:exit.destination,first});
    }
  }
  return null;
}

// Grid navigation checks the same feet collisions as player movement. Diagonal
// steps need both adjacent cells clear, so arrows cannot cut through corners.
export function guidePath(world,game,destination=guideDestination(world,game)){
  if(!destination)return [];
  const step=16,cols=61,key=(x,y)=>y*cols+x,enemies=activeEnemies(world).filter(e=>e.id!==destination.id);
  const safeCells=new Map();
  const safe=(x,y)=>{const k=x+','+y;if(!safeCells.has(k))safeCells.set(k,canStand(world,x,y,game)&&!enemies.some(e=>Math.hypot(e.x-x,e.y-y)<40));return safeCells.get(k);};
  const sx=Math.round(world.x/step),sy=Math.round(world.y/step);
  let start=null;
  for(let r=0;r<=2&&!start;r++)for(let y=sy-r;y<=sy+r&&!start;y++)for(let x=sx-r;x<=sx+r;x++)if(safe(x*step,y*step)&&Array.from({length:9},(_,i)=>i/8).every(t=>safe(world.x+(x*step-world.x)*t,world.y+(y*step-world.y)*t))){start={x,y};break;}
  if(!start)return [];
  const queue=[start],parents=new Map([[key(start.x,start.y),null]]);let end=null;
  const tolerance=destination.kind==='exit'?12:40;
  for(let i=0;i<queue.length;i++){
    const p=queue[i];
    if(Math.hypot(p.x*step-destination.x,p.y*step-destination.y)<=tolerance){end=p;break;}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
      const x=p.x+dx,y=p.y+dy,k=key(x,y);
      if(x<0||x>=cols||y<0||y>40||parents.has(k)||!safe(x*step,y*step))continue;
      if(dx&&dy&&(!safe(p.x*step+dx*step,p.y*step)||!safe(p.x*step,p.y*step+dy*step)))continue;
      parents.set(k,p);queue.push({x,y});
    }
  }
  if(!end)return [];
  const path=[];
  for(let p=end;p;p=parents.get(key(p.x,p.y)))path.push({x:p.x*step,y:p.y*step});
  path.reverse();return [{x:world.x,y:world.y},...path];
}

export function guideHint(destination){
  return destination?(destination.local?`Next: ${destination.name}.`:`Take the road to ${destination.name}. We’re looking for ${destination.target.name}.`):'Your local journey is complete. Rest, explore, or return to the courtyard.';
}
