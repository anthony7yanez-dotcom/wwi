import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of ['index.html', 'src', 'public']) await cp(new URL(entry, root), new URL(entry, dist), { recursive: true });

// Store each asset once. Short blob URLs avoid Chromium's size limit for CSS
// custom properties, which otherwise silently drops large sprite/map data URLs.
let standalone = await readFile(new URL('index.html', root), 'utf8');
const assets = {};
const inlineJSON = value => JSON.stringify(value).replace(/</g,'\\u003c');
for (const match of [...standalone.matchAll(/<link rel="stylesheet" href="([^\"]+)" \/>/g)]) {
  const css = await readFile(new URL(match[1].replace(/^\//, ''), root), 'utf8');
  for (const asset of [...css.matchAll(/url\(['"]?(\/public\/[^)'"\s]+)['"]?\)/g)]) {
    if(assets[asset[1]])continue;
    const bytes = await readFile(new URL(asset[1].slice(1), root));
    const type = asset[1].endsWith('.woff2') ? 'font/woff2' : 'image/png';
    assets[asset[1]] = {type,data:bytes.toString('base64')};
  }
  const styleScript = `<script>{const sheet=document.createElement('style');sheet.textContent=${inlineJSON(css)}.replace(/url\\(['"]?(\\/public\\/[^)'"\\s]+)['"]?\\)/g,(_,path)=>"url('"+window.HOLLOW_ASSETS[path]+"')");document.head.append(sheet);}</script>`;
  standalone = standalone.replace(match[0],()=>styleScript);
}
const assetScript = `<script>window.HOLLOW_ASSETS={};for(const [path,asset] of Object.entries(${inlineJSON(assets)})){const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));window.HOLLOW_ASSETS[path]=URL.createObjectURL(new Blob([bytes],{type:asset.type}));}</script>`;
standalone = standalone.replace('</title>',()=>`</title>${assetScript}`);
const bundle = await build({ entryPoints:[fileURLToPath(new URL('src/app.js',root))], bundle:true, write:false, format:'iife', target:'es2022' });
const code = bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
standalone = standalone.replace('<script type="module" src="/src/app.js"></script>', ()=>`<script>${code}</script>`);
standalone = standalone.replace('href="/" aria-label="The Hollow home"', 'href="#" aria-label="The Hollow home"');
await writeFile(new URL('play.html', root), standalone);
await writeFile(new URL('play.html', dist), standalone);
console.log('Built dist/ and refreshed the standalone play.html.');
