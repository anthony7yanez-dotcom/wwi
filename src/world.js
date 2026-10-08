import { validSave } from './engine.js';

export const WORLD_SAVE_KEY = 'the-hollow-adventure-v1';
export const TILE = 32;
export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 640;
export const WALK_SPEED = 112;
const PLAYER_RADIUS = 8;
const rect = (x, y, w, h) => ({ x: x*TILE, y: y*TILE, w: w*TILE, h: h*TILE });

export const MAPS = {
  courtyard: {
    name: 'The Ember Courtyard', subtitle: 'A small fire against a very long night.',
    blockers: [rect(1,1,8,6),rect(12,1,6,5),rect(21,1,8,6),rect(2,12,7,6),rect(23,13,6,5)],
    objects: [
      {id:'caretaker',name:'The caretaker',kind:'npc',x:400,y:304,sprite:0},
      {id:'traveler',name:'The road traveler',kind:'npc',x:304,y:432,sprite:1},
      {id:'chest',name:'Supply chest',kind:'chest',x:240,y:256},
      {id:'fire',name:'Courtyard fire',kind:'fire',x:496,y:272},
      {id:'sign',name:'Weathered sign',kind:'sign',x:848,y:288},
    ],
    exit: {edge:'east',label:'Ruined approach',destination:'approach',spawn:{x:64,y:336}},
  },
  approach: {
    name:'The Ruined Approach',subtitle:'The ward has fallen silent. The road remembers.',
    blockers: [rect(1,1,28,6),rect(1,12,28,7)],
    objects: [
      {id:'lever',name:'Gate mechanism',kind:'lever',x:560,y:256},
      {id:'inscription',name:'Worn inscription',kind:'stone',x:384,y:256},
      {id:'ward',name:'Unlit ward',kind:'ward',x:848,y:304},
    ],
    exit:{edge:'west',label:'Ember courtyard',destination:'courtyard',spawn:{x:880,y:336}},
  },
};

export function createWorld() {
  return {map:'courtyard',x:464,y:368,facing:'south',conversation:null,flags:{caretaker:false,traveler:false,chest:false,quest:false,gate:false,ward:false,reported:false},visited:['courtyard']};
}

export function canStand(world,x,y) {
  if(!MAPS[world.map]||!Number.isFinite(x)||!Number.isFinite(y))return false;
  if(x<24||x>WORLD_WIDTH-24||y<32||y>WORLD_HEIGHT-24)return false;
  const map=MAPS[world.map];
  const blockers=[...map.blockers];
  // Openings through the edge walls match the two connected road exits.
  if((x<40||x>WORLD_WIDTH-40)&&!(y>=304&&y<=368&&(map.exit.edge==='east'?x>WORLD_WIDTH-40:x<40)))return false;
  if(world.map==='approach'&&!world.flags.gate)blockers.push({x:624,y:224,w:24,h:224});
  if(blockers.some(b=>x+PLAYER_RADIUS>b.x&&x-PLAYER_RADIUS<b.x+b.w&&y+PLAYER_RADIUS>b.y&&y-PLAYER_RADIUS<b.y+b.h))return false;
  return !map.objects.some(o=>o.kind!=='sign'&&Math.hypot(x-o.x,y-o.y)<PLAYER_RADIUS+(o.kind==='npc'?12:13));
}

export function moveWorld(world,dx,dy,seconds) {
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(seconds)||seconds<=0||(!dx&&!dy))return {moved:false,transition:false};
  const length=Math.hypot(dx,dy),dt=Math.min(seconds,.05);
  const stepX=dx/length*WALK_SPEED*dt,stepY=dy/length*WALK_SPEED*dt;
  world.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north');
  const oldX=world.x,oldY=world.y;
  // Small substeps prevent passing through narrow collisions or NPCs.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(stepX),Math.abs(stepY))/3));
  for(let i=0;i<steps;i++){
    if(canStand(world,world.x+stepX/steps,world.y))world.x+=stepX/steps;
    if(canStand(world,world.x,world.y+stepY/steps))world.y+=stepY/steps;
  }
  const exit=MAPS[world.map].exit;
  if(world.y>=304&&world.y<=368&&((exit.edge==='east'&&world.x>=932)||(exit.edge==='west'&&world.x<=28))){
    world.map=exit.destination;world.x=exit.spawn.x;world.y=exit.spawn.y;
    if(!world.visited.includes(world.map))world.visited.push(world.map);
    return {moved:true,transition:true};
  }
  return {moved:world.x!==oldX||world.y!==oldY,transition:false};
}

export function nearbyObject(world) {
  return MAPS[world.map].objects.map(object=>({object,distance:Math.hypot(world.x-object.x,world.y-object.y)}))
    .filter(item=>item.distance<=58).sort((a,b)=>a.distance-b.distance)[0]?.object||null;
}

export function questInfo(world) {
  const f=world.flags;
  if(f.reported)return {title:'A road through the dark',text:'You inspected the silent ward and told the caretaker. The courtyard still has its fire. Your journey will continue beyond the approach.',step:4,complete:true};
  if(f.ward)return {title:'Tell the caretaker',text:'Return to the courtyard and share what you found at the unlit ward.',step:3,complete:false};
  if(!f.quest)return {title:'A fire worth keeping',text:'Speak with the caretaker beside the courtyard fire.',step:0,complete:false};
  if(!f.gate)return {title:'Inspect the silent ward',text:'Take the eastern road. Find the mechanism beside the closed gate on the ruined approach.',step:1,complete:false};
  return {title:'Beyond the gate',text:'The gate is open. Examine the unlit ward at the far end of the approach.',step:2,complete:false};
}

