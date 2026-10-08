import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {CLASSES,createGame,initializeAdventure,heroStats} from '../src/engine.js';
import {createWorld,WORLD_SAVE_KEY,beginWorldBattle,validAdventureSave} from '../src/world.js';
import {startChapter} from '../src/chapter.js';
const base='http://127.0.0.1:3113',key=WORLD_SAVE_KEY,errors=[];
const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'3113'},stdio:['ignore','pipe','pipe']});let browser;
function battle(id='knight',gender='male',party=false){
 const game=initializeAdventure(createGame(id,'Ash',gender)),world=createWorld();
 if(party){game.companions=['warrior','paladin','sorcerer'].filter(c=>c!==id).map(id=>{const h={id,level:1,guard:false},stats=heroStats(h);return {...h,hp:stats.hp,mp:stats.mp};});game.activeIds=[id,...game.companions.map(h=>h.id)];}
 Object.assign(world,{map:'forest',x:304,y:368,visited:['courtyard','forest'],grace:64});assert.ok(beginWorldBattle(world,game,'wood-wolf'));return {version:2,game,world};
}
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||['/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{Math.random=()=>0;});await page.goto(base);
 async function load(s,url=base){assert.ok(validAdventureSave(s));if(await page.locator('#world-canvas').count()&&!(await page.locator('dialog[open]').count()))await page.locator('header [data-action="menu"]').click();await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s});await page.goto(url);}
 for(const c of CLASSES)for(const gender of ['male','female']){
   await load(battle(c.id,gender));const sprite=page.locator('.battle-sprite');
   await page.waitForFunction(()=>document.querySelector('.battle-sprite').dataset.row==='0'&&getComputedStyle(document.querySelector('.battle-sprite')).backgroundPositionY!=='0%'||document.querySelector('.battle-sprite').dataset.gender==='male');
   assert.match(await sprite.getAttribute('class'),new RegExp('rear-'+c.id));assert.equal(await sprite.getAttribute('data-row-offset'),gender==='female'?'4':'0');
   const size=await sprite.evaluate(el=>getComputedStyle(el).backgroundSize);assert.equal(size,'600% 800%');
 }
 for(const cls of CLASSES){
   const rows=await page.evaluate(async id=>{const image=new Image();image.src=`/public/assets/battle/${id}.png`;await image.decode();const canvas=document.createElement('canvas');canvas.width=80;canvas.height=80;const ctx=canvas.getContext('2d');return Array.from({length:8},(_,row)=>Array.from({length:6},(_,frame)=>{ctx.clearRect(0,0,80,80);ctx.drawImage(image,frame*image.width/6,row*image.height/8,image.width/6,image.height/8,0,0,80,80);const pixels=ctx.getImageData(0,0,80,80).data;let hash=2166136261,alpha=0,empty=0;for(let i=0;i<pixels.length;i++){hash=Math.imul(hash^pixels[i],16777619);if(i%4===3){alpha+=pixels[i];if(!pixels[i])empty++;}}return {hash,alpha,empty};}));},cls.id);
   for(const row of rows){assert.equal(new Set(row.map(frame=>frame.hash)).size,6,cls.id+' has six distinct poses per action');assert.ok(row.every(frame=>frame.alpha>0&&frame.empty>0),cls.id+' sprites retain transparent padding');}
 }
 await load(battle('knight','female',true));
 async function framing(width){await page.setViewportSize({width,height:1000});const arena=await page.locator('.party-arena').boundingBox(),enemy=await page.locator('.battle-enemy').boundingBox(),hud=await page.locator('.enemy-hud').boundingBox(),heroes=await page.locator('.stage-hero').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
   assert.equal(heroes.length,4);assert.ok(enemy.x+enemy.width/2<heroes[0].x+heroes[0].width/2);
   assert.ok(enemy.y+enemy.height<heroes[0].y+heroes[0].height,'enemy occupies the far field');
   for(let i=0;i<4;i++){const h=heroes[i];assert.ok(h.x>=arena.x&&h.x+h.width<=arena.x+arena.width+1,JSON.stringify({width,arena,h}));assert.ok(h.y+h.height<=arena.y+arena.height-35);if(i){assert.ok(h.x>heroes[i-1].x&&h.y>heroes[i-1].y);}assert.ok(h.y>=hud.y+hud.height||h.x+h.width<=hud.x,'HUD does not cover actors');}
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 for(const width of [1440,390,320])await framing(width);
 await page.screenshot({path:'/tmp/hollow-battle-mobile-new.png',fullPage:true});await framing(1440);await page.locator('.party-arena').screenshot({path:'/tmp/hollow-battle-new.png'});
 const beforeLunge=await page.locator('[data-hero="knight"]').boundingBox();await page.locator('.command[data-action="attack"]').click();await page.waitForFunction(()=>document.querySelector('.performing .frame-sprite')?.dataset.frame==='2');
 assert.equal(await page.locator('.stage-hero.performing').evaluate(el=>getComputedStyle(el).animationName),'rear-lunge');
 assert.notEqual(await page.locator('.stage-hero.performing').evaluate(el=>getComputedStyle(el).transform),'none');
 assert.ok(!(await page.locator('.stage-hero.performing').evaluate(el=>getComputedStyle(el).animationTimingFunction)).includes('steps'));
 assert.ok((await page.locator('[data-hero="knight"]').boundingBox()).x<beforeLunge.x-10,'mirrored Knight advances toward the enemy');
 await page.locator('.arena[data-resolving="false"]').waitFor();
 await load(battle('sorcerer'));await page.locator('.command[data-action="skill"]').click();
 const travel=await page.locator('.move-projectile').evaluate(el=>[parseFloat(el.style.getPropertyValue('--travel-x')),getComputedStyle(el).animationTimingFunction]);assert.ok(travel[0]<0);assert.equal(travel[1],'linear');await page.locator('.arena[data-resolving="false"]').waitFor();
 console.log('PASS: 14 rear-facing identities, diagonal four-person framing, unobstructed mobile HUD, fluid lunge and correctly aimed projectile');
 const game=initializeAdventure(createGame('knight','Ash')),world=startChapter(createWorld(),game);await load({version:2,game,world});await page.locator('.world-loading').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.questTarget==='caretaker');
 assert.match(await page.locator('#guide-hint').innerText(),/caretaker/);await page.locator('#world-canvas').screenshot({path:'/tmp/hollow-world-new.png'});
 await page.locator('#world-canvas').focus();await page.keyboard.press('g');await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.guide==='false');await page.reload();await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.guide==='false');await page.locator('[data-guide-toggle]').click();await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.guide==='true');
 const route={version:2,game,world:structuredClone(world)};route.world.flags.quest=true;route.world.flags.caretaker=true;await load(route);await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.questTarget==='lever');assert.match(await page.locator('#guide-hint').innerText(),/Ruined approach/);
 console.log('PASS: quest marker advances with story, fairy route, keyboard/button toggle and preference persistence');
 const offline=await browser.newPage({reducedMotion:'reduce'}),requests=[];offline.on('pageerror',e=>errors.push(e.message));offline.on('request',r=>{if(r.resourceType()!=='document'&&/^https?:/.test(r.url()))requests.push(r.url());});await offline.goto(`${base}/play.html`);
 const assets=await offline.evaluate(async()=>Promise.all(Object.entries(window.HOLLOW_ASSETS).filter(([path])=>path.includes('/battle/')||path.endsWith('/fairy.png')).map(async([path,url])=>{const image=new Image();image.src=url;await image.decode();return [path,image.width,image.height];})));assert.equal(assets.length,10);assert.ok(assets.every(([,w,h])=>w>0&&h>0));
 await offline.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s:battle('witch','male')});await offline.reload();await offline.locator('.command[data-action="skill"]').click();await offline.locator('.arena[data-resolving="false"]').waitFor();assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
 console.log('PASS: all new embedded artwork decodes and reduced-motion standalone combat works without external requests');
}finally{await browser?.close();server.kill();}
