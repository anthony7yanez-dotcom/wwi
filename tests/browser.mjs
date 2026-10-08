import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {CLASSES,heroStats,enemyIntent} from '../src/engine.js';
const base='http://127.0.0.1:3101',key='the-hollow-solo-v2';
const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'3101'},stdio:['ignore','pipe','pipe']});
let browser;const errors=[];
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited ${code}`)));});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||['/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});await page.addInitScript(()=>{Math.random=()=>.4;});
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.prologue').count(),1);assert.equal(await page.locator('.stage-hero').count(),0);
 await page.screenshot({path:'/tmp/hollow-solo-intro.png',fullPage:true});
 await page.locator('#wanderer-name').fill('Ash');await page.locator('#name-form button').click();assert.equal(await page.locator('.calling-choice').count(),7);
 await page.locator('[data-class="sorcerer"]').click();assert.equal(await page.locator('.calling-preview h2').innerText(),'Sorcerer');
 await page.locator('[data-action="preview"][data-move="skill"]').click();
 await page.waitForFunction(()=>document.querySelector('.preview-sprite').dataset.row==='3'&&Number(document.querySelector('.preview-sprite').dataset.frame)>=2);
 await page.screenshot({path:'/tmp/hollow-solo-class.png',fullPage:true});
 await page.locator('.preview-stage[data-resolving="false"]').waitFor();
 await page.reload();assert.equal(await page.locator('.calling-preview h2').innerText(),'Sorcerer');
 await page.locator('[data-action="accept-class"]').click();assert.equal(await page.locator('.stage-hero').count(),1);assert.equal(await page.locator('.hero-card').count(),1);assert.match(await page.locator('.hero-card').innerText(),/Ash/);
 await page.locator('.text-button[data-action="character"]').click();assert.match(await page.locator('dialog').innerText(),/Level 1 Sorcerer/);await page.keyboard.press('Escape');
 await page.locator('[data-action="codex"]').click();assert.equal(await page.locator('.codex-grid article').count(),4);await page.keyboard.press('Escape');
 console.log('PASS: intro, hero naming, seven class choices, preview frames, class lock, and character sheet');
 await page.locator('[data-action="begin"]').click();await page.keyboard.press('2');await page.locator('.arena[data-resolving="false"]').waitFor();
 let s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(s.enemy.hp,76);assert.equal(s.round,2);
 await page.reload();assert.match(await page.locator('.enemy-numbers').innerText(),/76/);assert.equal(await page.locator('.stage-hero').count(),1);console.log('PASS: solo combat, enemy response, and saved-game reload');
 let moves=0;
 while(s.status!=='complete'&&s.status!=='defeat'&&moves++<80){
  if(s.status==='victory')await page.locator('[data-action="descend"]').click();
  else{const c=heroStats(s.hero);let action=s.hero.hp<c.hp*.42&&s.potions>0?'potion':enemyIntent(s).heavy&&s.hero.hp<c.hp*.7?'guard':s.hero.mp>=c.cost?'skill':'attack';await page.locator(`.command[data-action="${action}"]`).click();await page.locator('.arena[data-resolving="false"]').waitFor();}
  s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 }
 assert.equal(s.status,'complete');assert.equal(s.gold,395);assert.equal(s.hero.level,3);assert.match(await page.locator('.arena-message').innerText(),/Your legend begins/);
 await page.locator('[data-action="journey"]').click();assert.equal(await page.locator('.journey-stop').count(),3);console.log(`PASS: complete solo expedition, refuges, levels, and rewards (${moves} moves)`);
 await page.locator('.page-footer [data-action="restart"]').click();await page.locator('[data-action="confirm-restart"]').click();assert.equal(await page.locator('.prologue').count(),1);
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#name-form button').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(width===390)await page.screenshot({path:'/tmp/hollow-solo-mobile.png',fullPage:true});
  await page.locator('[data-class="monk"]').click();await page.locator('[data-action="accept-class"]').click();await page.locator('[data-action="begin"]').click();await page.locator('.command[data-action="guard"]').click();await page.locator('.arena[data-resolving="false"]').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.page-footer [data-action="restart"]').click();await page.locator('[data-action="confirm-restart"]').click();
 }
 await page.evaluate(({key})=>{localStorage.setItem('the-hollow-save-v1','{"oldParty":"preserved"}');localStorage.setItem(key,'{"broken":true}');},{key});await page.reload();assert.equal(await page.locator('.prologue').count(),1);assert.equal(await page.evaluate(()=>localStorage.getItem('the-hollow-save-v1')),'{"oldParty":"preserved"}');
 assert.deepEqual(errors,[]);console.log('PASS: mobile intro/combat, restart, corrupted-save recovery, and preserved legacy saves');
}finally{await browser?.close();server.kill();}
