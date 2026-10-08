import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {CLASSES,createGame,initializeAdventure} from '../src/engine.js';
import {ORIGINAL_GENDER} from '../src/sprites.js';
import {createWorld,WORLD_SAVE_KEY,beginWorldBattle,validAdventureSave} from '../src/world.js';
const base='http://127.0.0.1:3111',key=WORLD_SAVE_KEY,errors=[];
const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'3111'},stdio:['ignore','pipe','pipe']});let browser;
const fixture=(id='knight',gender='female')=>({version:2,game:initializeAdventure(createGame(id,'Ash',gender)),world:createWorld()});
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited ${code}`)));});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||['/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});await page.addInitScript(()=>{Math.random=()=>0;});await page.goto(base);
 const saved=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 // Pause and flush the live world before injecting a fixture; patrol autosave also runs on pagehide.
 async function load(s,url=base){assert.ok(validAdventureSave(s));if(await page.locator('#world-canvas').count()&&!(await page.locator('dialog[open]').count()))await page.locator('header [data-action="menu"]').click();await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s});await page.goto(url);if(s.game.status==='preparing')await page.locator('.world-loading').waitFor({state:'hidden'});}
 // Both options for all classes exercise real UI previews, acceptance, reload and movement.
 for(const cls of CLASSES){const genderHashes=[];for(const gender of ['male','female']){
  const intro=createGame();intro.cinematicSeen=true;intro.introStep='class';await load({version:2,game:intro,world:null});
  await page.locator(`button[data-action="choose-class"][data-class="${cls.id}"]`).click();await page.locator(`button[data-action="choose-gender"][data-gender="${gender}"]`).click();
  assert.equal(await page.locator('.preview-sprite').getAttribute('data-gender'),gender);genderHashes.push(await page.locator('.preview-sprite').screenshot());
  for(const [action,row] of [['attack',1],['guard',2],['skill',3]]){
   await page.locator(`[data-action="preview"][data-move="${action}"]`).click();await page.waitForFunction(row=>{const s=document.querySelector('.preview-sprite');return Number(s.dataset.row)===row&&Number(s.dataset.frame)>=1;},row);
   const early=await page.locator('.preview-sprite').screenshot();await page.waitForFunction(row=>{const s=document.querySelector('.preview-sprite');return Number(s.dataset.row)===row&&Number(s.dataset.frame)>=3;},row);assert.notDeepEqual(await page.locator('.preview-sprite').screenshot(),early);await page.locator('.preview-stage[data-resolving="false"]').waitFor();
  }
  await page.locator('[data-action="accept-class"]').click();await page.locator('.world-loading').waitFor({state:'hidden'});assert.equal((await saved()).game.hero.gender,gender);await page.reload();await page.locator('.world-loading').waitFor({state:'hidden'});
  assert.equal(await page.locator('#world-canvas').getAttribute('data-gender'),gender);await page.locator('#world-canvas').focus();await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.motion==='walk');await page.keyboard.down('Shift');await page.waitForFunction(()=>document.querySelector('#world-canvas').dataset.motion==='run');await page.keyboard.up('Shift');await page.keyboard.up('ArrowDown');
  await page.keyboard.press('p');await page.locator('[data-action="menu-tab"][data-tab="character"]').click();assert.equal(await page.locator('dialog .frame-sprite').getAttribute('data-gender'),gender);await page.keyboard.press('Escape');
  if(gender!==ORIGINAL_GENDER[cls.id]){
   const result=await page.evaluate(async id=>{const image=new Image();image.src=`/public/assets/alternates/${id}.png`;await image.decode();const canvas=document.createElement('canvas');canvas.width=72;canvas.height=72;const ctx=canvas.getContext('2d');const rows=[];for(let row=0;row<12;row++){const hashes=[];for(let frame=0;frame<6;frame++){ctx.clearRect(0,0,72,72);ctx.drawImage(image,frame*image.width/6,row*image.height/12,image.width/6,image.height/12,0,0,72,72);const bytes=ctx.getImageData(0,0,72,72).data;let hash=2166136261,alpha=0,empty=0;for(let i=0;i<bytes.length;i++){hash=Math.imul(hash^bytes[i],16777619);if(i%4===3){alpha+=bytes[i];if(bytes[i]===0)empty++;}}hashes.push({hash,alpha,empty});}rows.push(hashes);}return rows;},cls.id);
   assert.ok(result.every(row=>new Set(row.map(p=>p.hash)).size===6&&row.every(p=>p.alpha>1000&&p.empty>100)),`${cls.id}: all 72 poses distinct, populated and transparent`);
  }
 }
 assert.notDeepEqual(genderHashes[0],genderHashes[1]);console.log(`PASS: ${cls.name} male/female intro, three preview animations, persistent appearance, walk/run, and menu`);
 }
 // Real-time patrol positions, corners, freezing, and save/reload.
 const road=fixture();Object.assign(road.world,{map:'forest',x:688,y:288,visited:['courtyard','forest'],grace:64});road.world.patrols={'wood-wolf':95,'wood-sentinel':10,'glade-wolf':10};await load(road);
 const enemies=()=>page.locator('#world-canvas').evaluate(c=>JSON.parse(c.dataset.enemies));const before=await enemies();await page.waitForFunction(()=>JSON.parse(document.querySelector('#world-canvas').dataset.enemies).find(e=>e.id==='wood-wolf').facing==='south');await page.waitForTimeout(500);assert.notDeepEqual(await enemies(),before);
 await page.locator('#world-canvas').focus();await page.keyboard.press('p');const paused=await enemies();await page.waitForTimeout(450);assert.deepEqual(await enemies(),paused);const pausedSave=await saved();assert.ok(pausedSave.world.patrols['wood-wolf']>95);await page.keyboard.press('Escape');await page.reload();await page.locator('.world-loading').waitFor({state:'hidden'});assert.ok((await enemies()).find(e=>e.id==='wood-wolf').distance>=pausedSave.world.patrols['wood-wolf']);
 const dialogue=fixture();Object.assign(dialogue.world,{map:'forest',x:432,y:288,visited:['courtyard','forest'],grace:64});await load(dialogue);await page.locator('#world-canvas').focus();await page.keyboard.press('e');await page.locator('.explore-dialogue').waitFor();const talking=await enemies();await page.waitForTimeout(400);assert.deepEqual(await enemies(),talking);
 // An enemy walks into a stationary player, triggering the normal battle transition.
 const contact=fixture();Object.assign(contact.world,{map:'forest',x:400,y:336,visited:['courtyard','forest'],grace:0});contact.world.patrols={'wood-wolf':60};await load(contact);await page.locator('.party-arena').waitFor();assert.equal((await saved()).world.battle.spawnId,'wood-wolf');console.log('PASS: moving patrol corner, pause/dialogue freeze, route persistence, and moving-enemy contact');
 // Unique normal/heavy/death sequences on every actual adventure enemy.
 for(const [spawnId,map,type] of [['wood-wolf','forest','wolf'],['wood-sentinel','forest','sentinel'],['shrine-warden','shrine','warden']]){
  for(const action of ['attack','heavy','death']){
   const s=fixture('monk','female');Object.assign(s.world,{map,visited:['courtyard',map]});const point={wolf:[304,368],sentinel:[480,192],warden:[480,336]}[type];[s.world.x,s.world.y]=point;assert.ok(beginWorldBattle(s.world,s.game,spawnId));if(action==='heavy')s.game.round=3;if(action==='death')s.game.enemy.hp=1;await load(s);
   await page.locator('.command[data-action="attack"]').click();await page.locator(`.battle-enemy[data-move="${action}"]`).waitFor();assert.equal(await page.locator('.command:disabled').count(),4);assert.equal((await saved()).game.round,s.game.round);
   await page.waitForFunction(()=>Number(document.querySelector('.battle-enemy').dataset.frame)>=1);const clip=await page.locator('.party-arena').boundingBox(),early=await page.screenshot({clip});await page.waitForFunction(()=>Number(document.querySelector('.battle-enemy').dataset.frame)>=3);assert.notDeepEqual(await page.screenshot({clip}),early);
   if(action==='heavy')await page.screenshot({path:`/tmp/hollow-${type}-heavy.png`,fullPage:true});await page.locator('.arena[data-resolving="false"]').waitFor();assert.equal((await saved()).game.status,action==='death'?'victory':'battle');if(action==='death')assert.equal(await page.locator('.battle-enemy').evaluate(e=>getComputedStyle(e).opacity),'0');
  }
  console.log(`PASS: ${type} unique normal, heavy and defeat pose animations with input locked until recovery`);
 }
 for(const width of [390,320]){await page.setViewportSize({width,height:844});const intro=createGame();intro.cinematicSeen=true;intro.introStep='class';intro.selectedGender='female';await load({version:2,game:intro,world:null});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 // Delivery format must decode the new artwork and function without external assets.
 const offline=await browser.newPage({reducedMotion:'reduce'}),requests=[];offline.on('pageerror',e=>errors.push(e.message));offline.on('request',r=>{if(r.resourceType()!=='document'&&/^https?:/.test(r.url()))requests.push(r.url());});await offline.goto(`${base}/play.html`);await offline.locator('[data-action="cinematic-skip"]').click();await offline.locator('#name-form button').click();await offline.locator('button[data-action="choose-gender"][data-gender="female"]').click();await offline.locator('[data-action="accept-class"]').click();await offline.locator('.world-loading').waitFor({state:'hidden'});assert.equal(await offline.locator('#world-canvas').getAttribute('data-gender'),'female');
 const decoded=await offline.evaluate(async()=>Promise.all(Object.entries(window.HOLLOW_ASSETS).filter(([path])=>path.includes('/alternates/')||path.endsWith('enemy-motions.png')).map(async([path,url])=>{const i=new Image();i.src=url;await i.decode();return [path,i.width,i.height];})));assert.equal(decoded.length,8);assert.ok(decoded.every(([,w,h])=>w>0&&h>0));assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);console.log('PASS: mobile gender selector and all new embedded sheets decode with no external asset requests');
}finally{await browser?.close();server.kill();}
