import { frameRect, silhouette } from './frame-atlas.js';
import { SECOND_TITLE } from './chapter-two.js';
import { guideDestination, guidePath, guideHint } from './guidance.js';
import { characterAppearance } from './sprites.js';
import { chapterTrigger, CHAPTER_TITLE, PUBLIC_LORE } from './chapter.js';
import { MAPS, WORLD_WIDTH, WORLD_HEIGHT, moveWorld, nearbyObject, interactWorld, finishWorldDialogue, questInfo, activeEnemies, nearbyEnemy, expeditionInfo, worldObjects, canStand, FIELD_NODES, mapExits, advanceEnemyPatrols, nearbyInteraction } from './world.js';
import { REGION_ENCOUNTERS } from './encounters.js';
import { COMPANIONS, activeParty, partyMembers } from './companions.js';

function worldEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function locomotionFrame(facing,moving,running,distance,reduced=false,frames=4){const direction={south:0,west:1,north:2,east:3}[facing],stride=frames===6?(running?10:8):(running?14:11);return {row:direction+(moving&&running?4:0),frame:moving&&!reduced?Math.floor(distance/stride)%frames:0,mode:moving?(running?'run':'walk'):'idle'};}

export function renderExploration(game,world,icon,esc) {
  const map=MAPS[world.map],quest=questInfo(world);
  return `<main class="exploration-main"><section class="page-heading"><div><div class="eyebrow">${icon('fire',13)} CHAPTER ${world.chapterTwo?'II':'I'} · ${world.chapterTwo?SECOND_TITLE:world.chapter?CHAPTER_TITLE:'A FIRE WORTH KEEPING'}</div><h1 id="world-title">${map.name}<span class="title-dot">.</span></h1><p id="world-subtitle">${map.subtitle}</p></div><div class="flame-condition">${icon('fire',24)}<span>THE SACRED FLAME<small>Fading, but still alight</small></span></div></section>
  <div class="exploration-layout"><section class="world-column"><div class="world-stage"><canvas id="world-canvas" width="640" height="400" tabindex="0" aria-label="Walkable world. Use arrow keys or WASD to move, and E or Enter to interact. Nearby objects are described below." aria-describedby="world-nearby"></canvas><div class="world-location"><i></i><span id="world-location-name">${map.name}</span></div><div class="world-compass" aria-hidden="true">N<span>✧</span></div><div class="world-toast" role="status"></div><div id="world-dialogue"></div><div class="world-loading">Lighting the road…</div><div class="encounter-transition" role="status"></div></div>
  <div class="world-interaction"><span id="world-nearby" aria-live="polite">Walk closer to someone or something to interact.</span><button class="world-interact-button" data-world-interact disabled><kbd>E</kbd> Interact</button></div>
  <div class="world-controls"><div class="world-dpad" aria-label="Movement controls"><button data-direction="north" aria-label="Move north">↑</button><button data-direction="west" aria-label="Move west">←</button><button data-direction="south" aria-label="Move south">↓</button><button data-direction="east" aria-label="Move east">→</button></div><div><strong>A world waiting to be discovered.</strong><span>WASD / arrows · Shift to run · E to interact · P for menu</span></div><button class="world-interact-button" data-run-toggle aria-pressed="false">Run</button><button class="text-button" data-action="journal">${icon('book',16)}Journal</button></div>
  <div class="explorer-card"><div class="explorer-portrait"> <div class="frame-sprite ${characterAppearance(game.hero.id,game.hero.gender).className}" data-gender="${characterAppearance(game.hero.id,game.hero.gender).gender}" data-rows="${characterAppearance(game.hero.id,game.hero.gender).rows}" role="img" aria-label="${game.hero.id} character"></div></div><div><h3>${esc(game.name)}</h3><span>LEVEL ${game.hero.level} · ${game.hero.id.toUpperCase()}</span></div><div class="explorer-resource">${icon('heart',15)}<strong id="world-health">${game.hero.hp}</strong><span>Health</span></div><div class="explorer-resource">${icon('flask',15)}<strong id="world-potions">${game.potions}</strong><span>Potions</span></div><button class="text-button" data-action="character">Character${icon('chevron',14)}</button></div><div class="overworld-party"><span id="world-party-count">${activeParty(game).length} travelling · ${world.chapter?game.companions.length:partyMembers(game).length} ${world.chapter?'companions recruited':'recruited'}</span><button class="text-button" data-action="party">Manage party ${icon('people',15)}</button></div></section>
  <aside class="world-sidebar"><section class="quest-card"><div class="eyebrow">${icon('flag',14)} YOUR JOURNEY</div><h2 id="world-quest-title">${quest.title}</h2><p id="world-quest-text">${quest.text}</p><div class="quest-progress">${[0,1,2,3,4].map(i=>`<i data-quest-step="${i}" class="${i<=quest.step?'reached':''}"></i>`).join('')}</div><div class="quest-footer"><span id="world-quest-status">${quest.complete?'COMPLETED':'MAIN QUEST'}</span><button class="text-button" data-action="journal">Read journal${icon('book',13)}</button></div></section>
  <section class="quest-card expedition-card"><div class="eyebrow">${icon('flag',14)} BEYOND THE WARD</div><h2 id="expedition-title"></h2><p id="expedition-text"></p><div class="quest-footer"><span id="expedition-status">REGION QUEST</span></div></section><section class="quest-card guide-card"><div class="eyebrow">✦ LUMA · ROAD FAIRY</div><h3>A little light to follow</h3><p id="guide-hint"></p><button data-guide-toggle class="text-button" aria-pressed="true">Hide guidance · G</button><small>Gold diamonds mark your objective. I can show the road, but the choices are yours.</small></section><section class="world-notes"><div class="eyebrow">${icon('map',14)} PLACES & PEOPLE</div><h3>${world.chapterTwo?'Lornwatch and the causeways':'Ember courtyard'}</h3><p>${world.chapterTwo?'Refugees shelter behind the walls. Aldren and Ilyra have duties and reasons of their own.':'A caretaker tends a failing fire. A traveler waits for an open road.'}</p><div class="world-discovery" id="world-discovery">${world.visited.length} of ${world.chapterTwo?11:world.chapter?7:4} places discovered</div><h3>Follow your curiosity</h3><p>${world.chapter?'Speak with neighbors, explore the houses, and follow the shrine road. Open Menu to manage equipment and discovered Wayflames.':'Meet companions on the ward roads. Every class brings its own combat role and a way to investigate the world.'} Crimson marks signal enemies; contact begins a battle.</p><small>The flame changes with the story. Take your time exploring.</small></section>
  <section class="world-prototype"><span class="eyebrow">THE COMBAT PROTOTYPE</span><p>Your seven classes and animated battles are still available.</p><button data-action="prototype">Play combat prototype${icon('arrow',15)}</button></section></aside></div>
  <footer class="page-footer"><span><i></i><span id="world-save-message">Your journey is saved as you explore.</span></span><button data-action="restart">New adventure</button></footer>
  <div class="world-textures" aria-hidden="true">${Object.keys(MAPS).map(id=>`<span class="world-art-${id}"></span>`).join('')}<span class="world-fairy-art"></span><span class="world-npc-art"></span><span class="world-villager-art"></span><span class="world-props-art"></span><span class="world-enemy-art"></span><span class="world-enemy-motions"></span><span class="world-player-atlas locomotion-${game.hero.id} ${characterAppearance(game.hero.id,game.hero.gender).alternate?'locomotion-alt':''}"></span>${COMPANIONS.map(c=>`<span class="world-atlas-${c.id} locomotion-${c.id}"></span>`).join('')}</div></main>`;
}

