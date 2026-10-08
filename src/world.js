import { ROADHOUSES, nearbyService } from './services.js';
import { ALCHEMIST } from './skills.js';
import { SECOND_MAPS, SECOND_CHOICES } from './chapter-two.js';
import { PATROLS, patrolPose, patrolLength, validPatrols } from './patrols.js';
import { CHAPTER_MAPS, chapterBlockers, chapterObjects, chapterInteract, chapterFinish, chapterObjective, CHAPTER_FINISHES, validChapter, remember } from './chapter.js';
import { addItem } from './inventory.js';
import { validSave, heroStats, startEncounter, log, initializeAdventure } from './engine.js';
import { REGION_ENCOUNTERS } from './encounters.js';
import { COMPANIONS, companionObjects, hasClass, partyMembers, memberName } from './companions.js';

export const WORLD_SAVE_KEY = 'the-hollow-adventure-v2';
export const LEGACY_WORLD_SAVE_KEY = 'the-hollow-adventure-v1';
export const TILE = 32;
export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 640;
export const WALK_SPEED = 112;
export const RUN_SPEED = 184;
export const LEVEL_XP = [0,25,70,150,280];
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
  forest: {
    name:'The Ashen Wood',subtitle:'Old roads, restless roots, and footsteps in the mist.',
    blockers:[rect(1,1,11,6),rect(18,1,11,6),rect(1,14,28,5)],
    objects:[
      {id:'forest-chest',name:'Abandoned travel pack',kind:'chest',x:784,y:416},
      {id:'forest-stone',name:'Pilgrim stone',kind:'stone',x:688,y:256},
      {id:'forest-sign',name:'Shrine road sign',kind:'sign',x:432,y:256},
    ],
    exit:{edge:'west',label:'Ruined approach',destination:'approach',spawn:{x:880,y:336}},
  },
  shrine: {
    name:'The Forsaken Shrine',subtitle:'Something still keeps watch over the empty ward.',
    blockers:[rect(1,1,6,18),rect(23,1,6,18),rect(7,1,16,2)],
    objects:[
      {id:'shrine-altar',name:'Ancient shrine ward',kind:'ward',x:480,y:144},
      {id:'shrine-stone',name:'Scored inscription',kind:'stone',x:688,y:368},
    ],
    exit:{edge:'south',label:'Ashen wood',destination:'forest',spawn:{x:480,y:64}},
  },
};
MAPS.courtyard.exits=[MAPS.courtyard.exit];
MAPS.approach.exits=[MAPS.approach.exit,{edge:'east',label:'Ashen wood',destination:'forest',spawn:{x:64,y:336}}];
MAPS.forest.exits=[MAPS.forest.exit,{edge:'north',label:'Forsaken shrine',destination:'shrine',spawn:{x:480,y:560}}];
MAPS.shrine.exits=[MAPS.shrine.exit];

