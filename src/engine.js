import { REGION_ENCOUNTERS } from './encounters.js';
import { activeParty, partyMembers, memberName } from './companions.js';
import { equipmentBonuses, validInventory } from './inventory.js';

export const CLASSES = [
  { id:'knight', name:'Knight', title:'The oathkeeper', role:'Vanguard', hp:145, mp:28, attack:21, skill:'Shield bash', cost:7, description:'Deal 30 damage and weaken the next enemy strike by 45%.', color:'#91acaf', icon:'shield', story:'You swore an oath when the world still had a sun. The steel remembers, even if you do not.' },
  { id:'warrior', name:'Warrior', title:'The bloodbound', role:'Brute', hp:140, mp:28, attack:26, skill:'Rending axe', cost:8, description:'Deliver a devastating axe strike for 44 damage.', color:'#bf7366', icon:'axe', story:'The dark took everything you loved. You have come to collect its debt.' },
  { id:'paladin', name:'Paladin', title:'The last light', role:'Guardian', hp:150, mp:32, attack:19, skill:'Sacred light', cost:9, description:'Deal 24 holy damage and restore 30 of your health.', color:'#d1b777', icon:'sun', story:'The last ember of an ancient faith burns beneath your armor. You will carry it into the dark.' },
  { id:'sorcerer', name:'Sorcerer', title:'The veilwalker', role:'Arcanist', hp:110, mp:40, attack:20, skill:'Soulfire', cost:10, description:'Deal 36 arcane damage. Burns for 8 damage for two turns.', color:'#68bcc0', icon:'spark', story:'You heard a voice between the worlds. Now you descend to discover whose voice it was.' },
  { id:'witch', name:'Witch', title:'The hexweaver', role:'Occultist', hp:120, mp:36, attack:19, skill:'Siphon soul', cost:9, description:'Drain 30 health from the enemy and restore 22 of your own.', color:'#b383af', icon:'moon', story:'You know the old names of things that live below. One of them has started whispering yours.' },
  { id:'gunslinger', name:'Gunslinger', title:'The deadeye', role:'Sharpshooter', hp:125, mp:32, attack:25, skill:'Deadeye shot', cost:9, description:'A perfectly aimed shot deals 42 damage.', color:'#c69c75', icon:'crosshair', story:'One last contract. One last bullet. You have walked away from worse odds. Probably.' },
  { id:'monk', name:'Monk', title:'The unbroken', role:'Disciple', hp:140, mp:34, attack:23, skill:'Inner balance', cost:9, description:'Deal 28 damage and restore 20 health through inner balance.', color:'#8fb09d', icon:'lotus', story:'Your teacher taught you to listen to silence. Beneath the world, something is breaking it.' },
];
export const ENCOUNTERS = [
  {name:'The Weeping Cavern',enemy:'The Watchful Eye',title:'Keeper of the first gate',hp:120,attack:12,reward:75,intent:'Gazing strike',description:'Your footsteps are the only ones. Something beneath the roots has already seen you.',flavor:'Beyond the light, the stone begins to breathe.'},
  {name:'The Crimson Crossing',enemy:'The Rootbound Horror',title:'The hunger below',hp:170,attack:15,reward:120,intent:'Crimson lash',description:'The roots tighten. Every step takes you closer to the heart.',flavor:'The earth remembers every soul it has swallowed.'},
  {name:'Heart of the Hollow',enemy:'The Hollow Mother',title:'The last thing in the dark',hp:220,attack:18,reward:200,intent:'Hollow pulse',description:'The source of the corruption opens its eye. Your journey ends here.',flavor:'You stand where even the old gods feared to tread.'},
];
export function heroStats(hero) {
  const cls=CLASSES.find(c=>c.id===hero.id),gear=equipmentBonuses(hero);
  return {...cls,hp:cls.hp+(hero.level-1)*15,mp:cls.mp+(hero.level-1)*4,attack:cls.attack+(hero.level-1)*3+gear.attack,defense:gear.defense,focusRecovery:3+gear.focus,description:cls.description.replace(/\d+/,value=>String(Number(value)+(hero.level-1)*4))};
}
export function cleanName(value) { return String(value || 'Wanderer').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,24) || 'Wanderer'; }
export function createGame(classId=null,name='Wanderer') {
  const state={version:2,status:'intro',introStep:'story',selectedClass:null,name:cleanName(name),depth:0,round:1,gold:0,potions:3,hero:null,enemy:null,log:[]};
  if(classId!==null) {
    if(!CLASSES.some(c=>c.id===classId)) throw new Error('Choose one of the seven classes.');
    chooseClass(state,classId);
  }
  return state;
}
export function chooseClass(state,classId) {
  const cls=CLASSES.find(c=>c.id===classId);
  if(state.status!=='intro'||!cls) return false;
  state.hero={id:classId,level:1,hp:cls.hp,mp:cls.mp,guard:false};
  state.selectedClass=classId; state.status='preparing';state.introStep='done';
  log(state,`${state.name}, the ${cls.name.toLowerCase()}, stands alone at the mouth of the Hollow.`,'story');
  return true;
}
export function initializeAdventure(state){state.campaign='adventure';state.xp??=0;state.encounterId=null;state.companions??=[];state.activeIds??=[state.hero.id];state.acted=[];return state;}
export function setActiveMember(state,id){
  if(state.status!=='preparing'||id===state.hero.id||!partyMembers(state).some(h=>h.id===id))return false;
  if(state.activeIds.includes(id))state.activeIds=state.activeIds.filter(value=>value!==id);
  else {if(state.activeIds.length>=4)return false;state.activeIds.push(id);}
  return true;
}
export function actor(state) { return state.status!=='battle'?null:state.campaign==='adventure'?activeParty(state).find(h=>h.hp>0&&!state.acted.includes(h.id))||null:state.hero.hp>0?state.hero:null; }
export function encounterHP(state){return Math.round(currentEncounter(state).hp*(state.campaign==='adventure'?1+.7*((state.battleSize||activeParty(state).length)-1):1));}
export function currentEncounter(state) { return state.encounterId ? REGION_ENCOUNTERS[state.encounterId] : ENCOUNTERS[state.depth]; }
export function log(state,text,type='normal') { state.log.push({text,type});if(state.log.length>80) state.log.shift(); }
export function enemyIntent(state) {
  const e=currentEncounter(state),enraged=Boolean(e.boss&&state.enemy&&state.enemy.hp<=state.enemy.maxHp/2),heavy=state.round%(enraged?2:e.heavyEvery||3)===0,shell=Boolean(e.boss&&state.round%4===0);
  return {heavy,shell,enraged,name:heavy?(e.heavyIntent||'Devastating pulse'):e.intent,damage:Math.round(e.attack*(heavy?(e.heavyMultiplier||1.6):1)*(state.campaign==='adventure'?1+.35*((state.battleSize||1)-1):1)),description:shell?'Stone carapace: basic attacks deal 40% less damage this turn. Use an ability.':heavy?'A heavy strike is coming. Guard to absorb it.':enraged?'The warden is enraged. Heavy attacks come every second round.':'The enemy prepares a direct strike.'};
}
export function startEncounter(state,encounterId=null) {
  if(state.status!=='preparing'||!state.hero) return false;
  if(encounterId!==null&&(!REGION_ENCOUNTERS[encounterId]||state.campaign!=='adventure'))return false;
  if(encounterId!==null)state.encounterId=encounterId;
  if(state.campaign==='adventure'){state.battleSize=activeParty(state).length;state.acted=[];activeParty(state).forEach(h=>h.guard=false);}
  const e=currentEncounter(state),hp=encounterHP(state); state.enemy={hp,maxHp:hp,burn:0,weak:false};
  state.status='battle';state.round=1;state.hero.guard=false;
  log(state,`${e.enemy} awakens. You act first.`,'story');return true;
}
function win(state) {
  const e=currentEncounter(state);state.gold+=e.reward;
  state.status=state.campaign==='adventure'?'victory':state.depth===2?'complete':'victory';
  log(state,`${e.enemy} falls. +${e.reward} gold.`,'heal');
}
export function act(state,action,rng=Math.random) {
  if(state.campaign==='adventure')return partyAction(state,action,rng);
  const hero=actor(state);
  if(!hero) return {ok:false,reason:'It is not your turn.'};
  const cls=heroStats(hero);
  if(!['attack','skill','guard','potion'].includes(action)) return {ok:false,reason:'Unknown action.'};
  if(action==='skill'&&hero.mp<cls.cost) return {ok:false,reason:'Not enough focus.'};
  if(action==='potion'&&(state.potions===0||hero.hp===cls.hp)) return {ok:false,reason:state.potions===0?'No potions left.':'Health is already full.'};
  const intent=enemyIntent(state);
  const result={ok:true,damage:0,healed:0,burnDamage:0,enemyDamage:0,heavy:intent.heavy};
  const heal=amount=>{const restored=Math.min(amount,cls.hp-hero.hp);hero.hp+=restored;result.healed+=restored;};
  hero.guard=false;
  if(action==='attack') { result.damage=Math.round((cls.attack+Math.floor(rng()*5))*(intent.shell?.6:1));log(state,`${cls.name} attacks for ${result.damage} damage${intent.shell?' against the stone carapace':''}.`,'damage'); }
  if(action==='guard') {hero.guard=true;hero.mp=Math.min(cls.mp,hero.mp+5);heal(8);log(state,'You brace: 75% less damage, +5 focus, and +8 health.');}
  if(action==='potion') {state.potions--;heal(50);log(state,`You drink a potion. +${result.healed} health.`,'heal');}
  if(action==='skill') {
    hero.mp-=cls.cost;
    const growth=(hero.level-1)*4;
    switch(hero.id) {
      case 'knight':result.damage=30+growth;state.enemy.weak=true;break;
      case 'warrior':result.damage=44+growth;break;
      case 'paladin':result.damage=24+growth;heal(30);break;
      case 'sorcerer':result.damage=36+growth;state.enemy.burn=2;break;
      case 'witch':result.damage=30+growth;heal(22);break;
      case 'gunslinger':result.damage=42+growth;break;
      case 'monk':result.damage=28+growth;heal(20);break;
    }
    log(state,`${cls.skill}: ${result.damage} damage${result.healed?`, +${result.healed} health`:''}${hero.id==='sorcerer'?', soul burning':''}.`,'damage');
  }
  state.enemy.hp=Math.max(0,state.enemy.hp-result.damage);
  if(!state.enemy.hp) {win(state);return result;}
  if(state.enemy.burn>0) {
    result.burnDamage=Math.min(8,state.enemy.hp);state.enemy.hp-=result.burnDamage;state.enemy.burn--;
    log(state,`Soulfire burns for ${result.burnDamage} damage.`,'damage');
  }
  if(!state.enemy.hp) {win(state);return result;}
  result.enemyDamage=Math.max(1,Math.round((intent.damage+Math.floor(rng()*3))*(state.enemy.weak?.55:1)*(hero.guard?.25:1)));
  hero.hp=Math.max(0,hero.hp-result.enemyDamage);state.enemy.weak=false;
  log(state,`${intent.name}: ${cls.name} takes ${result.enemyDamage} damage.`,'enemy');
  if(hero.hp===0) {state.status='defeat';log(state,'Your light fades. The Hollow claims another soul.','enemy');return result;}
  state.round++;hero.mp=Math.min(cls.mp,hero.mp+cls.focusRecovery);
  return result;
}

