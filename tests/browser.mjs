import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const server = spawn(process.execPath, ['server.mjs'], { cwd: new URL('../', import.meta.url), env: { ...process.env, PORT: '3101' }, stdio: ['ignore','pipe','pipe'] });
let browser;
const errors = [];
try {
  await new Promise((resolve,reject) => { server.stdout.once('data',resolve); server.once('error',reject); server.once('exit',code => reject(new Error(`Server exited: ${code}`))); });
  const executablePath = process.env.CHROMIUM_PATH || ['/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto('http://127.0.0.1:3101');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-action="begin"]').waitFor();
  assert.equal(await page.locator('.hero-card').count(),3);
  assert.ok(await page.locator('.stage-hero .sprite').evaluateAll(els => els.every(el => getComputedStyle(el).backgroundImage.includes('heroes.png') && el.clientWidth > 0)));
  assert.equal((await page.request.get('http://127.0.0.1:3101/public/assets/heroes.png')).status(),200);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
  await page.screenshot({ path: '/tmp/hollow-desktop.png', fullPage: true });
  console.log('PASS: desktop renders local art, fonts, party, and encounter');

  await page.locator('[data-action="codex"]').click();
  await page.locator('dialog[open]').waitFor();
  assert.equal(await page.locator('.codex-grid article').count(),4);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(),0);
  await page.locator('.text-button[data-action="party"]').click();
  assert.equal(await page.locator('.class-choice').count(),7);
  await page.locator('[data-class="paladin"]').click();
  await page.locator('[data-class="witch"]').click();
  await page.locator('[data-action="save-party"]').click();
  assert.match(await page.locator('.party-cards').innerText(),/Witch/);
  console.log('PASS: codex, accessible dialogs, and all seven party choices');

  await page.locator('.page-footer [data-action="restart"]').click();
  await page.locator('[data-action="confirm-restart"]').click();
  await page.locator('[data-action="save-party"]').click();
  await page.locator('[data-action="begin"]').click();
  await page.evaluate(() => { Math.random = () => 0; });
  await page.keyboard.press('2');
  await page.locator('.arena[data-resolving="false"]').waitFor();
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('the-hollow-save-v1')));
  assert.equal(saved.enemy.hp,160);
  await page.reload();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('the-hollow-save-v1')));
  assert.equal(saved.enemy.hp,160);
  assert.match(await page.locator('.command-context').innerText(),/Knight's turn/);
  console.log('PASS: keyboard ability, turn order, damage, and reload persistence');

  await page.evaluate(() => { Math.random = () => 0; });
  let actions = 0;
  while(actions++ < 160) {
    saved = await page.evaluate(() => JSON.parse(localStorage.getItem('the-hollow-save-v1')));
    if(saved.status === 'complete') break;
    assert.notEqual(saved.status,'defeat','Balanced party should survive a strategic run');
    if(saved.status === 'victory') { await page.locator('[data-action="descend"]').click(); continue; }
    const active = saved.party[saved.queue[saved.cursor]];
    const costs = { sorcerer:9,knight:6,paladin:8 };
    const wounded = saved.party.some(p => p.hp > 0 && p.hp < ({knight:125,sorcerer:80,paladin:110}[p.id] - 25));
    const action = active.mp >= costs[active.id] && (active.id !== 'paladin' || wounded) ? 'skill' : 'attack';
    await page.locator(`.command[data-action="${action}"]`).click();
    await page.locator('.arena[data-resolving="false"]').waitFor();
  }
  assert.equal(saved.status,'complete'); assert.equal(saved.gold,395);
  assert.match(await page.locator('.arena-message').innerText(),/Dawn will come again/);
  console.log(`PASS: full three-floor expedition, rewards, recovery, and final victory (${actions} moves)`);

  await page.locator('[data-action="journey"]').click();
  assert.equal(await page.locator('.journey-stop').count(),3);
  await page.locator('[data-action="sound"]').click();
  assert.equal(await page.locator('[aria-label="Mute sound"]').count(),1);
  console.log('PASS: journey and sound toggle');

  await page.evaluate(() => localStorage.setItem('the-hollow-save-v1','{"broken":true}'));
  await page.reload();
  assert.equal(await page.locator('[data-action="begin"]').count(),1);
  console.log('PASS: corrupted save recovers to a playable new expedition');

  for (const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`No page overflow at ${width}px`);
    await page.locator('.text-button[data-action="party"]').click();
    const dimensions = await page.locator('dialog').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
    assert.ok(dimensions.scroll <= dimensions.width,`Party modal fits ${width}px`);
    await page.keyboard.press('Escape');
    if(width===390) await page.screenshot({path:'/tmp/hollow-mobile.png',fullPage:true});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 390px and 320px mobile layouts with no JavaScript or asset errors');
} finally {
  await browser?.close();
  server.kill();
}
