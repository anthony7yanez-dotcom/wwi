import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of ['index.html', 'src', 'public']) await cp(new URL(entry, root), new URL(entry, dist), { recursive: true });

// The downloadable game must always use the same code and assets as the app.
let standalone = await readFile(new URL('index.html', root), 'utf8');
for (const match of [...standalone.matchAll(/<link rel="stylesheet" href="([^\"]+)" \/>/g)]) {
  let css = await readFile(new URL(match[1].replace(/^\//, ''), root), 'utf8');
  for (const asset of [...css.matchAll(/url\(['"]?(\/public\/[^)'"\s]+)['"]?\)/g)]) {
    const bytes = await readFile(new URL(asset[1].slice(1), root));
    const type = asset[1].endsWith('.woff2') ? 'font/woff2' : 'image/png';
    css = css.replace(asset[0], `url('data:${type};base64,${bytes.toString('base64')}')`);
  }
  standalone = standalone.replace(match[0], `<style>${css}</style>`);
}
const code = await Promise.all(['engine.js', 'animations.js', 'app.js'].map(async name => {
  const source = await readFile(new URL(`src/${name}`, root), 'utf8');
  return source.replace(/^import .*?;\s*/gm, '').replace(/^export /gm, '');
}));
standalone = standalone.replace('<script type="module" src="/src/app.js"></script>', `<script type="module">${code.join('\n')}</script>`);
standalone = standalone.replace('href="/" aria-label="The Hollow home"', 'href="#" aria-label="The Hollow home"');
await writeFile(new URL('play.html', root), standalone);
await writeFile(new URL('play.html', dist), standalone);
console.log('Built dist/ and refreshed the standalone play.html.');