Object.assign(MAPS,CHAPTER_MAPS,SECOND_MAPS);
MAPS.forest.exits.push({edge:'east',label:'Lornwatch',destination:'lornwatch',spawn:{x:64,y:336},secondOnly:true});
MAPS.shrine.exits.push({edge:'north',label:'Inner sanctuary',destination:'sanctuary',spawn:{x:480,y:560},chapterOnly:true});
export function mapExits(world){return MAPS[world.map].exits.filter(e=>(!e.chapterOnly||world.chapter?.sealOpened)&&(!e.secondOnly||world.chapterTwo));}
export function enemySpawns(world){return ENEMY_SPAWNS.map(e=>({...e,...patrolPose(e.id,world.patrols?.[e.id]||0)})).map(e=>world.chapter&&e.id==='shrine-warden'?{...e,map:'sanctuary'}:e).filter(e=>(!world.chapter||e.id!=='shrine-warden'||world.chapter.ritualSeen)&&(world.chapterTwo||!SECOND_MAPS[e.map])&&(e.id!=='thorn-sentinel'||world.chapterTwo?.decision&&(world.chapterTwo.decision!=='channels'||world.chapterTwo.channels)));}
export const ENEMY_SPAWNS=[
 {id:'hollows-skeleton',map:'hollows',x:304,y:336,encounter:'bone-guard'},
 {id:'hollows-succubus',map:'hollows',x:624,y:240,encounter:'veil-succubus'},
 {id:'greyfen-ogre',map:'greyfen',x:608,y:336,encounter:'marsh-ogre'},
 {id:'greyfen-undead',map:'greyfen',x:352,y:240,encounter:'hollow-undead'},
 {id:'beacon-vampire',map:'beacon',x:624,y:336,encounter:'beacon-vampire'},
  {id:'greyfen-wolf',map:'greyfen',x:352,y:336,encounter:'fen-stalker'},
  {id:'greyfen-fanatic',map:'greyfen',x:672,y:272,encounter:'marsh-fanatic'},
  {id:'hollows-fanatic',map:'hollows',x:480,y:336,encounter:'marsh-fanatic'},
  {id:'thorn-sentinel',map:'beacon',x:480,y:320,encounter:'thorn-sentinel'},
  {id:'wood-wolf',map:'forest',x:304,y:336,encounter:'ash-wolf'},
  {id:'wood-sentinel',map:'forest',x:480,y:160,encounter:'cult-sentinel'},
  {id:'glade-wolf',map:'forest',x:784,y:352,encounter:'ash-wolf'},
  {id:'shrine-warden',map:'shrine',x:480,y:304,encounter:'root-warden'},
];
export function activeEnemies(world){return enemySpawns(world).filter(e=>e.map===world.map&&!world.cleared.includes(e.id));}
export function advanceEnemyPatrols(world,seconds) {
  if(world.battle||world.conversation||!Number.isFinite(seconds)||seconds<=0)return false;
  let changed=false;
  for(const enemy of activeEnemies(world)){
    const distance=((world.patrols?.[enemy.id]||0)+PATROLS[enemy.id].speed*Math.min(seconds,.05))%patrolLength(enemy.id),pose=patrolPose(enemy.id,distance);
    if(!canStand(world,pose.x,pose.y))continue;
    world.patrols??={};world.patrols[enemy.id]=distance;changed=true;
  }
  return changed;
}
export function nearbyEnemy(world,radius=32){return activeEnemies(world).find(e=>Math.hypot(e.x-world.x,e.y-world.y)<=radius)||null;}
export function expeditionInfo(world){
  if(world.chapter)return chapterObjective(world);
  if(world.flags.shrine)return {title:'A witness in the roots',text:'You defeated the shrine guardian and found signs of a recent ritual. The sacred flame’s origin remains unknown.',complete:true};
  if(world.cleared.includes('shrine-warden'))return {title:'Read the shrine ward',text:'The guardian has fallen. Examine the ancient ward at the north end of the shrine.',complete:false};
  if(world.visited.includes('shrine'))return {title:'The shrine guardian',text:'Face the Rootbound Warden. Watch for Rootquake and use abilities against its stone carapace.',complete:false};
  return {title:'Beyond the silent ward',text:'Follow the eastern road into the Ashen Wood. A northern path leads to the forsaken shrine. Enemies roam these roads.',complete:false};
}

