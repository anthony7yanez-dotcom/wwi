import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {CLASSES,createGame,startEncounter} from '../src/engine.js';
const base='http://127.0.0.1:3103',key='the-hollow-solo-v2';
const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'3103'},stdio:['ignore','pipe','pipe']});let browser;const errors=[];
function fixture(id){const s=createGame(id,'Ash');startEncounter(s);s.hero.hp-=35;return s;}
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited ${code}`)));});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||['/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync),headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'no-preference'});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});await page.addInitScript(()=>{Math.random=()=>0;});await page.goto(`${base}/?mode=prototype`);
 async function load(s){await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s});await page.goto(`${base}/?mode=prototype`);}
 for(const c of CLASSES){
  const response=await page.request.get(`${base}/public/assets/animations/${c.id}.png`);assert.equal(response.status(),200);const png=await response.body();assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
  for(const [action,row] of [['attack',1],['guard',2],['skill',3]]){
   await load(fixture(c.id));await page.waitForFunction(()=>Array.from(document.querySelectorAll('.frame-sprite')).every(el=>el.dataset.registered==='true'));await page.evaluate(()=>{window.actionFrames=[];new MutationObserver(()=>{const el=document.querySelector('.battle-sprite');if(el?.classList.contains('playing-frames'))window.actionFrames.push([el.dataset.row,el.dataset.frame]);}).observe(document.querySelector('#app'),{subtree:true,attributes:true,attributeFilter:['data-frame','data-row']});});if(action==='guard')await page.evaluate(()=>{window.guardFrames=[];let samples=0;function probe(){const arena=document.querySelector('.arena'),sprite=document.querySelector('.battle-sprite');if(arena?.dataset.phase==='enemy')window.guardFrames.push([sprite.dataset.row,sprite.dataset.frame]);if(samples++<240)requestAnimationFrame(probe);}requestAnimationFrame(probe);});await page.locator(`.command[data-action="${action}"]`).click();assert.equal(await page.locator('.performing').getAttribute('data-hero'),c.id);assert.equal(await page.locator('.command:disabled').count(),4);
   await page.waitForFunction(row=>{const el=document.querySelector('.battle-sprite');return Number(el.dataset.row)===row&&Number(el.dataset.frame)>=1;},row);
   await page.keyboard.press('1');await page.keyboard.press('2');
   if(action==='skill')await page.screenshot({path:`/tmp/hollow-solo-${c.id}-cast.png`,fullPage:true});

   await page.locator('.arena[data-resolving="false"]').waitFor();const observed=await page.evaluate(()=>window.actionFrames);assert.deepEqual([...new Set(observed.filter(([r])=>Number(r)===row).map(([,f])=>Number(f)))].sort(),[0,1,2,3,4,5],`${c.id} ${action} plays all six poses`);const s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(s.round,2,'Repeated input must not spend additional turns');assert.equal(await page.locator('.performing').count(),0);
   if(action==='guard'){const held=await page.evaluate(()=>window.guardFrames);assert.ok(held.length>0);assert.ok(held.every(([row,frame])=>row==='2'&&frame==='3'),'Guard pose must hold throughout the enemy strike');assert.equal(s.hero.guard,true);assert.match(await page.locator('.stage-hero').getAttribute('class'),/guarding/);}
  }
  console.log(`PASS: ${c.name} atlas, attack/guard/ability pose changes, actor identity, and input lock`);
 }
 await load(fixture('knight'));await page.locator('.command[data-action="attack"]').click();await page.locator('.arena[data-phase="enemy"]').waitFor();assert.equal(await page.locator('.taking-hit').count(),1);assert.equal(await page.locator('.playing-frames').count(),0);await page.locator('.arena[data-resolving="false"]').waitFor();console.log('PASS: animation finishes before enemy response');
 const win=fixture('warrior');win.enemy.hp=1;await load(win);await page.locator('.command[data-action="attack"]').click();assert.equal(await page.locator('.arena-message').count(),0);await page.locator('.arena[data-resolving="false"]').waitFor();assert.equal(await page.locator('[data-action="descend"]').count(),1);console.log('PASS: finishing blow completes before victory');
 await page.emulateMedia({reducedMotion:'reduce'});await load(fixture('witch'));await page.locator('.command[data-action="skill"]').click();await page.locator('.arena[data-resolving="false"]').waitFor();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).round,key),2);console.log('PASS: reduced-motion play');
 const offline=await browser.newPage({reducedMotion:'reduce'});const requests=[];offline.on('pageerror',e=>errors.push(e.message));offline.on('request',r=>{if(r.resourceType()!=='document'&&/^https?:/.test(r.url()))requests.push(r.url())});await offline.goto(`${base}/play.html?mode=prototype`);await offline.locator('#name-form button').click();await offline.locator('[data-class="gunslinger"]').click();await offline.locator('[data-action="accept-class"]').click();await offline.locator('[data-action="begin"]').click();await offline.keyboard.press('2');await offline.locator('.arena[data-resolving="false"]').waitFor();assert.match(await offline.locator('.enemy-numbers').innerText(),/78/);assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);console.log('PASS: standalone intro, solo combat, and embedded sprite atlases without external requests');
}finally{await browser?.close();server.kill();}
