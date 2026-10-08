import { COMPANIONS, hasClass, partyMembers } from './companions.js';
import { heroStats, log } from './engine.js';
import { addItem } from './inventory.js';

export const SECOND_TITLE='Weight of a Promise';
export const SECOND_MAPS={
 lornwatch:{name:'Lornwatch',subtitle:'Refugees behind timber walls. A promise larger than one courtyard.',art:'chapter-two',quadrant:0,blockers:[{x:32,y:32,w:896,h:176},{x:32,y:416,w:896,h:192}],objects:[],exits:[{edge:'west',label:'Ashen Wood',destination:'forest',spawn:{x:880,y:336}},{edge:'east',label:'Greyfen March',destination:'greyfen',spawn:{x:64,y:336}}]},
 greyfen:{name:'Greyfen March',subtitle:'A dry causeway between reeds that no longer bend in the wind.',art:'chapter-two',quadrant:1,blockers:[{x:32,y:32,w:352,h:176},{x:576,y:32,w:352,h:176},{x:32,y:384,w:352,h:224},{x:576,y:384,w:352,h:224},{x:912,y:304,w:16,h:64}],objects:[],exits:[{edge:'west',label:'Lornwatch',destination:'lornwatch',spawn:{x:880,y:336}},{edge:'north',label:'Beacon of Thorns',destination:'beacon',spawn:{x:480,y:560}},{edge:'south',label:'Mourning Hollows',destination:'hollows',spawn:{x:480,y:64}}]},
 hollows:{name:'The Mourning Hollows',subtitle:'Rainwater, old records, and a rite the pilgrims left unfinished.',art:'chapter-two',quadrant:2,blockers:[{x:32,y:32,w:192,h:576},{x:736,y:32,w:192,h:576},{x:224,y:32,w:224,h:64},{x:512,y:32,w:224,h:64}],objects:[],exits:[{edge:'north',label:'Greyfen March',destination:'greyfen',spawn:{x:480,y:560}}]},
 beacon:{name:'The Beacon of Thorns',subtitle:'An ancient guardian stands between the refugees and their last light.',art:'chapter-two',quadrant:3,blockers:[{x:32,y:32,w:192,h:576},{x:736,y:32,w:192,h:576},{x:224,y:32,w:512,h:64}],objects:[],exits:[{edge:'south',label:'Greyfen March',destination:'greyfen',spawn:{x:480,y:64}}]},
};
export const SECOND_LORE={
 lornwatch:{title:'Lornwatch’s petition',source:'Steward Elna, Chapter II',text:'Lornwatch shelters families from the flooded roads. Its sacred beacon has gone cold. The Synod sent medicine and a petition asking the neighbor who restored the courtyard shrine to help.'},
 vanished:{title:'A list of absent villages',source:'Dated pilgrim ledger, Mourning Hollows',text:'Three once-prosperous settlements disappear from the rolls in years when nearby sacred beacons were dedicated. The pages record dates, not a cause. Flooding, failed harvests, and abandoned roads may explain the losses.'},
 tending:{title:'The beacon’s tending rite',source:'Ilyra and a damaged pilgrim inscription',text:'Brace the crossing, kindle the sanctuary cup, and decide how to tend the beacon. Opening the rain channels may ease pressure on the surrounding peat, but limits the warmth reaching Lornwatch.'},
 sentinel:{title:'The Thornbound Sentinel',source:'Your encounter at the Beacon of Thorns',text:'The ancient guardian defended the beacon even against those seeking to restore it. Its thorn shell could be broken by a coordinated sequence of two different class abilities in one party round.'},
};
export const SECOND_CHOICES=[{value:'shelter',label:'Restore full warmth for the refugees.'},{value:'channels',label:'Open the rain channels; share the risk.'},{value:'ration',label:'Ration the beacon; accept a harder winter.'}];
export const SECOND_FINISHES=['depart-second','second-request','second-recruit-knight','second-recruit-paladin','second-brace','second-kindle','second-record','second-choice','second-channels','second-light','second-complete','second-parcel','second-delivery','second-camp','way-lornwatch','way-greyfen','way-beacon'];
export function startSecond(world,game){if(!world.chapter?.completed||world.chapterTwo||game.status!=='preparing')return false;
 world.chapter.endingSeen=true;world.chapterTwo={id:2,requested:false,brace:false,kindled:false,record:false,decision:null,channels:false,restored:false,completed:false,parcel:false,delivered:false,camp:false,trust:[],lore:[]};
 Object.assign(world,{map:'lornwatch',x:480,y:336,facing:'north',grace:64});if(!world.visited.includes('lornwatch'))world.visited.push('lornwatch');world.chapter.wayflames.push('lornwatch');log(game,'Chapter II — Weight of a Promise. A petition from Lornwatch carries the names of families still waiting for warmth.','story');return true;
}
export function secondObjective(world){const s=world.chapterTwo;if(!s)return null;
 if(s.completed)return {phase:'complete',title:SECOND_TITLE,text:'Lornwatch endures, and the cost of your promise remains. Explore the connected roads or return home. The road to Sablewood belongs to Chapter III.',complete:true};
 if(s.restored)return {phase:'return',title:'The weight you carry home',text:'Return to Steward Elna in Lornwatch and hear how the settlement faces the consequences of your decision.'};
 if(world.cleared.includes('thorn-sentinel'))return {phase:'sanctuary',title:'A beacon, and a cost',text:'Tend the brazier at the Beacon of Thorns. Your chosen rite will change conditions around Lornwatch.'};
 if(s.decision&&(!s.channels&&s.decision==='channels'))return {phase:'ruins',title:'Let the rain through',text:'Open the rain-channel sluice in the Mourning Hollows before tending the beacon.'};
 if(s.decision)return {phase:'sanctuary',title:'The Thornbound Sentinel',text:'The beacon gate is open. Face its guardian. Chain two different class abilities within a round to break its thorn shell, and coordinate guards before Thornstorm.'};
 if(!s.requested)return {phase:'settlement',title:'A petition from Lornwatch',text:'Speak to Steward Elna by the petition board. The courtyard’s success has reached people who need help.'};
 if(!s.brace)return {phase:'wilderness',title:'A crossing worth holding',text:'Speak with Aldren in Lornwatch, then brace the broken crossing in Greyfen March with Oathbrace. Your own Knight class can perform the same task.'};
 if(!s.record)return {phase:'ruins',title:'Records beneath the reeds',text:'Follow the southern causeway into the Mourning Hollows. Read the pilgrim ledger to learn the beacon’s tending rite.'};
 if(!s.kindled)return {phase:'ruins',title:'A little warmth to carry',text:'Speak with Ilyra in Lornwatch, then Kindle the sanctuary cup in the Mourning Hollows. Your own Paladin class can perform the rite.'};
 return {phase:'settlement',title:'What will your promise cost?',text:'Return to Steward Elna. Decide how to restore the beacon: protect the refugees now, try the rain channels, or ration its warmth.'};
}
export function secondObjects(world,game){if(!world.chapterTwo)return [];const s=world.chapterTwo;
 const list=[
 {id:'second-steward',map:'lornwatch',kind:'resident',name:'Steward Elna',sprite:0,x:400,y:256},
 {id:'second-knight',map:'lornwatch',kind:'counterpart',classId:'knight',name:'Ser Aldren',x:336,y:352},
 {id:'second-paladin',map:'lornwatch',kind:'counterpart',classId:'paladin',name:'Ilyra',x:624,y:384},
 {id:'second-harker',map:'lornwatch',kind:'resident',name:'Harker',sprite:2,x:720,y:256},
 {id:'second-inn',map:'lornwatch',kind:'fire',name:'Refugee hearth',x:496,y:272},
 {id:'second-parcel',map:'lornwatch',kind:'chest',name:'An undelivered blanket parcel',x:240,y:256},
 {id:'second-brace',map:'greyfen',kind:'seal',name:'Broken crossing',x:480,y:432},
 {id:'second-camp',map:'greyfen',kind:'fire',name:'Causeway camp',x:672,y:336},
 {id:'second-delivery',map:'greyfen',kind:'resident',name:'A stranded family',sprite:1,x:784,y:256},
 {id:'second-road',map:'greyfen',kind:'sign',name:'The Sablewood road',x:848,y:336},
 {id:'second-record',map:'hollows',kind:'stone',name:'Dated pilgrim ledger',x:336,y:256},
 {id:'second-kindle',map:'hollows',kind:'ward',name:'Sanctuary cup',x:624,y:368},
 {id:'second-channels',map:'hollows',kind:'lever',name:'Rain-channel sluice',x:480,y:480},
 {id:'second-light',map:'beacon',kind:'ward',name:'Beacon brazier',x:480,y:192},
 ...['lornwatch','greyfen','beacon'].map((map,i)=>({id:'wayflame-'+map,map,kind:'wayflame',name:'Ancient Wayflame',x:[592,304,640][i],y:[272,256,464][i]}))
 ];
 return list.filter(o=>o.map===world.map&&(o.id!=='second-knight'&&o.id!=='second-paladin'||!game?.companions?.some(h=>h.id===o.classId)));
}
const talk=(o,speaker,lines,label='Return',finish=null,choices)=>({id:o.id,speaker,lines,lastLabel:label,finish,...(choices?{choices}:{})});
function discover(s,id){if(!s.lore.includes(id))s.lore.push(id);}
export function secondInteract(world,game,o){const s=world.chapterTwo;if(!s)return null;
 if(o.id==='second-steward'){
  if(s.completed)return talk(o,o.name,['We remember both the help and the cost. That is what a promise means when people must live with its consequences.','The Sablewood road remains closed while the scouts make it safe. You can still return to the courtyard and the places you have helped.']);
  if(s.restored){const outcome={shelter:'The shelters are warm. Beyond the causeway, the peat has cracked and another garden has failed. We will share our stores with that family.',channels:'The rain channels run again. The peat holds its water, but the beacon barely warms our outer shelters. We must move families closer and work through the winter.',ration:'The beacon burns low. The marsh has not worsened, but some families must leave their homes for shared rooms. There is no celebration without a farewell.'}[s.decision];return talk(o,o.name,[outcome,'You have helped us survive. You have also given us work that cannot be left to a hero. We will do our part. Will you carry this promise onward?'],'Finish Chapter II','second-complete');}
  if(!s.requested)return talk(o,o.name,['Your courtyard’s light reached us as a rumor. Then Sister Oryn sent medicine, and we learned the neighbor in that rumor had a name.','Lornwatch holds refugees whose villages lost their wards. Our Beacon of Thorns has gone cold. Aldren guards the roads; Ilyra tends the sick. Ask them to travel with you.','We need the crossing braced and the old tending rite recovered from the Mourning Hollows. I can offer supplies, not an assurance that this is safe.'],'Accept the petition','second-request');
  if(!s.brace||!s.record||!s.kindled)return talk(o,o.name,[secondObjective(world).text,'Aldren knows how to brace the crossing. Ilyra can kindle the sanctuary cup. If you share their calling, they remain here to protect and heal our people.']);
  if(s.decision)return talk(o,o.name,[secondObjective(world).text,'We will remember what you choose, and help bear what follows.']);
  return talk(o,o.name,['The rite is ready. Ilyra warns that full warmth could dry the nearby peat further. There are families on both sides of that promise.','The old rain channels might protect the marsh, but no one can promise enough warmth for all our shelters. Rationing the beacon would mean crowded rooms and people leaving homes.','Choose a rite. None spares everyone. Whatever you decide, we will help those who pay its cost.'],'Choose the tending rite','second-choice',SECOND_CHOICES);
 }
 if(o.id==='second-knight'||o.id==='second-paladin'){
  const id=o.classId,c=COMPANIONS.find(c=>c.id===id);
  if(!s.requested)return talk(o,c.name,[id==='knight'?'I came north when displaced families began arriving. The road must hold until the last wagon reaches shelter.':'Oryn sent me with medicine. I have used most of it. Elna has a petition for you; hear the people before you decide.']);
  if(game.hero.id===id)return talk(o,c.name,[`We share a calling. ${id==='knight'?'Your Oathbrace can hold the crossing while I protect these families.':'Your Kindle can awaken the sanctuary cup while I remain with the sick.'}`,'We can take different duties without breaking the same promise.']);
  return talk(o,c.name,id==='knight'?['My garrison left when the road became dangerous. The families behind that order did not become less worth protecting.','I will come because there is work to do, not because a shrine has made you my commander. At the crossing, let me hold the stones while you secure the way.']:['I have watched warmth fail in rooms where people prayed faithfully. I still believe the light matters. Faith means doing the useful work beside someone.','I will bring what medicine remains and tend the sanctuary cup. If the beacon answers, we must ask what that warmth costs the people beyond these walls.'],`Invite ${c.name}`,'second-recruit-'+id);
 }
 switch(o.id){
 case 'second-harker':return talk(o,'Harker',['I followed the wagons. A repair is useful wherever the road leaves someone stranded.'],'See supplies','shop');
 case 'second-inn':return talk(o,'The refugee hearth',['A space by the fire is kept for you and your companions. The shelters are shared; so is the work.'],'Rest the party','rest');
 case 'second-parcel':return talk(o,o.name,[s.parcel?'The blanket parcel is already in your care. A family waits on the eastern causeway.':'A bundle carries a family’s name and the mark of the eastern causeway. Harker could not get through the beasts.'],s.parcel?'Return':'Carry the blankets',s.parcel?null:'second-parcel');
 case 'second-delivery':if(s.delivered)return talk(o,o.name,['We have the blankets. That does not repair our home, but it makes tonight possible.',s.restored&&s.decision==='shelter'?'Our garden has dried since the beacon brightened. Elna has promised to share the settlement’s stores.':'We will come into Lornwatch when the causeway is safe.']);return talk(o,o.name,[s.parcel?'You found our parcel. The children have been sleeping under the same coat.':'Our blankets are on a wagon that never arrived. We dare not cross back through those beasts.'],s.parcel?'Give the blankets':'Return',s.parcel?'second-delivery':null);
 case 'second-brace':return talk(o,o.name,[s.brace?'The reinforced stones hold the southern causeway.':hasClass(game,'knight')?'Oathbrace can reinforce the loose crossing. Aldren’s class ability remains available even if he is in reserve.':'A shield-trained oathkeeper could brace these stones. Ask Aldren to travel with you, or use your own Knight calling.'],s.brace||!hasClass(game,'knight')?'Return':'Use Oathbrace',s.brace||!hasClass(game,'knight')?null:'second-brace');
 case 'second-record':return talk(o,o.name,['The ledger lists three prosperous villages. Their names vanish from later pages in the same years that new sacred beacons were dedicated. The dates explain nothing on their own.','A tending note remains: “Hold the crossing. Kindle the cup. The channels may be opened where winter rain still answers.”'],'Record the rite','second-record');
 case 'second-kindle':return talk(o,o.name,[s.kindled?'The sanctuary cup carries a steady ember.':hasClass(game,'paladin')?'Ilyra’s Kindle can shelter an ember in this cup. Your own Paladin calling can do the same.':'The cup needs the practiced touch of a Paladin. Ilyra waits in Lornwatch with medicines and a reason to help.'],s.kindled||!hasClass(game,'paladin')?'Return':'Use Kindle',s.kindled||!hasClass(game,'paladin')?null:'second-kindle');
 case 'second-channels':return talk(o,o.name,[s.channels?'Rainwater passes through the ancient sluice again.':'Opening these channels may help the peat retain rain. It will also limit the warmth carried to Lornwatch.'],s.decision==='channels'&&!s.channels?'Open the sluice':'Return',s.decision==='channels'&&!s.channels?'second-channels':null);
 case 'second-camp':{const aldren=game.companions.some(h=>h.id==='knight'),ilyra=game.companions.some(h=>h.id==='paladin');return talk(o,'Causeway camp',s.camp?['The promise you made feels heavier in the quiet. You rest beside the people who have chosen to travel with you.']:[aldren?'Aldren says, “At the outpost I counted the wagons we saved. I still remember the one we could not reach.”':'You remember Aldren’s warning: protecting a road is also deciding who must wait behind it.',ilyra?'Ilyra says, “Then we remember them together. None of us should be asked to carry all of this alone.”':'You remember Ilyra’s request to tend the light without forgetting the people beyond its reach.','The fire does not answer the difficult questions. You rest beside people who will ask them with you.'],'Rest and listen','second-camp');}
 case 'second-road':return talk(o,'The Sablewood road',['The eastern causeway is closed while scouts search for a safe route. Beyond it lie Veyl Crossing and the older forests.','Chapter III is the next stage of the journey. This road is not yet open.']);
 case 'second-light':if(s.restored)return talk(o,o.name,['The beacon answers the rite you chose. Return to Lornwatch to hear what that means for the people there.']);if(!world.cleared.includes('thorn-sentinel'))return talk(o,o.name,[secondObjective(world).text]);return talk(o,o.name,['You bring the sanctuary cup to the brazier. This is a sacred beacon, not the First Fire itself.','The rite you chose will bring real warmth, and leave a cost for those who live near it.'],'Tend the beacon','second-light');
 default:if(o.id.startsWith('wayflame-')){if(world.map==='beacon'&&!s.restored)return talk(o,o.name,['The marker remains cold until the beacon answers.']);return talk(o,o.name,['This travel marker remembers the roads you have walked.'],world.chapter.wayflames.includes(world.map)?'Open wayflame map':'Awaken Wayflame',world.chapter.wayflames.includes(world.map)?'waymap':'way-'+world.map);}
 }
 return null;
}
export function secondFinish(world,game,finish,choice){if(finish==='depart-second')return startSecond(world,game)?{ok:true,notice:'Chapter II · Weight of a Promise'}:false;const s=world.chapterTwo;if(!s)return null;
 let notice=null;
 switch(finish){
 case 'second-request':s.requested=true;discover(s,'lornwatch');game.potions=Math.max(game.potions,4);break;
 case 'second-recruit-knight':case 'second-recruit-paladin':{const id=finish.slice(15),o=secondObjects(world,game).find(o=>o.classId===id);if(!s.requested||!o||hasClass(game,id)||Math.hypot(world.x-o.x,world.y-o.y)>58)return false;const member={id,level:game.hero.level,guard:false},stats=heroStats(member);Object.assign(member,{hp:stats.hp,mp:stats.mp});game.companions.push(member);addItem(game,'starter-'+id);member.equipment={weapon:'starter-'+id,armor:null,charm:null};if(game.activeIds.length<4)game.activeIds.push(id);notice=`${COMPANIONS.find(c=>c.id===id).name} joins your journey`;log(game,notice,'story');break;}
 case 'second-brace':if(!s.requested||!hasClass(game,'knight')||world.map!=='greyfen')return false;s.brace=true;notice='Oathbrace · The southern crossing holds';break;
 case 'second-record':if(!s.brace||world.map!=='hollows')return false;s.record=true;discover(s,'vanished');discover(s,'tending');break;
 case 'second-kindle':if(!s.record||!hasClass(game,'paladin')||world.map!=='hollows')return false;s.kindled=true;notice='Kindle · The sanctuary cup answers';break;
 case 'second-choice':if(!s.brace||!s.record||!s.kindled||s.decision||!SECOND_CHOICES.some(c=>c.value===choice))return false;s.decision=choice;notice='Your tending rite is recorded. The beacon gate opens.';log(game,`Lornwatch’s promise: ${SECOND_CHOICES.find(c=>c.value===choice).label}`,'story');break;
 case 'second-channels':if(s.decision!=='channels'||world.map!=='hollows')return false;s.channels=true;break;
 case 'second-light':if(!s.decision||s.decision==='channels'&&!s.channels||!world.cleared.includes('thorn-sentinel')||world.map!=='beacon')return false;s.restored=true;discover(s,'sentinel');if(!world.chapter.wayflames.includes('beacon'))world.chapter.wayflames.push('beacon');notice='The beacon answers. Return to Lornwatch.';break;
 case 'second-complete':if(!s.restored||s.completed)return false;s.completed=true;addItem(game,'thorn-signet');game.gold+=60;notice='Chapter II complete · Thorn King’s Signet · 60 gold';log(game,'Chapter II — Weight of a Promise. Lornwatch survives; your chosen cost remains.','story');break;
 case 'second-parcel':if(s.parcel)return false;s.parcel=true;break;
 case 'second-delivery':if(!s.parcel||s.delivered)return false;s.delivered=true;game.potions+=2;game.gold+=25;notice='Blankets delivered · 2 potions · 25 gold';break;
 case 'second-camp':s.camp=true;for(const h of partyMembers(game)){h.hp=heroStats(h).hp;h.mp=heroStats(h).mp;}s.trust=[...new Set([...s.trust,...game.companions.filter(h=>['knight','paladin'].includes(h.id)).map(h=>h.id)])];notice='Party rested · Conversation remembered';break;
 default:if(['way-lornwatch','way-greyfen','way-beacon'].includes(finish)){const map=finish.slice(4);if(world.map!==map||map==='beacon'&&!s.restored)return false;if(!world.chapter.wayflames.includes(map))world.chapter.wayflames.push(map);notice='Wayflame awakened';}else return null;
 }
 return {ok:true,notice};
}
export function secondBlockers(world){const s=world.chapterTwo;if(!s)return [];
 if(world.map==='greyfen'&&!s.brace)return [{x:384,y:464,w:192,h:16}];
 if(world.map==='beacon')return [{x:224,y:32,w:512,h:160},...(!s.decision||s.decision==='channels'&&!s.channels?[{x:224,y:224,w:512,h:16}]:[])];return [];
}
export function secondTarget(world,game){const s=world.chapterTwo;if(!s)return null;let map,id;
 if(s.completed)return null;
 if(s.restored){map='lornwatch';id='second-steward';}
 else if(world.cleared.includes('thorn-sentinel')){map='beacon';id='second-light';}
 else if(s.decision==='channels'&&!s.channels){map='hollows';id='second-channels';}
 else if(s.decision){return {id:'thorn-sentinel',map:'beacon',kind:'enemy',name:'Thornbound Sentinel',x:480,y:320};}
 else if(!s.requested){map='lornwatch';id='second-steward';}
 else if(!s.brace){map=hasClass(game,'knight')?'greyfen':'lornwatch';id=hasClass(game,'knight')?'second-brace':'second-knight';}
 else if(!s.record){map='hollows';id='second-record';}
 else if(!s.kindled){map=hasClass(game,'paladin')?'hollows':'lornwatch';id=hasClass(game,'paladin')?'second-kindle':'second-paladin';}
 else {map='lornwatch';id='second-steward';}
 const o=secondObjects({...world,map},game).find(o=>o.id===id);return o?{...o,map}:null;
}
export function validSecond(world){const s=world.chapterTwo;if(!Array.isArray(world.cleared))return false;if(s===undefined)return !Object.hasOwn(SECOND_MAPS,world.map)&&!world.cleared.some(id=>id.startsWith('greyfen-')||id.startsWith('hollows-')||id==='thorn-sentinel');
 if(!s||s.id!==2||!world.chapter?.completed||!['requested','brace','kindled','record','channels','restored','completed','parcel','delivered','camp'].every(k=>typeof s[k]==='boolean')||![null,'shelter','channels','ration'].includes(s.decision)||!Array.isArray(s.trust)||new Set(s.trust).size!==s.trust.length||!s.trust.every(id=>['knight','paladin'].includes(id))||!Array.isArray(s.lore)||new Set(s.lore).size!==s.lore.length||!s.lore.every(id=>SECOND_LORE[id]))return false;
 return !(s.brace&&!s.requested||s.record&&!s.brace||s.kindled&&!s.record||s.decision&&!s.kindled||s.channels&&s.decision!=='channels'||s.restored&&(!s.decision||!world.cleared.includes('thorn-sentinel')||s.decision==='channels'&&!s.channels)||s.completed&&!s.restored||s.delivered&&!s.parcel||world.cleared.includes('thorn-sentinel')&&(!s.decision||s.decision==='channels'&&!s.channels));
}