export const FIELD_NODES=[
 {id:'field-knight',classId:'knight',map:'shrine',x:288,y:400,kind:'stone',name:'Unstable arch',text:'An arch has fallen across a pilgrim’s satchel. Someone must brace its stones.',reward:'An oath is a promise to bring people home. You hold the arch while retrieving a letter and supplies.',gold:30,potions:1},
 {id:'field-warrior',classId:'warrior',map:'forest',x:240,y:416,kind:'chest',name:'Root-bound cache',text:'Heavy roots bind a forgotten cache. A powerful axe could split them.',reward:'Inside: provisions marked for the fallen hill settlement. The delivery was abandoned before the village fell.',gold:35,potions:1},
 {id:'field-paladin',classId:'paladin',map:'shrine',x:640,y:208,kind:'fire',name:'Forgotten brazier',text:'A little warmth could still answer a paladin’s call.',reward:'The small brazier answers. It cannot restore the sacred flame, but its warmth restores your party.',rest:true},
 {id:'field-sorcerer',classId:'sorcerer',map:'forest',x:720,y:416,kind:'stone',name:'Veiled inscription',text:'Faded letters shimmer beyond an ordinary gaze.',reward:'You lift the veil: “Light travels between the wards.” You record a missing link in the network and recovers a pilgrim’s offering.',gold:25},
 {id:'field-witch',classId:'witch',map:'shrine',x:352,y:208,kind:'chest',name:'Listening roots',text:'These roots recoil from force. Perhaps an old name would persuade them.',reward:'You whisper the old name. The roots uncover medicines hidden by a shrine keeper, and the cruel command etched across their bark.',potions:2},
 {id:'field-gunslinger',classId:'gunslinger',map:'approach',x:736,y:256,kind:'lever',name:'High chain catch',text:'A broken chain catch sits too high to reach. A precise ricochet could release it.',reward:'The shot catches the iron latch. A courier’s pouch drops within reach. You find a route seal from the missing caravan.',gold:40},
 {id:'field-monk',classId:'monk',map:'forest',x:384,y:416,kind:'ward',name:'Restless pool',text:'Ripples obscure the pool’s reflection. It needs a still, patient touch.',reward:'The water settles, revealing a token from the lost monastery delegation. A moment of silence restores everyone’s focus.',focus:true},
];
export function worldObjects(world,game){return [...ROADHOUSES.filter(h=>h.map===world.map),...MAPS[world.map].objects.filter(o=>!world.chapter||o.id!=='shrine-altar'),...(world.chapter&&world.map===ALCHEMIST.map?[ALCHEMIST]:[]),...FIELD_NODES.filter(n=>n.map===world.map&&(!world.chapter||game&&hasClass(game,n.classId))),...(world.chapter?chapterObjects(world,game):game?companionObjects(world,game):[])];}
export function createWorld() {
  return {layoutVersion:2,map:'courtyard',x:464,y:368,facing:'south',conversation:null,cleared:[],battle:null,grace:0,patrols:{},flags:{caretaker:false,traveler:false,chest:false,quest:false,gate:false,ward:false,reported:false,forestChest:false,shrine:false,...Object.fromEntries(FIELD_NODES.map(n=>[n.id,false]))},visited:['courtyard']};
}

// These footprints match the painted furniture and southern doorway. Older
// saves are checked against their original layout before a safe relocation.
export const FLOOR_BLOCKERS = {
  home:[{x:112,y:160,w:136,h:80},{x:578,y:176,w:40,h:32},{x:32,y:480,w:352,h:128},{x:576,y:480,w:352,h:128}],
  supply:[{x:112,y:160,w:136,h:80},{x:578,y:176,w:40,h:32},{x:32,y:480,w:352,h:128},{x:576,y:480,w:352,h:128}],
};
export function canStand(world,x,y,game=null,ignoreResidents=false) {
  if(!MAPS[world.map]||!Number.isFinite(x)||!Number.isFinite(y))return false;
  if(x<24||x>WORLD_WIDTH-24||y<32||y>WORLD_HEIGHT-24)return false;
  const map=MAPS[world.map];
  const blockers=[...(world.layoutVersion===2?FLOOR_BLOCKERS[world.map]||[]:[]),...map.blockers.filter(b=>!(world.chapter&&world.map==='shrine'&&b.y===32&&b.x===224)),...chapterBlockers(world)];
  if(world.chapter&&world.map==='shrine')blockers.push({x:224,y:32,w:224,h:64},{x:512,y:32,w:224,h:64});
  // Openings through the edge walls match the two connected road exits.
  if(x<40&&!mapExits(world).some(e=>e.edge==='west'&&y>=304&&y<=368))return false;
  if(x>WORLD_WIDTH-40&&!mapExits(world).some(e=>e.edge==='east'&&y>=304&&y<=368))return false;
  if(y<40&&!mapExits(world).some(e=>e.edge==='north'&&x>=448&&x<=512))return false;
  if(y>WORLD_HEIGHT-40&&!mapExits(world).some(e=>e.edge==='south'&&x>=448&&x<=512))return false;
  if(world.map==='approach'&&!world.flags.gate)blockers.push({x:624,y:224,w:24,h:224});
  if(blockers.some(b=>x+PLAYER_RADIUS>b.x&&x-PLAYER_RADIUS<b.x+b.w&&y+PLAYER_RADIUS>b.y&&y-PLAYER_RADIUS<b.y+b.h))return false;
  if(!ignoreResidents&&world.layoutVersion===2&&worldObjects(world,game).some(o=>['resident','counterpart','companion'].includes(o.kind)&&Math.hypot(x-o.x,y-o.y)<20))return false;
  if(SECOND_MAPS[world.map]&&worldObjects(world,game).some(o=>['chest','fire','ward','lever','stone','wayflame'].includes(o.kind)&&Math.hypot(x-o.x,y-o.y)<PLAYER_RADIUS+13))return false;
  return !map.objects.filter(o=>!world.chapter||o.id!=='shrine-altar').some(o=>o.kind!=='sign'&&Math.hypot(x-o.x,y-o.y)<PLAYER_RADIUS+(o.kind==='npc'?12:13));
}