export function woundedMember(state){return activeParty(state).filter(h=>h.hp<heroStats(h).hp).sort((a,b)=>a.hp/heroStats(a).hp-b.hp/heroStats(b).hp)[0]||null;}
function partyAction(state,action,rng){
  const hero=actor(state);if(!hero)return {ok:false,reason:'It is not your turn.'};
  const cls=heroStats(hero),target=woundedMember(state),intent=enemyIntent(state);
  if(!['attack','skill','guard','potion'].includes(action))return {ok:false,reason:'Unknown action.'};
  if(action==='skill'&&hero.mp<cls.cost)return {ok:false,reason:'Not enough focus.'};
  if(action==='potion'&&(!state.potions||!target))return {ok:false,reason:!state.potions?'No potions left.':'Everyone is at full health.'};
  const result={ok:true,actorId:hero.id,damage:0,healed:0,burnDamage:0,enemyDamage:0,enemyHits:[],heavy:intent.heavy};
  const heal=(member,amount)=>{const restored=Math.min(amount,heroStats(member).hp-member.hp);member.hp+=restored;result.healed+=restored;result.healTargetId=member.id;};
  hero.guard=false;
  if(action==='attack'){result.damage=Math.round((cls.attack+Math.floor(rng()*5))*(intent.shell?.6:1));}
  if(action==='guard'){hero.guard=true;hero.mp=Math.min(cls.mp,hero.mp+5);heal(hero,8);}
  if(action==='potion'){state.potions--;heal(target,50);}
  if(action==='skill'){
    hero.mp-=cls.cost;const growth=(hero.level-1)*4;
    switch(hero.id){
      case 'knight':result.damage=30+growth;state.enemy.weak=true;break;
      case 'warrior':result.damage=44+growth;break;
      case 'paladin':result.damage=24+growth;heal(target||hero,30);break;
      case 'sorcerer':result.damage=36+growth;state.enemy.burn=2;break;
      case 'witch':result.damage=30+growth;heal(hero,22);break;
      case 'gunslinger':result.damage=42+growth;break;
      case 'monk':result.damage=28+growth;heal(hero,20);activeParty(state).forEach(h=>h.mp=Math.min(heroStats(h).mp,h.mp+3));break;
    }
  }
  log(state,`${memberName(state,hero)}: ${action==='skill'?cls.skill:action}${result.damage?`, ${result.damage} damage`:''}${result.healed?`, +${result.healed} health to ${memberName(state,partyMembers(state).find(h=>h.id===result.healTargetId))}`:''}.`,result.damage?'damage':'heal');
  state.enemy.hp=Math.max(0,state.enemy.hp-result.damage);state.acted.push(hero.id);
  if(!state.enemy.hp){win(state);return result;}
  if(actor(state))return result; // Every living member commands a move before the enemy responds.
  if(state.enemy.burn>0){result.burnDamage=Math.min(8,state.enemy.hp);state.enemy.hp-=result.burnDamage;state.enemy.burn--;log(state,`Soulfire burns for ${result.burnDamage} damage.`,'damage');}
  if(!state.enemy.hp){win(state);return result;}
  const living=activeParty(state).filter(h=>h.hp>0),boss=currentEncounter(state).boss;
  const targets=boss&&intent.heavy?living:[living[Math.min(living.length-1,Math.floor(rng()*living.length))]];
  for(const member of targets){const damage=Math.max(1,Math.round((intent.damage+Math.floor(rng()*3))*(state.enemy.weak?.55:1)*(member.guard?.25:1))-heroStats(member).defense);member.hp=Math.max(0,member.hp-damage);result.enemyHits.push({id:member.id,damage});result.enemyDamage+=damage;log(state,`${intent.name}: ${memberName(state,member)} takes ${damage} damage.`,'enemy');}
  state.enemy.weak=false;state.acted=[];
  if(activeParty(state).every(h=>!h.hp)){state.status='defeat';log(state,'The party’s lights fade. The road will have to wait.','enemy');return result;}
  state.round++;activeParty(state).forEach(h=>{h.guard=false;if(h.hp)h.mp=Math.min(heroStats(h).mp,h.mp+heroStats(h).focusRecovery);});return result;
}

