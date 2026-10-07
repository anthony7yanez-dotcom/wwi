import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { CLASSES, createGame, startEncounter } from '../src/engine.js';
import { CHARACTER_MOVES } from '../src/animations.js';

const base = 'http://127.0.0.1:3103';
const saveKey = 'the-hollow-save-v1';
const server = spawn(process.execPath, ['server.mjs'], { cwd: new URL('../', import.meta.url), env: { ...process.env, PORT: '3103' }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
const errors = [];
function fixture(id) {
  const others = CLASSES.filter(c => c.id !== id).slice(0,2).map(c => c.id);
  const game = createGame([id,...others]); startEncounter(game);
  game.queue = [0,1,2];
  game.party[1].hp -= 35;
  return game;
}
try {
  await new Promise((resolve,reject) => { server.stdout.once('data',resolve); server.once('error',reject); server.once('exit',code => reject(new Error(`Server exited: ${code}`))); });
  const executablePath = process.env.CHROMIUM_PATH || ['/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 }, reducedMotion: 'no-preference' });
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if(r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto(base);
  async function load(game) {
    await page.evaluate(({saveKey,game}) => localStorage.setItem(saveKey,JSON.stringify(game)),{saveKey,game});
    await page.goto(base);
  }
  const names = new Set();
  for (const cls of CLASSES) {
    for (const action of ['attack','guard','skill']) {
      await load(fixture(cls.id));
      await page.locator(`.command[data-action="${action}"]`).click();
      const hero = page.locator(`.stage-hero[data-hero="${cls.id}"]`);
      assert.match(await hero.getAttribute('class'), /performing/);
      assert.equal(await hero.getAttribute('data-move'),action);
      const name = await hero.locator('.sprite').evaluate(el => getComputedStyle(el).animationName);
      assert.equal(name,`${cls.id}-${action}`); names.add(name);
      assert.equal(await page.locator('.command:disabled').count(),4);
      assert.equal(await page.locator('.performing').count(),1,'Only the acting character moves');
      await page.keyboard.press('1'); await page.keyboard.press('2');
      await hero.locator('.sprite').evaluate(async el => {
        const animation = el.getAnimations()[0];
        if(animation) animation.currentTime = animation.effect.getTiming().duration * .4;
      });
      assert.notEqual(await hero.locator('.sprite').evaluate(el => getComputedStyle(el).transform),'none');
      if (action === 'skill') {
        await page.screenshot({path:`/tmp/hollow-${cls.id}-ability.png`,fullPage:true});
      }
      await page.locator('.arena[data-resolving="false"]').waitFor();
      const saved = await page.evaluate(saveKey => JSON.parse(localStorage.getItem(saveKey)),saveKey);
      assert.equal(saved.cursor,1,'Repeated input during a move must not consume extra turns');
      assert.equal(await page.locator('.performing').count(),0,'The move cleans up after recovery');
      if(action==='guard') {
        assert.equal(saved.party[0].guard,true);
        assert.match(await hero.getAttribute('class'),/guarding/);
        assert.ok(await hero.locator('.guard-ward').evaluate(el=>Number(getComputedStyle(el).opacity)>0));
        assert.equal(await page.locator('.enemy-hud.contact').count(),0,'Guard does not hit the enemy');
      }
    }
    console.log(`PASS: ${cls.name} attack, guard, and ability animations, actor identity, and input lock`);
  }
  assert.equal(names.size,21);

  const endRound=fixture('knight'); endRound.queue=[1,2,0]; endRound.cursor=2;
  endRound.log.push({text:'Old strike: Warrior takes 99 damage.',type:'enemy'});
  await load(endRound);
  await page.locator('.command[data-action="attack"]').click();
  assert.equal(await page.locator('.performing').getAttribute('data-hero'),'knight');
  await page.locator('.arena[data-phase="enemy"]').waitFor();
  assert.equal(await page.locator('.taking-hit').count(),1,'Historical damage must not replay');
  assert.equal(await page.locator('.taking-hit').getAttribute('data-hero'),'knight');
  await page.locator('.arena[data-resolving="false"]').waitFor();
  const round=await page.evaluate(saveKey=>JSON.parse(localStorage.getItem(saveKey)),saveKey);
  assert.equal(round.round,2); assert.equal(round.cursor,0);
  console.log('PASS: hero completes before enemy reaction; old hits never replay');

  const victory=fixture('warrior');victory.enemy.hp=1;
  await load(victory);
  await page.locator('.command[data-action="attack"]').click();
  assert.equal(await page.locator('.arena-message').count(),0,'Victory waits for the finishing blow');
  await page.locator('.arena[data-resolving="false"]').waitFor();
  assert.equal(await page.locator('[data-action="descend"]').count(),1);
  console.log('PASS: finishing blow animation completes before victory');

  const potion=fixture('monk');potion.party[0].hp-=40;
  await load(potion);
  await page.locator('.command[data-action="potion"]').click();
  assert.equal(await page.locator('.performing .sprite').evaluate(el=>getComputedStyle(el).animationName),'potion-drink');
  await page.locator('.arena[data-resolving="false"]').waitFor();
  assert.equal(await page.evaluate(saveKey=>JSON.parse(localStorage.getItem(saveKey)).potions,saveKey),2);
  console.log('PASS: potion animation preserves healing and inventory');

  await page.setViewportSize({width:320,height:844});
  await load(fixture('sorcerer'));
  await page.locator('.command[data-action="skill"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.arena[data-resolving="false"]').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await load(fixture('witch'));
  await page.locator('.command[data-action="skill"]').click();
  assert.equal(await page.locator('.performing .sprite').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('.arena[data-resolving="false"]').waitFor();
  console.log('PASS: mobile animation layout and reduced-motion combat');

  const standalone = await readFile(new URL('../play.html',import.meta.url),'utf8');
  const offline = await browser.newPage({reducedMotion:'no-preference'});
  const extraRequests=[];
  offline.on('pageerror',e=>errors.push(e.message));
  offline.on('request',r=>{if(r.resourceType()!=='document' && /^https?:/.test(r.url())) extraRequests.push(r.url())});
  await offline.route(`${base}/standalone`,route=>route.fulfill({status:200,contentType:'text/html',body:standalone}));
  await offline.goto(`${base}/standalone`);
  await offline.locator('[data-action="begin"]').click();
  await offline.keyboard.press('2');
  assert.equal(await offline.locator('.performing .sprite').evaluate(el=>getComputedStyle(el).animationName),'sorcerer-skill');
  await offline.locator('.arena[data-resolving="false"]').waitFor();
  assert.match(await offline.locator('.enemy-numbers').innerText(),/160/);
  assert.deepEqual(extraRequests,[]);
  assert.deepEqual(errors,[]);
  console.log('PASS: downloadable play.html includes animations and requires no external files');
} finally {
  await browser?.close(); server.kill();
}