export function moveWorld(world,dx,dy,seconds,running=false,game=null) {
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(seconds)||seconds<=0||(!dx&&!dy))return {moved:false,transition:false};
  const length=Math.hypot(dx,dy),dt=Math.min(seconds,.05);
  const speed=running?RUN_SPEED:WALK_SPEED;
  const stepX=dx/length*speed*dt,stepY=dy/length*speed*dt;
  world.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north');
  const oldX=world.x,oldY=world.y;
  // A story unlock can introduce a companion where an older player is standing.
  // Allow stepping away from that overlap while retaining all floor collisions.
  const residents=world.layoutVersion===2?worldObjects(world,game).filter(o=>['resident','counterpart','companion'].includes(o.kind)):[];
  const canStep=(x,y)=>canStand(world,x,y,game)||canStand(world,x,y,game,true)&&residents.some(o=>Math.hypot(world.x-o.x,world.y-o.y)<20)&&residents.every(o=>{
    const before=Math.hypot(world.x-o.x,world.y-o.y),after=Math.hypot(x-o.x,y-o.y);return after>=20||before<20&&after>before;
  });
  // Small substeps prevent passing through narrow collisions or NPCs.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(stepX),Math.abs(stepY))/3));
  for(let i=0;i<steps;i++){
    if(canStep(world.x+stepX/steps,world.y))world.x+=stepX/steps;
    if(canStep(world.x,world.y+stepY/steps))world.y+=stepY/steps;
  }
  world.grace=Math.max(0,world.grace-Math.hypot(world.x-oldX,world.y-oldY));
  const exit=mapExits(world).find(e=>(e.edge==='east'&&world.x>=932&&world.y>=304&&world.y<=368)||(e.edge==='west'&&world.x<=28&&world.y>=304&&world.y<=368)||(e.edge==='north'&&world.y<=36&&world.x>=448&&world.x<=512)||(e.edge==='south'&&world.y>=604&&world.x>=448&&world.x<=512));
  if(exit){
    world.map=exit.destination;world.x=exit.spawn.x;world.y=exit.spawn.y;
    if(!world.visited.includes(world.map))world.visited.push(world.map);world.grace=36;if(world.chapter)world.chapter.phase=chapterObjective(world).phase;
    return {moved:true,transition:true};
  }
  return {moved:world.x!==oldX||world.y!==oldY,transition:false};
}

export function nearbyObject(world,game=null) {
  return worldObjects(world,game).map(object=>({object,distance:Math.hypot(world.x-object.x,world.y-object.y)}))
    .filter(item=>item.distance<=58).sort((a,b)=>a.distance-b.distance)[0]?.object||null;
}

export function nearbyInteraction(world,game=null){
  const enemy=nearbyEnemy(world,58),object=nearbyObject(world,game);
  const distance=target=>target?Math.hypot(target.x-world.x,target.y-world.y):Infinity;
  return distance(enemy)<=distance(object)?{enemy,object:null}:{enemy:null,object};
}

export function questInfo(world) {
  if(world.chapter){const q=chapterObjective(world);return {...q,step:['settlement','wilderness','ruins','sanctuary','return','complete'].indexOf(q.phase)};}
  const f=world.flags;
  if(f.reported)return {title:'A road through the dark',text:'You inspected the silent ward and told the caretaker. The courtyard still has its fire. Your journey will continue beyond the approach.',step:4,complete:true};
  if(f.ward)return {title:'Tell the caretaker',text:'Return to the courtyard and share what you found at the unlit ward.',step:3,complete:false};
  if(!f.quest)return {title:'A fire worth keeping',text:'Speak with the caretaker beside the courtyard fire.',step:0,complete:false};
  if(!f.gate)return {title:'Inspect the silent ward',text:'Take the eastern road. Find the mechanism beside the closed gate on the ruined approach.',step:1,complete:false};
  return {title:'Beyond the gate',text:'The gate is open. Examine the unlit ward at the far end of the approach.',step:2,complete:false};
}