export function descend(state) {
  if(state.status!=='victory'||state.campaign==='adventure') return false;
  state.depth++;state.hero.level++;
  const stats=heroStats(state.hero);state.hero.hp=stats.hp;state.hero.mp=stats.mp;state.hero.guard=false;
  state.potions++;state.status='preparing';
  log(state,`You reach a quiet refuge. Level ${state.hero.level}: restored health and focus, stronger attacks, +1 potion.`,'heal');
  return startEncounter(state);
}
export function validSave(s) {
  if(!s||s.version!==2||!['intro','preparing','battle','victory','complete','defeat'].includes(s.status)||typeof s.name!=='string'||s.name!==cleanName(s.name)||!Number.isInteger(s.depth)||s.depth<0||s.depth>2||!Number.isInteger(s.round)||s.round<1||!Number.isInteger(s.gold)||s.gold<0||!Number.isInteger(s.potions)||s.potions<0||!Array.isArray(s.log)||s.log.length>80||!s.log.every(l=>typeof l.text==='string'&&typeof l.type==='string')) return false;
  const adventure=s.campaign==='adventure';
  if(s.campaign!==undefined&&!adventure)return false;
  if(s.encounterId!=null&&(!adventure||!Object.hasOwn(REGION_ENCOUNTERS,s.encounterId)))return false;
  if(adventure&&(!Number.isInteger(s.xp)||s.xp<0||s.depth!==0||s.status==='complete'))return false;
  if(s.status==='intro') return s.hero===null&&s.enemy===null&&s.depth===0&&['story','class'].includes(s.introStep)&&(s.selectedClass===null||CLASSES.some(c=>c.id===s.selectedClass));
  const h=s.hero;
  if(!h||!CLASSES.some(c=>c.id===h.id)||h.id!==s.selectedClass||!Number.isInteger(h.level)||(adventure?(h.level<1||h.level>5):h.level!==s.depth+1)||typeof h.guard!=='boolean') return false;
  if(adventure){
    if(!Array.isArray(s.companions)||s.companions.length>6||!Array.isArray(s.activeIds)||s.activeIds.length<1||s.activeIds.length>4||s.activeIds[0]!==h.id||new Set(s.activeIds).size!==s.activeIds.length||!Array.isArray(s.acted)||new Set(s.acted).size!==s.acted.length)return false;
    const roster=partyMembers(s);if(new Set(roster.map(m=>m?.id)).size!==roster.length||!s.activeIds.every(id=>roster.some(m=>m?.id===id))||!s.acted.every(id=>s.activeIds.includes(id)))return false;
    if(!s.companions.every(m=>m&&CLASSES.some(c=>c.id===m.id)&&m.level===h.level&&typeof m.guard==='boolean'&&Number.isFinite(m.hp)&&m.hp>=0&&m.hp<=heroStats(m).hp&&Number.isFinite(m.mp)&&m.mp>=0&&m.mp<=heroStats(m).mp))return false;
    if(!validInventory(s))return false;
    if(s.status==='preparing'&&s.acted.length)return false;
    if(s.status!=='preparing'&&(!Number.isInteger(s.battleSize)||s.battleSize!==s.activeIds.length))return false;
  }
  const stats=heroStats(h);
  if(!Number.isFinite(h.hp)||h.hp<0||h.hp>stats.hp||!Number.isFinite(h.mp)||h.mp<0||h.mp>stats.mp) return false;
  if(s.status==='preparing') return s.enemy===null&&h.hp>0&&(!adventure||s.encounterId==null);
  if(adventure&&s.encounterId==null)return false;
  if(!s.enemy||!Number.isFinite(s.enemy.hp)||s.enemy.hp<0||s.enemy.maxHp!==encounterHP(s)||s.enemy.hp>s.enemy.maxHp||!Number.isInteger(s.enemy.burn)||s.enemy.burn<0||s.enemy.burn>2||typeof s.enemy.weak!=='boolean') return false;
  if(s.status==='battle') return (adventure?Boolean(actor(s)):h.hp>0)&&s.enemy.hp>0;
  if(s.status==='defeat') return (adventure?activeParty(s).every(m=>m.hp===0):h.hp===0)&&s.enemy.hp>0;
  return (adventure?activeParty(s).some(m=>m.hp>0):h.hp>0)&&s.enemy.hp===0&&(s.status!=='complete'||s.depth===2);
}