export function journalContent(world,game=null) {
  const q=questInfo(world),f=world.flags;
  const steps=[['Speak with the caretaker',f.quest],['Open the approach gate',f.gate],['Inspect the unlit ward',f.ward],['Return with your findings',f.reported]];
  return `<div class="eyebrow">CHAPTER ${world.chapterTwo?'II':'I'} · YOUR QUEST JOURNAL</div><h2 id="dialog-title">${world.chapterTwo?SECOND_TITLE:world.chapter?CHAPTER_TITLE:'A fire worth keeping'}<span>.</span></h2><p>${worldEscape(q.text)}</p><ol class="quest-checklist">${steps.map(([text,done])=>`<li class="${done?'done':''}"><span>${done?'✓':'○'}</span>${text}</li>`).join('')}</ol><div class="journal-discoveries"><h3>Discoveries</h3><p>${f.chest?'A supply chest held two healing potions.':'There may be supplies in the courtyard.'}</p>${f.traveler?'<p>A road traveler carries a letter for their missing sister.</p>':''}${f.ward?'<p>The ward holds no ember. Red roots and fresh boot marks mark the ground around it.</p>':''}<h3>Class discoveries</h3>${FIELD_NODES.filter(n=>f[n.id]).map(n=>`<p>${worldEscape(n.name)} · ${worldEscape(n.reward)}</p>`).join('')||'<p>Use your class ability to investigate unusual places.</p>'}<h3>Beyond the ward</h3><p>${worldEscape(expeditionInfo(world).text)}</p><p>${world.cleared.length} threats defeated · ${world.visited.length} places discovered.</p>${game&&!world.chapter?`<h3>Companion leads</h3>${COMPANIONS.filter(c=>c.id!==game.hero.id).map(c=>`<p><b>${c.name}</b> · ${c.map==='courtyard'?'Ember Courtyard':MAPS[c.map].name}. ${game.companions.some(h=>h.id===c.id)?'Travelling with you. '+c.motivation:c.story}</p>`).join('')}`:''}</div><div class="modal-footer"><span>${q.complete?'Local quest complete':'The mystery of the sacred flame remains.'}</span><button class="primary-button" data-action="close">Return</button></div>`;
}