// Dialogue is authored local knowledge, not a revelation of the flame's origin.
export function interactWorld(world,game) {
  const object=nearbyObject(world,game);if(!object)return null;
  if(object.kind==='service')return {id:object.id,speaker:object.host,lines:[`Welcome to ${object.name}. We keep a bed, road supplies, and a small forge for travelers. There is still work worth doing while the wards grow cold.`],lastLabel:'Inn, shop & blacksmith',finish:'services'};
  if(object.id==='alchemist')return {id:object.id,speaker:'Neris Vale',lines:['Harker keeps my bench beside his repairs. I learned alchemy making ward medicine; the same principles can strengthen a calling without changing it.','I teach four techniques for each class. The first lesson is free. Later lessons need practice and reagents. Bring your recruited companions; those resting in reserve can study too.'],lastLabel:'Study techniques',finish:'training'};
  if(world.chapter){const result=chapterInteract(world,game,object);if(result)return result;}
  const f=world.flags;
  const talk=(speaker,lines,lastLabel='Return',finish=null)=>({id:object.id,speaker,lines,lastLabel,finish});
  if(object.kind==='companion'){
    const c=COMPANIONS.find(c=>c.id===object.classId);
    const response=game.hero.id==='paladin'?'A keeper of the light. Then you know why this road matters.':game.hero.id==='witch'?'You hear the older names too. We may understand different parts of the same story.':game.hero.id==='knight'?'Another oathkeeper. We should make sure these people have a road home.':`A ${game.hero.id} on the ward road. We could use your particular talents.`;
    return talk(c.name,[c.join[0],response,c.join[1]],`Invite ${c.name}`,`recruit:${c.id}`);
  }
  const node=FIELD_NODES.find(n=>n.id===object.id);
  if(node){
    const c=COMPANIONS.find(c=>c.id===node.classId);
    if(f[node.id])return talk(node.name,['You have already used this place’s gift. '+node.reward]);
    if(!hasClass(game,node.classId))return talk(node.name,[node.text,`Requires ${c.ability} — recruit a ${node.classId} to investigate. Your own class can also use its exploration ability.`]);
    const owner=partyMembers(game).find(h=>h.id===node.classId);
    return talk(node.name,[node.text,`${memberName(game,owner)} can use ${c.ability}.`],`Use ${c.ability}`,`field:${node.classId}`);
  }
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
    case 'fire':return talk('Courtyard fire',['A small, ordinary fire. Its heat is real even when the world beyond the walls feels impossibly cold.','Rest in its warmth. The caretaker can spare a few supplies for your next journey.'], 'Rest & replenish','rest');
    case 'sign':return talk('Weathered sign',['EAST — THE OLD WARD ROAD','Someone has scratched beneath it: “If the gate is shut, try the mechanism on the near side.”']);
    case 'inscription':return talk('Worn inscription',['The stone bears a circle around a flame. Beneath it, most of the words have worn away.','Only one sentence remains: “Keep a light for those who return.”']);
    case 'lever':
      if(f.gate)return talk('Gate mechanism',['The chain is taut. The gate remains raised; the path is open.']);
      return talk('Gate mechanism',['An iron chain passes beneath the stone. The lever is stiff, but the mechanism looks intact.'], 'Raise the gate','gate');
    case 'ward':
      f.ward=true;
      return talk('The unlit ward',['The hollow of the ward holds no ember. The stone is cold to the touch.','Red roots have found the cracks around its base. Beside them, you find fresh boot marks. Someone else has been here.','The caretaker should hear what you found. The cause remains a mystery.']);
    case 'forest-chest':
      if(f.forestChest)return talk('Abandoned travel pack',['The pack is empty. You already recovered its supplies.']);
      f.forestChest=true;game.potions+=2;game.gold+=20;
      return talk('Supplies recovered',['A torn pack lies beneath the roots. Inside are two healing potions and twenty gold.','You take the supplies. +2 potions, +20 gold.']);
    case 'forest-stone':return talk('Pilgrim stone',['The shrine was once a resting place for those who tended the smaller wards. Its keepers have been gone for years.','A strip of fresh crimson cloth catches on a broken corner. Someone came here much more recently.']);
    case 'forest-sign':return talk('Shrine road sign',['NORTH — THE OLD SHRINE','Something in the wood has clawed through the letters. The northern road is still visible.']);
    case 'shrine-stone':return talk('Scored inscription',['“A ward carries light. A guardian carries duty.”','Someone has cut a second circle into the stone, enclosing the old flame symbol. You do not recognize the mark.']);
    case 'shrine-altar':
      if(!world.cleared.includes('shrine-warden'))return talk('Ancient shrine ward',['The ward is silent. The guardian behind you still bars the shrine. Defeat it before investigating further.']);
      f.shrine=true;
      return talk('Ancient shrine ward',['Ash fills the bowl. Around its edge, fresh marks cross out the ancient flame symbol.','A ritual was performed here. It seems someone wanted the ward to stay dark. This shrine holds a clue, not the answer to the dying flame.','You record the signs. The road beyond this region remains a mystery.']);
    default:return null;
  }
}