// Dialogue is authored local knowledge, not a revelation of the flame's origin.
export function interactWorld(world,game) {
  const object=nearbyObject(world);if(!object)return null;
  const f=world.flags;
  const talk=(speaker,lines,lastLabel='Return',finish=null)=>({id:object.id,speaker,lines,lastLabel,finish});
  switch(object.id){
    case 'caretaker':
      if(f.ward&&!f.reported)return talk('The caretaker',[
        'Cold stone, then. I feared as much. The little wards used to answer the sacred flame. Now more of them fall silent each night.',
        'You opened the road. That matters. People can still reach us while this fire holds.',
        'Rest here a moment. A world does not become hopeless all at once. Neither does it find its hope all at once.',
      ],'Share your findings','report');
      if(f.reported)return talk('The caretaker',['The road is open, and the fire still burns. I will keep it for those who come after you.','You have done what you could here. There are older wards farther into the dark.']);
      if(f.quest)return talk('The caretaker',['Follow the eastern road to the ruined approach. The gate mechanism is on the near side.','Look at the ward beyond it, then tell me what you find. You need not hurry on my account.']);
      return talk('The caretaker',[
        'Come closer. There is still a little warmth here.',
        'They say the sacred flame sustains the world. I cannot tell you why it fades. I only know this fire needs tending more often than it used to.',
        'There is a ward on the eastern approach. It has gone quiet. The old gate can be opened by its mechanism. Would you look, and bring word back?',
      ],"I'll inspect the ward",'accept');
    case 'traveler':return talk('The road traveler',[
      'I have carried this letter through three empty villages. My sister used to live in the fourth.',
      'No prophecy. No grand purpose. I only want to know whether she still leaves a lamp in the window.',
      f.gate?'I heard the gate move. Perhaps I can take the road again. Thank you.':'The road east is barred. If you find the gate mechanism, perhaps there is a way through.',
    ],'Wish them safe travels','traveler');
    case 'chest':
      if(f.chest)return talk('Supply chest',['The chest is empty. You already took the two healing potions left for travelers.']);
      f.chest=true;game.potions+=2;
      return talk('Supplies found',['Beneath a folded cloth: two sealed healing potions. Someone packed them carefully for a journey they never took.','You take the potions. +2 healing potions.']);
    case 'fire':return talk('Courtyard fire',['A small, ordinary fire. Its heat is real even when the world beyond the walls feels impossibly cold.','You watch the embers settle. Time spent here does not hasten the flame’s decline.']);
    case 'sign':return talk('Weathered sign',['EAST — THE OLD WARD ROAD','Someone has scratched beneath it: “If the gate is shut, try the mechanism on the near side.”']);
    case 'inscription':return talk('Worn inscription',['The stone bears a circle around a flame. Beneath it, most of the words have worn away.','Only one sentence remains: “Keep a light for those who return.”']);
    case 'lever':
      if(f.gate)return talk('Gate mechanism',['The chain is taut. The gate remains raised; the path is open.']);
      return talk('Gate mechanism',['An iron chain passes beneath the stone. The lever is stiff, but the mechanism looks intact.'], 'Raise the gate','gate');
    case 'ward':
      f.ward=true;
      return talk('The unlit ward',['The hollow of the ward holds no ember. The stone is cold to the touch.','Red roots have found the cracks around its base. Beside them, you find fresh boot marks. Someone else has been here.','The caretaker should hear what you found. The cause remains a mystery.']);
    default:return null;
  }
}

export function finishWorldDialogue(world,finish) {
  if(finish==='accept'){world.flags.quest=true;world.flags.caretaker=true;}
  if(finish==='traveler')world.flags.traveler=true;
  if(finish==='gate')world.flags.gate=true;
  if(finish==='report'&&world.flags.ward){world.flags.quest=true;world.flags.caretaker=true;world.flags.reported=true;}
}

export function validWorld(world) {
  if(!world||!MAPS[world.map]||!['north','south','east','west'].includes(world.facing)||!world.flags||!Array.isArray(world.visited)||world.visited.length<1||world.visited.length>2||new Set(world.visited).size!==world.visited.length||!world.visited.every(id=>Object.hasOwn(MAPS,id))||!world.visited.includes(world.map))return false;
  if(!Object.keys(createWorld().flags).every(flag=>typeof world.flags[flag]==='boolean'))return false;
  if(world.flags.reported&&(!world.flags.ward||!world.flags.quest||!world.flags.caretaker))return false;
  if(world.flags.ward&&!world.flags.gate)return false;
  if(world.conversation!==null){
    const c=world.conversation;
    if(!c||!MAPS[world.map].objects.some(o=>o.id===c.id)||typeof c.speaker!=='string'||c.speaker.length>80||!Array.isArray(c.lines)||c.lines.length<1||c.lines.length>5||!c.lines.every(line=>typeof line==='string'&&line.length<=500)||!Number.isInteger(c.page)||c.page<0||c.page>=c.lines.length||typeof c.lastLabel!=='string'||c.lastLabel.length>80||![null,'accept','traveler','gate','report'].includes(c.finish))return false;
  }
  return canStand(world,world.x,world.y);
}

export function validAdventureSave(save) {
  if(!save||save.version!==1||!validSave(save.game)||!['intro','preparing'].includes(save.game.status))return false;
  return save.game.status==='intro'?save.world===null:validWorld(save.world);
}