export function mountWorld({root,world,game,onSave,isBlocked,onEncounter,onMenu=()=>{},onChapterComplete=()=>{},onScene=()=>{},onEffect=()=>{}}) {
  const canvas=root.querySelector('#world-canvas'),ctx=canvas.getContext('2d');
  const stage=root.querySelector('.world-stage'),dialogRoot=root.querySelector('#world-dialogue');
  const interactButton=root.querySelector('[data-world-interact]');
  const keys=new Set(),pointers=new Map();
  let disposed=false,raf,lastTime=performance.now(),dirty=false,lastSaved=0,lastNear=null,toastTimer,lastMap=world.map,runToggle=false,animationDistance=0,encounterPending=false;
  const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imageFrom=(selector,property)=>{const value=getComputedStyle(root.querySelector(selector)).getPropertyValue(property).trim(),match=value.match(/^url\(["']?(.*?)["']?\)$/);const image=new Image();if(match)image.src=match[1];return image;};
  const images={...Object.fromEntries(Object.keys(MAPS).map(id=>[id,imageFrom(`.world-art-${id}`,'--world-art')])),npc:imageFrom('.world-npc-art','--world-art'),villagers:imageFrom('.world-villager-art','--world-art'),props:imageFrom('.world-props-art','--world-art'),heroes:Object.fromEntries(COMPANIONS.map(c=>[c.id,imageFrom('.world-atlas-'+c.id,'--locomotion')])),player:imageFrom('.world-player-atlas','--locomotion'),enemies:imageFrom('.world-enemy-art','--world-art'),enemyMotions:imageFrom('.world-enemy-motions','--world-art'),fairy:imageFrom('.world-fairy-art','--world-art')};
  let trail=[],trailDistance=108,guide=null,path=[],lastGuideAt=-Infinity,guideSignature='',fairyPosition=null;
  const guideButton=root.querySelector('[data-guide-toggle]');
  function toggleGuide(){if(blocked())return;world.guideEnabled=world.guideEnabled===false;save();canvas.focus({preventScroll:true});}
  guideButton.addEventListener('click',toggleGuide);
  function seedTrail(){const direction={south:[0,1],north:[0,-1],east:[1,0],west:[-1,0]}[world.facing];trail=[];trailDistance=108;let point={x:world.x,y:world.y},blocked=false;for(let d=0;d<=108;d+=3){const x=world.x-direction[0]*d,y=world.y-direction[1]*d;if(!blocked&&canStand(world,x,y,game))point={x,y};else blocked=true;trail.unshift({...point,facing:world.facing,distance:108-d});}}
  seedTrail();
  ctx.imageSmoothingEnabled=false;
  function resize(){const width=window.innerWidth<=480?480:640;if(canvas.width!==width){canvas.width=width;ctx.imageSmoothingEnabled=false;}}
  resize();window.addEventListener('resize',resize);
  function blocked(){return isBlocked()||Boolean(world.conversation)||encounterPending||document.hidden;}
  function save(){if(disposed)return;onSave();dirty=false;lastSaved=performance.now();}
  function resetInput(){keys.clear();pointers.clear();root.querySelectorAll('[data-direction]').forEach(b=>b.classList.remove('pressed'));if(dirty)save();}
  function updateHUD(){
    const q=questInfo(world),map=MAPS[world.map];onScene(world.map);
    root.querySelector('#world-title').innerHTML=`${worldEscape(map.name)}<span class="title-dot">.</span>`;
    root.querySelector('#world-subtitle').textContent=map.subtitle;
    root.querySelector('#world-location-name').textContent=map.name;
    root.querySelector('#world-quest-title').textContent=q.title;
    root.querySelector('#world-quest-text').textContent=q.text;
    root.querySelector('#world-quest-status').textContent=q.complete?'COMPLETED':'MAIN QUEST';
    root.querySelectorAll('[data-quest-step]').forEach(el=>el.classList.toggle('reached',Number(el.dataset.questStep)<=q.step));
    root.querySelector('#world-discovery').textContent=`${world.visited.length} of ${world.chapterTwo?11:world.chapter?7:4} places discovered`;
    root.querySelector('#world-potions').textContent=game.potions;
    root.querySelector('#world-health').textContent=game.hero.hp;root.querySelector('#world-party-count').textContent=`${activeParty(game).length} travelling · ${world.chapter?game.companions.length:partyMembers(game).length} ${world.chapter?'companions recruited':'recruited'}`;
    const expedition=expeditionInfo(world);root.querySelector('.expedition-card').hidden=Boolean(world.chapter)||(!world.flags.reported&&!world.visited.includes('forest'));root.querySelector('#expedition-title').textContent=expedition.title;root.querySelector('#expedition-text').textContent=expedition.text;root.querySelector('#expedition-status').textContent=expedition.complete?'COMPLETED':'REGION QUEST';
  }
  function toast(text){const el=root.querySelector('.world-toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2500);}
  function renderDialogue(focus=false){
    const c=world.conversation;
    canvas.dataset.scene=c?'dialogue':'exploration';
    if(!c){dialogRoot.innerHTML='';return;}
    const final=c.page===c.lines.length-1;
    dialogRoot.innerHTML=`<section class="explore-dialogue" role="dialog" aria-modal="true" aria-label="${worldEscape(c.speaker)}"><div class="dialogue-heading"><span>${['baker','tavi','skeptic','oryn','harker'].includes(c.id)?`<i class="resident-portrait" style="--portrait:${{baker:0,tavi:1,skeptic:2,oryn:3,harker:2}[c.id]}"></i>`:''}${worldEscape(c.speaker)}</span><small>${c.page+1} / ${c.lines.length}</small></div><p>${worldEscape(c.lines[c.page])}</p><div class="dialogue-actions"><span>E / ENTER TO CONTINUE · ESC TO CLOSE</span><button data-talk-next class="primary-button">${worldEscape(final?c.lastLabel:'Continue')}<span aria-hidden="true">→</span></button></div></section>`;
    if(final&&c.choices){dialogRoot.querySelector('.dialogue-actions').innerHTML=c.choices.map(choice=>`<button class="primary-button" data-talk-choice="${choice.value}">${worldEscape(choice.label)}</button>`).join('');dialogRoot.querySelectorAll('[data-talk-choice]').forEach(b=>b.addEventListener('click',()=>advanceDialogue(b.dataset.talkChoice)));}else dialogRoot.querySelector('[data-talk-next]').addEventListener('click',()=>advanceDialogue());
    if(focus)dialogRoot.querySelector('button').focus({preventScroll:true});
  }
  function interact(){
    if(isBlocked())return;
    if(world.conversation){advanceDialogue();return;}
    const {enemy}=nearbyInteraction(world,game);if(enemy){triggerEncounter(enemy);return;}
    const result=interactWorld(world,game);if(!result)return;
    onEffect('interact');resetInput();world.conversation={...result,page:0};save();updateHUD();renderDialogue(true);
  }
  function advanceDialogue(choice=null){
    const c=world.conversation;if(!c||isBlocked())return;
    if(c.page<c.lines.length-1){c.page++;save();renderDialogue(true);return;}
    if(c.choices&&!c.choices.some(item=>item.value===choice))return;
    const finished=finishWorldDialogue(world,c.finish,game,choice);world.conversation=null;if(finished&&c.finish)onEffect(c.finish==='rest'||c.finish==='second-camp'?'heal':'discover');
    if(finished&&c.finish?.startsWith('field:')){const node=FIELD_NODES.find(n=>n.id===c.id);world.conversation={id:c.id,speaker:c.speaker,lines:[node.reward,`${node.gold?'+'+node.gold+' gold. ':''}${node.potions?'+'+node.potions+' potions. ':''}${node.rest?'Party health and focus restored.':node.focus?'Party focus restored.':''} Discovery recorded in your journal.`],page:0,lastLabel:'Return',finish:null};}
    save();resetInput();updateHUD();renderDialogue(Boolean(world.conversation));if(!world.conversation)canvas.focus({preventScroll:true});
    if(finished?.notice)toast(finished.notice);
    if(c.finish==='shop')onMenu('shop');if(c.finish==='waymap')onMenu('map');if(['chapter-complete','depart-second','second-complete'].includes(c.finish))onChapterComplete();
    if(c.finish==='gate')toast('The chain catches. The gate is open.');
    if(c.finish==='accept')toast('Quest added · Inspect the silent ward');
    if(c.finish==='report')toast('Quest complete · A fire worth keeping');
    if(c.finish?.startsWith('recruit:'))toast(`${COMPANIONS.find(n=>n.id===c.finish.slice(8)).name} joined · Manage your party below`);
    if(c.finish?.startsWith('field:'))toast('Exploration ability used · Discovery recorded');
  }
  function keydown(event){
    if(event.ctrlKey||event.metaKey||event.altKey||event.target.matches('input,textarea,select'))return;
    if(isBlocked())return;
    if(['g','G'].includes(event.key)&&!event.repeat){event.preventDefault();toggleGuide();return;}
    if(event.key==='Shift'){if(!world.conversation)keys.add('run');return;}
    const movement={ArrowUp:'north',w:'north',W:'north',ArrowDown:'south',s:'south',S:'south',ArrowLeft:'west',a:'west',A:'west',ArrowRight:'east',d:'east',D:'east'}[event.key];
    if(movement){event.preventDefault();if(!world.conversation)keys.add(movement);return;}
    if(['e','E','Enter',' '].includes(event.key)&&!event.repeat){
      if(event.target.closest('[data-talk-choice]'))return;
      if(event.target.closest('[data-action]')||(!world.conversation&&event.target.closest('button')))return;
      event.preventDefault();interact();
    }
    if(event.key==='Escape'&&world.conversation){event.preventDefault();world.conversation=null;save();renderDialogue();resetInput();canvas.focus({preventScroll:true});}
    if(event.key==='Tab'&&world.conversation){event.preventDefault();dialogRoot.querySelector('button').focus();}
  }
  function keyup(event){const directions={ArrowUp:'north',w:'north',W:'north',ArrowDown:'south',s:'south',S:'south',ArrowLeft:'west',a:'west',A:'west',ArrowRight:'east',d:'east',D:'east',Shift:'run'};if(directions[event.key])keys.delete(directions[event.key]);if(dirty)save();}
  function pointerdown(event){if(blocked())return;event.preventDefault();const button=event.currentTarget;button.setPointerCapture(event.pointerId);pointers.set(event.pointerId,button.dataset.direction);button.classList.add('pressed');canvas.focus({preventScroll:true});}
  function pointerup(event){pointers.delete(event.pointerId);event.currentTarget.classList.remove('pressed');if(dirty)save();}
  const controlButtons=[...root.querySelectorAll('[data-direction]')];
  controlButtons.forEach(button=>{button.addEventListener('pointerdown',pointerdown);button.addEventListener('pointerup',pointerup);button.addEventListener('pointercancel',pointerup);button.addEventListener('lostpointercapture',pointerup);});
  interactButton.addEventListener('click',interact);
  const runButton=root.querySelector('[data-run-toggle]');
  function toggleRun(){if(blocked())return;runToggle=!runToggle;runButton.setAttribute('aria-pressed',String(runToggle));runButton.textContent=runToggle?'Run on':'Run';canvas.focus({preventScroll:true});}
  runButton.addEventListener('click',toggleRun);
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',resetInput);window.addEventListener('pagehide',resetInput);document.addEventListener('visibilitychange',resetInput);

  function fill(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  function updateGuidance(time){
    const next=guideDestination(world,game),signature=JSON.stringify([world.map,next?.id,next?.target?.id,Math.round(world.x/16),Math.round(world.y/16),world.flags.gate,world.chapter?.sealOpened]);
    if(signature!==guideSignature&&time-lastGuideAt>200||time-lastGuideAt>800){
      if(guide?.map!==next?.map)fairyPosition=null;
      guide=next;guideSignature=signature;lastGuideAt=time;
      path=world.guideEnabled===false?[]:guidePath(world,game,guide);
      root.querySelector('#guide-hint').textContent=guideHint(guide);
    }
    const enabled=world.guideEnabled!==false;
    guideButton.setAttribute('aria-pressed',String(enabled));guideButton.textContent=enabled?'Hide guidance · G':'Show guidance · G';
    canvas.dataset.questTarget=guide?.target?.id||guide?.id||'';canvas.dataset.guide=String(enabled);
    canvas.dataset.guidePath=JSON.stringify(path);
  }
  function drawGuidance(time){
    if(!guide||world.guideEnabled===false||world.conversation)return;
    ctx.save();ctx.strokeStyle='#eccb7755';ctx.lineWidth=2;ctx.setLineDash([2,10]);ctx.beginPath();
    path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
  }
  function drawFairy(time){
    if(!guide||world.guideEnabled===false||world.conversation)return;
    const ground=path[Math.min(4,path.length-1)];
    if(ground){
      fairyPosition??={...ground};
      const x=fairyPosition.x+(ground.x-fairyPosition.x)*.12,y=fairyPosition.y+(ground.y-fairyPosition.y)*.12;
      if(canStand(world,x,y,game))Object.assign(fairyPosition,{x,y});else fairyPosition={...ground};
      const hover=reduce()?0:Math.sin(time/260)*3,fx=fairyPosition.x,fy=fairyPosition.y-39+hover;
      glow(fx,fy,24,'#79d4da36');
      const image=images.fairy;
      if(image.complete&&image.naturalWidth){const sw=image.naturalWidth/6;ctx.drawImage(image,(reduce()?0:Math.floor(time/85)%6)*sw,0,sw,image.naturalHeight,fx-12,fy-24,24,48);}
      else {ctx.fillStyle='#a7ebdf';ctx.beginPath();ctx.ellipse(fx,fy,4,7,0,0,Math.PI*2);ctx.fill();}
    }
    const bob=reduce()?0:Math.sin(time/380)*2,x=guide.x,y=guide.kind==='exit'?guide.y-13:guide.y-72+bob;
    ctx.save();ctx.fillStyle='#f6d38b';ctx.strokeStyle='#172326';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+7,y);ctx.lineTo(x,y+8);ctx.lineTo(x-7,y);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();
  }
  // Anchor actual opaque feet, rather than the padded atlas cell, to the floor.
  const footBounds=new Map();
  function groundBounds(image,sx,sy,sw,sh){
    const key=image.src+':'+sx+':'+sy;if(footBounds.has(key))return footBounds.get(key);
    const sample=document.createElement('canvas');sample.width=Math.ceil(sw);sample.height=Math.ceil(sh);
    const sc=sample.getContext('2d',{willReadFrequently:true});sc.drawImage(image,sx,sy,sw,sh,0,0,sample.width,sample.height);
    const pixels=sc.getImageData(0,0,sample.width,sample.height).data,width=sample.width,height=sample.height;
    const body=silhouette(pixels,width,height);const bounds={top:body.top/height,bottom:body.bottom/height,foot:body.foot/width,left:body.left/width,right:body.right/width};footBounds.set(key,bounds);return bounds;
  }
  function drawGrounded(image,sx,sy,sw,sh,left,ground,width,height){
    const bounds=groundBounds(image,sx,sy,sw,sh),crop=(bounds.bottom-bounds.top)*sh;
    ctx.drawImage(image,sx+bounds.left*sw,sy+bounds.top*sh,(bounds.right-bounds.left)*sw,crop,left+width*(.5-bounds.foot+bounds.left),ground-height*(bounds.bottom-bounds.top),(bounds.right-bounds.left)*width,height*(bounds.bottom-bounds.top));
  }

  function glow(x,y,r,color){const gradient=ctx.createRadialGradient(x,y,2,x,y,r);gradient.addColorStop(0,color);gradient.addColorStop(1,'transparent');ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function shadow(x,y,w=30){ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(x,y,w/2,5,0,0,Math.PI*2);ctx.fill();}
  function flame(x,y,time){const phase=reduce()?0:Math.floor(time/140)%3;fill(x-13,y-7,26,12,'#24201c');fill(x-10,y-11,20,4,'#65503a');fill(x-7,y-25-phase*2,14,17+phase*2,'#b75128');fill(x-4,y-24+phase,8,17-phase,'#e99b43');fill(x-2,y-20,4,10,'#f8d687');glow(x,y-15,90,'#ef992e35');}
  function fallbackMap(map){
    fill(0,0,WORLD_WIDTH,WORLD_HEIGHT,map==='courtyard'?'#393a32':'#302f2a');
    for(let y=0;y<WORLD_HEIGHT;y+=16)for(let x=0;x<WORLD_WIDTH;x+=32){const n=(x*31+y*17)%19;fill(x+(y%32?8:0),y,29,13,['#404137','#444338','#363b34'][n%3]);}
    MAPS[map].blockers.forEach(b=>{fill(b.x,b.y,b.w,b.h,'#171f1c');fill(b.x+3,b.y+3,b.w-6,b.h-6,'#2a302a');});
  }
  function drawObject(object,time){
    const {x,y}=object,kind=object.id==='field-paladin'&&!world.flags[object.id]?'ward':object.kind;
    if(kind==='companion'||kind==='counterpart'){drawCharacter(object.classId,x,y,'south',false,false,0);ctx.fillStyle='#d4be77';ctx.fillRect(x-2,y-66,4,4);return;}
    shadow(x,y,['npc','resident'].includes(kind)?26:34);
    if(kind==='resident'){const size=images.npc.naturalWidth/2;if(size)drawGrounded(images.npc,(object.sprite%2)*size,0,size,images.npc.naturalHeight,x-30,y,60,64);return;}
    if(kind==='cult'||kind==='guardian'){drawEnemy({x,y,encounter:kind==='cult'?'cult-sentinel':'root-warden'},time);return;}
    if(kind==='door'){fill(x-13,y-34,26,35,'#3f3025');fill(x-10,y-30,20,30,'#201c17');fill(x+6,y-15,3,3,'#c9ac6c');return;}
    if(object.id==='second-brace'){const open=world.chapterTwo.brace;fill(x-28,y-10,56,16,open?'#746b50':'#3a3d3e');ctx.fillStyle=open?'#e1c180':'#a59b79';ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText(open?'BRACED':'OATHBRACE',x,y-19);return;}
    if(kind==='rune'||kind==='seal'){fill(x-19,y-30,38,32,'#363d34');ctx.fillStyle=world.chapter.puzzle.includes(object.symbol?.toLowerCase())||world.chapter.sealOpened?'#e1c180':'#a59b79';ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText(object.symbol||'SEAL',x,y-14);if(world.chapter.sealOpened||world.chapter.puzzle.includes(object.symbol?.toLowerCase()))glow(x,y-15,38,'#d7a75c33');return;}
    if(kind==='wayflame'){if(world.chapter.wayflames.includes(world.map))flame(x,y,time);else{fill(x-12,y-24,24,25,'#40473c');fill(x-8,y-20,16,14,'#152018');}return;}
    if(object.id==='sanctuary-light'&&world.chapter.lightRestored||object.id==='second-light'&&world.chapterTwo.restored){flame(x,y,time);glow(x,y-20,175,'#efb75b48');return;}
    if(['chest','fire','lever','ward','stone','sign'].includes(kind)&&images.props.complete&&images.props.naturalWidth){
      const index={chest:(object.id.startsWith('field-')?world.flags[object.id]:object.id==='forest-chest'?world.flags.forestChest:object.id==='second-parcel'?world.chapterTwo.parcel:world.flags.chest)?1:0,fire:2,lever:(object.id==='second-channels'?world.chapterTwo.channels:world.flags.gate)?4:3,ward:5,stone:6,sign:7}[kind];
      const sw=images.props.naturalWidth/4,sh=images.props.naturalHeight/2,size={chest:48,fire:64,lever:56,ward:64,stone:56,sign:56}[kind];
      ctx.drawImage(images.props,(index%4)*sw,Math.floor(index/4)*sh,sw,sh,x-size/2,y-size*.92,size,size);
      if(kind==='fire'){glow(x,y-23,90,'#ef992e35');if(!reduce()){const flicker=.1+Math.sin(time/190)*.025;glow(x,y-23,33,`rgba(255,174,68,${flicker})`);}}
      return;
    }
    if(kind==='npc'){
      if(images.npc.complete&&images.npc.naturalWidth){const size=images.npc.naturalWidth/2;drawGrounded(images.npc,object.sprite*size,0,size,images.npc.naturalHeight,x-32,y,64,64);}
      else{fill(x-9,y-28,18,26,object.sprite?'#633c34':'#827252');fill(x-6,y-37,12,13,'#342a24');fill(x-4,y-30,8,6,'#bca082');fill(x-12,y-12,5,10,'#242821');}
      if(!object.sprite)glow(x-11,y-12,35,'#e7ac412b');
    } else if(kind==='fire')flame(x,y,time);
    else if(kind==='chest'){
      const open=world.flags.chest;fill(x-16,y-16,32,17,'#251b16');fill(x-14,y-14,28,13,'#70512f');fill(x-13,y-15,26,3,'#ad8d52');fill(x-15,y-6,30,3,'#c49b53');fill(x-2,y-11,4,5,'#d1b774');
      if(open){fill(x-16,y-27,32,10,'#4e3925');fill(x-14,y-14,28,6,'#181b17');}else glow(x,y-10,28,'#ccb06817');
    } else if(kind==='lever'){
      fill(x-13,y-9,26,10,'#333c39');fill(x-10,y-17,20,11,'#536058');fill(x-2,y-25,4,18,'#b4a17b');fill(x+(world.flags.gate?-2:-13),y-28,15,5,'#9c5940');
    } else if(kind==='ward'){
      fill(x-17,y-8,34,11,'#343e3a');fill(x-12,y-36,24,30,'#556158');fill(x-9,y-34,18,24,'#303c38');fill(x-5,y-28,10,10,'#17211f');fill(x-9,y-4,18,3,'#893831');
      if(world.flags.ward)glow(x,y-22,34,'#5b858820');
    } else if(kind==='stone'){
      fill(x-15,y-8,30,9,'#313b34');fill(x-11,y-30,22,23,'#515b4b');fill(x-7,y-23,14,2,'#a79970');fill(x-5,y-18,10,2,'#a79970');
    } else{fill(x-2,y-4,4,15,'#4a3825');fill(x-20,y-25,40,20,'#6a5539');fill(x-17,y-22,34,2,'#a58b60');fill(x-13,y-15,26,2,'#352d24');}
  }
  function drawGate(){
    // The painted pillars remain visible; only the movable ironwork is drawn.
    if(world.flags.gate){fill(630,234,3,10,'#82714f');return;}
    fill(624,240,3,194,'#171b18');fill(647,240,3,194,'#171b18');
    fill(625,240,1,194,'#938365');fill(648,240,1,194,'#938365');
    for(let y=245;y<434;y+=14){fill(626,y,22,4,'#292a23');fill(627,y,20,1,'#837759');fill(631,y+4,2,10,'#5c5542');fill(642,y+4,2,10,'#5c5542');fill(631,y+6,2,2,'#916344');}
  }
  function drawHero(time,moving,running){
    const pose=locomotionFrame(world.facing,moving,running,animationDistance,reduce(),characterAppearance(game.hero.id,game.hero.gender).alternate?6:4);
    canvas.dataset.motion=pose.mode;canvas.dataset.animRow=String(pose.row);canvas.dataset.animFrame=String(pose.frame);
    drawCharacter(game.hero.id,world.x,world.y,world.facing,moving,running,animationDistance,true);
    ctx.strokeStyle='#8bdae2';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(world.x,world.y,17,5,0,0,Math.PI*2);ctx.stroke();
  }
  function drawCharacter(id,x,y,facing,moving,running,distance,player=false){
    const alternate=player&&characterAppearance(id,game.hero.gender).alternate,pose=locomotionFrame(facing,moving,running,distance,reduce(),alternate?6:4),image=player?images.player:images.heroes[id];shadow(x,y,29);
    if(image.complete&&image.naturalWidth){const {sx,sy,sw,sh}=frameRect(image,alternate?6:4,alternate?12:8,pose.row+(alternate?4:0),pose.frame);ctx.save();ctx.translate(x,y);if(alternate&&id==='knight'&&facing==='west')ctx.scale(-1,1);ctx.filter='drop-shadow(1px 0 0 #111c20) drop-shadow(-1px 0 0 #111c20) brightness(1.12)';drawGrounded(image,sx,sy,sw,sh,-34,0,68,68);ctx.restore();}
  }
  function followers(){return activeParty(game).slice(1).map((h,i)=>{const distance=trailDistance-(i+1)*36;const point=trail.find(p=>p.distance>=distance)||trail[trail.length-1];return {id:h.id,...point};});}
  function drawEnemy(spawn,time){
    const e=REGION_ENCOUNTERS[spawn.encounter],row={wolf:0,sentinel:4,warden:8}[e.sprite],frame=reduce()?0:Math.floor((spawn.distance||0)/7)%(e.sprite==='wolf'?5:6),size=e.boss?96:e.sprite==='wolf'?70:68;
    shadow(spawn.x,spawn.y,e.boss?46:31);
    const image=images.enemyMotions;
    if(image.complete&&image.naturalWidth){const {sx,sy,sw,sh}=frameRect(image,e.sprite==='wolf'?5:6,12,row,frame);ctx.save();ctx.translate(spawn.x,spawn.y);if(spawn.facing==='east')ctx.scale(-1,1);drawGrounded(image,sx,sy,sw,sh,-size/2,0,size,size);ctx.restore();}
    ctx.fillStyle='#c17760';ctx.fillRect(spawn.x-2,spawn.y-size*.88-7,4,4);
  }
  function draw(time,moving,running){
    const width=canvas.width;
    ctx.clearRect(0,0,width,400);ctx.save();
    const cameraX=Math.max(0,Math.min(WORLD_WIDTH-width,world.x-width/2)),cameraY=Math.max(0,Math.min(WORLD_HEIGHT-400,world.y-210));
    ctx.translate(-Math.round(cameraX),-Math.round(cameraY));
    const mapImage=images[world.map];
    ctx.save();ctx.filter='saturate(.65) brightness(.82)';if(mapImage.complete&&mapImage.naturalWidth){const q=MAPS[world.map].quadrant;if(q===undefined)ctx.drawImage(mapImage,0,0,WORLD_WIDTH,WORLD_HEIGHT);else ctx.drawImage(mapImage,(q%2)*mapImage.naturalWidth/2,Math.floor(q/2)*mapImage.naturalHeight/2,mapImage.naturalWidth/2,mapImage.naturalHeight/2,0,0,WORLD_WIDTH,WORLD_HEIGHT);}else fallbackMap(world.map);ctx.restore();
    if(world.chapterTwo?.restored){const s=world.chapterTwo;if(world.map==='lornwatch')glow(496,272,s.decision==='shelter'?300:160,s.decision==='shelter'?'#efa34c35':'#efa34c18');if(world.map==='greyfen'){if(s.decision==='shelter'){fill(64,480,288,96,'#8c57352b');fill(608,480,288,96,'#8c57352b');}else if(s.decision==='channels'){glow(328,528,110,'#4fc9ce24');glow(648,528,110,'#4fc9ce24');}}}
    drawGuidance(time);
    if(world.chapter?.lightRestored&&world.map==='courtyard'){glow(496,272,240,'#f0b56427');glow(400,304,180,'#f0b5641e');}
    const items=[...worldObjects(world,game).map(object=>({y:object.y,paint:()=>drawObject(object,time)})),...activeEnemies(world).map(enemy=>({y:enemy.y,paint:()=>drawEnemy(enemy,time)})),...followers().map(h=>({y:h.y,paint:()=>drawCharacter(h.id,h.x,h.y,h.facing,moving,running,h.distance)})),{y:world.y,paint:()=>drawHero(time,moving,running)}];
    if(world.map==='approach')items.push({y:448,paint:drawGate});
    if(world.map==='greyfen')items.push({y:368,paint:()=>{fill(914,304,7,64,'#463f32');for(let y=310;y<368;y+=16){fill(908,y,19,5,'#a18454');fill(918,y,3,5,'#bc6654');}}});
    if(world.map==='beacon'&&(!world.chapterTwo.decision||world.chapterTwo.decision==='channels'&&!world.chapterTwo.channels))items.push({y:240,paint:()=>{for(let x=232;x<736;x+=20){fill(x,213,5,35,'#6b6654');fill(x+1,213,2,35,'#c0a572');}fill(224,226,512,5,'#726952');}});
    if(world.map==='greyfen'&&!world.chapterTwo.brace)items.push({y:480,paint:()=>{fill(384,464,192,16,'#132c30');for(let x=392;x<576;x+=24)fill(x,460,8,12,'#9c7053');}});
    items.sort((a,b)=>a.y-b.y).forEach(item=>item.paint());drawFairy(time);
    const near=nearbyObject(world,game);
    if(near&&!world.conversation){ctx.strokeStyle='#ebd495';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(near.x,near.y,22,8,0,0,Math.PI*2);ctx.stroke();ctx.font='11px Georgia';ctx.textAlign='center';const label=near.name;const w=ctx.measureText(label).width;fill(near.x-w/2-5,near.y-84,w+10,17,'#101b1def');ctx.fillStyle='#f1e5c7';ctx.fillText(label,near.x,near.y-72);}
    for(const exit of mapExits(world)){const x=exit.edge==='east'?924:exit.edge==='west'?36:480,y=exit.edge==='north'?39:exit.edge==='south'?607:341;ctx.fillStyle='#d6c490';ctx.font='14px Georgia';ctx.textAlign='center';ctx.fillText({east:'›',west:'‹',north:'⌃',south:'⌄'}[exit.edge],x,y);}
    ctx.restore();
    const vignette=ctx.createRadialGradient(width/2,210,100,width/2,210,width*.6);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#070e12a0');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,400);
    const miniX=width-91;
    ctx.fillStyle='#070d0dbb';ctx.fillRect(miniX,14,75,53);ctx.strokeStyle='#8b816150';ctx.strokeRect(miniX+.5,14.5,75,53);
    MAPS[world.map].blockers.forEach(b=>fill(miniX+4+b.x/15,18+b.y/15,b.w/15,b.h/15,'#556356'));
    activeEnemies(world).forEach(e=>fill(miniX+3+e.x/15,17+e.y/15,2,2,'#c87969'));
    if(guide&&world.guideEnabled!==false)fill(miniX+3+guide.x/15,17+guide.y/15,4,4,'#ffe29a');
    fill(miniX+3+world.x/15,17+world.y/15,3,3,'#7ddbe2');
  }
  function updateNearby(){
    const {enemy,object}=nearbyInteraction(world,game),signature=enemy?.id||object?.id||'';
    if(signature!==lastNear){lastNear=signature;root.querySelector('#world-nearby').textContent=enemy?`${REGION_ENCOUNTERS[enemy.encounter].enemy} · Challenge`:object?`${object.name} · ${['npc','companion'].includes(object.kind)?'Speak':'Examine'}`:'Walk closer to someone or something to interact.';}
    interactButton.disabled=blocked()||(!object&&!enemy);runButton.disabled=blocked();
    canvas.dataset.nearby=signature;canvas.dataset.map=world.map;canvas.dataset.x=world.x.toFixed(2);canvas.dataset.y=world.y.toFixed(2);canvas.dataset.facing=world.facing;canvas.dataset.scene=world.conversation?'dialogue':'exploration';canvas.dataset.gender=characterAppearance(game.hero.id,game.hero.gender).gender;canvas.dataset.enemies=JSON.stringify(activeEnemies(world).map(({id,x,y,facing,distance})=>({id,x,y,facing,distance})));
  }
  function tick(time){
    if(disposed)return;
    const seconds=Math.min(.05,(time-lastTime)/1000);lastTime=time;
    let moving=false,running=false;
    if(!blocked()){
      const pressed=new Set([...keys,...pointers.values()]);
      const dx=Number(pressed.has('east'))-Number(pressed.has('west')),dy=Number(pressed.has('south'))-Number(pressed.has('north'));
      running=runToggle||pressed.has('run');const before={x:world.x,y:world.y};
      const result=moveWorld(world,dx,dy,seconds,running,game);moving=result.moved;animationDistance+=result.transition?0:Math.hypot(world.x-before.x,world.y-before.y);
      if(result.moved&&!result.transition){if(Math.floor(animationDistance/24)!==Math.floor((animationDistance-Math.hypot(world.x-before.x,world.y-before.y))/24))onEffect('step');trailDistance+=Math.hypot(world.x-before.x,world.y-before.y);trail.push({x:world.x,y:world.y,facing:world.facing,distance:trailDistance});if(trail.length>250)trail.shift();}
      const patrolled=advanceEnemyPatrols(world,seconds);
      if(result.moved||patrolled){dirty=true;if(time-lastSaved>1000)save();}
      if(result.transition){seedTrail();animationDistance=0;save();updateHUD();toast(MAPS[world.map].name);resetInput();}
      const contact=world.grace<=0?nearbyEnemy(world):null;if(contact)triggerEncounter(contact);
    }else if(keys.size||pointers.size)resetInput();
    if(lastMap!==world.map){lastMap=world.map;seedTrail();updateHUD();onScene(world.map);}
    if(!blocked()&&world.chapter){const c=chapterTrigger(world);if(c){world.conversation=c;resetInput();save();updateHUD();renderDialogue(true);}}
    updateGuidance(time);updateNearby();draw(time,moving,running);
    root.querySelector('.world-loading').hidden=images[world.map].complete&&Boolean(images[world.map].naturalWidth);
    raf=requestAnimationFrame(tick);
  }
  function triggerEncounter(enemy){if(blocked())return;encounterPending=true;resetInput();stage.classList.add('entering-battle');stage.querySelector('.encounter-transition').textContent=`${REGION_ENCOUNTERS[enemy.encounter].enemy} approaches`;onEncounter(enemy.id);}
  updateHUD();renderDialogue();raf=requestAnimationFrame(tick);
  return {resetInput,destroy(){resetInput();disposed=true;cancelAnimationFrame(raf);clearTimeout(toastTimer);guideButton.removeEventListener('click',toggleGuide);runButton.removeEventListener('click',toggleRun);window.removeEventListener('resize',resize);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',resetInput);window.removeEventListener('pagehide',resetInput);document.removeEventListener('visibilitychange',resetInput);controlButtons.forEach(button=>{button.removeEventListener('pointerdown',pointerdown);button.removeEventListener('pointerup',pointerup);button.removeEventListener('pointercancel',pointerup);button.removeEventListener('lostpointercapture',pointerup);});interactButton.removeEventListener('click',interact);}};
}