export function finishWorldDialogue(world,finish,game=null,choice=null) {
  if(finish==='services')return Boolean(nearbyService({...world,conversation:null},game));
  if(finish==='training')return Boolean(game?.status==='preparing'&&world.map===ALCHEMIST.map&&Math.hypot(world.x-ALCHEMIST.x,world.y-ALCHEMIST.y)<=58);
  if(world.chapter){const result=chapterFinish(world,game,finish,choice);if(result!==null)return result;}

  if(finish==='accept'){world.flags.quest=true;world.flags.caretaker=true;if(world.chapter&&!world.chapter.wayflames.includes('courtyard'))world.chapter.wayflames.push('courtyard');}
  if(finish==='traveler')world.flags.traveler=true;
  if(finish==='gate')world.flags.gate=true;
  if(finish==='report'&&world.flags.ward){world.flags.quest=true;world.flags.caretaker=true;world.flags.reported=true;}
  if(finish==='rest'&&game){partyMembers(game).forEach(h=>{const stats=heroStats(h);h.hp=stats.hp;h.mp=stats.mp;});game.potions=Math.max(3,game.potions);}
  if(finish?.startsWith('recruit:')&&game){
    if(world.chapter)return false;
    const id=finish.slice(8),c=COMPANIONS.find(c=>c.id===id);
    if(!c||c.map!==world.map||!c.unlock(world)||hasClass(game,id)||Math.hypot(world.x-c.x,world.y-c.y)>58)return false;
    if(!game.companions)initializeAdventure(game);
    const member={id,level:game.hero.level,guard:false},stats=heroStats(member);member.hp=stats.hp;member.mp=stats.mp;game.companions.push(member);
    if(game.activeIds.length<4)game.activeIds.push(id);
    log(game,`${c.name}, the ${id}, joins your journey. ${c.motivation}`,'story');return true;
  }
  if(finish?.startsWith('field:')&&game){
    const node=FIELD_NODES.find(n=>n.classId===finish.slice(6));
    if(!node||node.map!==world.map||world.flags[node.id]||!hasClass(game,node.classId)||Math.hypot(world.x-node.x,world.y-node.y)>58)return false;
    world.flags[node.id]=true;game.gold+=node.gold||0;game.potions+=node.potions||0;
    if(node.rest||node.focus)partyMembers(game).forEach(h=>{const stats=heroStats(h);h.mp=stats.mp;if(node.rest)h.hp=stats.hp;});
    log(game,`${COMPANIONS.find(c=>c.id===node.classId).ability}: ${node.reward}`,'story');return true;
  }
}

export function beginWorldBattle(world,game,spawnId){
  const spawn=enemySpawns(world).find(e=>e.id===spawnId);
  if(!spawn||world.battle||world.conversation||game.status!=='preparing'||spawn.map!==world.map||world.cleared.includes(spawnId)||Math.hypot(spawn.x-world.x,spawn.y-world.y)>58)return false;
  if(!game.companions)initializeAdventure(game);
  const returnTo={map:world.map,x:world.x,y:world.y,facing:world.facing};
  if(!startEncounter(game,spawn.encounter))return false;
  world.battle={spawnId,returnTo};return true;
}

export function finishWorldBattle(world,game,result){
  if(!world.battle)return false;
  const spawn=enemySpawns(world).find(e=>e.id===world.battle.spawnId),encounter=REGION_ENCOUNTERS[spawn.encounter];
  if(result==='victory'&&game.status!=='victory')return false;
  if(result==='defeat'&&game.status!=='defeat')return false;
  if(result==='retreat'&&game.status!=='battle')return false;
  if(!['victory','defeat','retreat'].includes(result))return false;
  if(result==='victory'){
    if(world.cleared.includes(spawn.id))return false;
    world.cleared.push(spawn.id);game.xp+=encounter.xp;if(world.chapter&&spawn.id==='shrine-warden'){addItem(game,'ember-glass');remember(world,'warden');}
    const oldLevel=game.hero.level,level=LEVEL_XP.filter(xp=>game.xp>=xp).length;
    partyMembers(game).forEach(h=>{const old=heroStats(h);h.level=level;const stats=heroStats(h);h.hp=Math.min(stats.hp,Math.max(1,h.hp)+(stats.hp-old.hp)+Math.round(stats.hp*.2));h.mp=Math.min(stats.mp,h.mp+(stats.mp-old.mp)+8);});
    log(game,`+${encounter.xp} experience.${level>oldLevel?` Level ${level}!`:''} You catch your breath and recover some health and focus.`,'heal');
  }
  Object.assign(world,world.battle.returnTo);world.grace=result==='retreat'?96:64;
  if(result==='defeat'){Object.assign(world,{map:'courtyard',x:464,y:368,facing:'south'});partyMembers(game).forEach(h=>{const stats=heroStats(h);h.hp=stats.hp;h.mp=stats.mp;});game.potions=Math.max(game.potions,3);log(game,'The caretaker finds you on the road. You recover at the courtyard fire. The enemy still waits.','story');}
  world.battle=null;game.status='preparing';game.enemy=null;game.encounterId=null;partyMembers(game).forEach(h=>{h.guard=false;if(!h.hp)h.hp=1;});game.acted=[];game.partyWard=false;game.round=1;
  return true;
}

export function validWorld(world,game=null) {
  if(!world||![undefined,2].includes(world.layoutVersion)||![undefined,true,false].includes(world.guideEnabled)||!validPatrols(world.patrols)||!validChapter(world)||!MAPS[world.map]||!['north','south','east','west'].includes(world.facing)||!world.flags||!Array.isArray(world.visited)||world.visited.length<1||world.visited.length>Object.keys(MAPS).length||new Set(world.visited).size!==world.visited.length||!world.visited.every(id=>Object.hasOwn(MAPS,id))||!world.visited.includes(world.map))return false;
  if(!Array.isArray(world.cleared)||new Set(world.cleared).size!==world.cleared.length||!world.cleared.every(id=>ENEMY_SPAWNS.some(e=>e.id===id))||!Number.isFinite(world.grace)||world.grace<0||world.grace>96)return false;
  if(world.flags.shrine&&!world.cleared.includes('shrine-warden'))return false;
  if(!Object.keys(createWorld().flags).every(flag=>typeof world.flags[flag]==='boolean'))return false;
  if(world.flags.reported&&(!world.flags.ward||!world.flags.quest||!world.flags.caretaker))return false;
  if(world.flags.ward&&!world.flags.gate)return false;
  if(world.conversation!==null){
    const c=world.conversation;
    if(c?.choices){const values=c.finish==='resolve'&&c.id==='caretaker'?['people','act','try']:c.finish==='second-choice'&&c.id==='second-steward'?SECOND_CHOICES.map(c=>c.value):null;if(!values||!Array.isArray(c.choices)||c.choices.length!==3||!c.choices.every((item,i)=>item.value===values[i]&&typeof item.label==='string'&&item.label.length<=120))return false;}
    if(!c||!([...ROADHOUSES.filter(h=>h.map===world.map),...MAPS[world.map].objects,...FIELD_NODES.filter(n=>n.map===world.map),...COMPANIONS.filter(n=>n.map===world.map).map(n=>({id:'companion-'+n.id})),...chapterObjects(world,{companions:[]}),...(world.chapter&&world.map===ALCHEMIST.map?[ALCHEMIST]:[])].some(o=>o.id===c.id))||typeof c.speaker!=='string'||c.speaker.length>80||!Array.isArray(c.lines)||c.lines.length<1||c.lines.length>5||!c.lines.every(line=>typeof line==='string'&&line.length<=500)||!Number.isInteger(c.page)||c.page<0||c.page>=c.lines.length||typeof c.lastLabel!=='string'||c.lastLabel.length>80||![null,...CHAPTER_FINISHES,'training','services','accept','traveler','gate','report','rest',...COMPANIONS.flatMap(n=>['recruit:'+n.id,'field:'+n.id])].includes(c.finish))return false;
  }
  return canStand(world,world.x,world.y,game);
}

export function validAdventureSave(save) {
  if(!save||save.version!==2||!validSave(save.game))return false;
  if(save.game.status==='intro')return save.world===null&&(save.game.cinematicSeen===undefined||typeof save.game.cinematicSeen==='boolean')&&(save.game.cinematicPage===undefined||Number.isInteger(save.game.cinematicPage)&&save.game.cinematicPage>=0&&save.game.cinematicPage<=3);
  if(save.game.campaign!=='adventure'||!validWorld(save.world,save.game))return false;
  if(save.world.chapter&&(!save.game.chapterEdition||!save.game.inventory||save.world.chapter.technique&&!save.game.inventory.includes('veilglass-mirror')||save.world.chapter.cloak&&!save.game.inventory.includes('mended-cloak')))return false;
  if(save.world.conversation?.finish?.startsWith('recruit:')){if(save.world.chapter)return false;const id=save.world.conversation.finish.slice(8),c=COMPANIONS.find(c=>c.id===id);if(hasClass(save.game,id)||c.map!==save.world.map||!c.unlock(save.world)||save.world.conversation.id!=='companion-'+id)return false;}
  if(save.world.conversation?.finish?.startsWith('field:')){const id=save.world.conversation.finish.slice(6),n=FIELD_NODES.find(n=>n.classId===id);if(!hasClass(save.game,id)||n.map!==save.world.map||save.world.flags[n.id]||save.world.conversation.id!==n.id)return false;}
  if(save.game.hero.level!==LEVEL_XP.filter(xp=>save.game.xp>=xp).length)return false;
  if(save.game.status==='preparing')return save.world.battle===null;
  const battle=save.world.battle,spawn=enemySpawns(save.world).find(e=>e.id===battle?.spawnId);
  if(!spawn||spawn.encounter!==save.game.encounterId||spawn.map!==save.world.map||save.world.cleared.includes(spawn.id)||save.world.conversation)return false;
  const r=battle.returnTo;
  return r&&r.map===spawn.map&&['north','south','east','west'].includes(r.facing)&&canStand({...save.world,map:r.map},r.x,r.y,save.game);
}

export function migrateAdventureSave(save){
  if(validAdventureSave(save)){
    const copy=structuredClone(save);
    if(copy.world&&copy.world.layoutVersion!==2){
      copy.world.layoutVersion=2;
      const relocate=position=>{
        const area={...copy.world,map:position.map};
        if(canStand(area,position.x,position.y,copy.game))return;
        // Search outward from the old feet position, preserving nearby context.
        for(let radius=4;radius<=960;radius+=4)for(let angle=0;angle<32;angle++){
          const x=position.x+Math.cos(angle*Math.PI/16)*radius,y=position.y+Math.sin(angle*Math.PI/16)*radius;
          if(canStand(area,x,y,copy.game)){position.x=x;position.y=y;return;}
        }
      };
      relocate(copy.world);if(copy.world.battle)relocate(copy.world.battle.returnTo);
    }
    return validAdventureSave(copy)?copy:null;
  }
  if(save?.version!==1||!validSave(save.game)||!['intro','preparing'].includes(save.game.status))return null;
  const migrated=structuredClone(save);migrated.version=2;
  if(save.game.status==='intro'){if(save.world!==null)return null;return migrated;}
  if(!save.world||!['courtyard','approach'].includes(save.world.map))return null;
  migrated.world={...createWorld(),...migrated.world,flags:{...createWorld().flags,...migrated.world.flags}};
  initializeAdventure(migrated.game);
  return validAdventureSave(migrated)?migrated:null;
}
