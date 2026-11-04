// Renders the Tikify concept images with Playwright.
//   node design/future-look/render.js            → everything
//   node design/future-look/render.js covers     → only one stage (covers | screens | ads | brand | logo)
// "logo" renders design/logo/*.svg (made by design/logo/make_logo.py) to transparent PNGs beside them.
// "brand" redraws the app's own icons and link preview in icons/ (not part of "everything"); its
// og.png frames screenshots/player.jpg, so take the store screenshots first (design/screenshots.js).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const url = (f, q = '') => 'file://' + path.join(SRC, f) + q;

const COVERS = ['midnight', 'golden', 'phonk', 'slowed', 'rain', 'dance', 'lofi', 'summer', 'ocean', 'velvet', 'neon',
  'pl-night', 'pl-beast', 'pl-soft', 'pl-summer', 'pl-focus'];
const SCREENS = ['library', 'playlist', 'player', 'add', 'lock'];
// [file, width, height] — ad sizes are the platforms' native pixel sizes
const ADS = [
  ['ad-story', 1080, 1920],
  ['ad-square', 1080, 1080],
  ['ad-portrait', 1080, 1350],
  ['ad-steps', 1080, 1920],
  ['icon', 1024, 1024],
  ['before-after', 1800, 1200],
  ['overview', 2400, 1600],
];

async function main() {
  const only = process.argv[2];
  const browser = await chromium.launch();
  const ready = async (page) => { await page.evaluate(() => document.fonts.ready); await page.waitForLoadState('networkidle'); await page.waitForTimeout(150); };

  if (!only || only === 'covers') {
    fs.mkdirSync(path.join(ROOT, 'covers'), { recursive: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
    for (const c of COVERS) {
      await page.goto(url('covers.html', '?c=' + c)); await ready(page);
      await page.locator('#cv').screenshot({ path: path.join(ROOT, 'covers', c + '.png') });
    }
    await page.close();
    console.log('covers done');
  }

  if (!only || only === 'screens') {
    fs.mkdirSync(path.join(ROOT, 'screens'), { recursive: true });
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
    for (const s of SCREENS) {
      await page.goto(url(s + '.html')); await ready(page);
      await page.locator('.screen').screenshot({ path: path.join(ROOT, 'screens', s + '.png') });
    }
    await page.close();
    console.log('screens done');
  }

  if (!only || only === 'ads') {
    for (const [f, w, h] of ADS) {
      if (!fs.existsSync(path.join(SRC, f + '.html'))) continue;
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      await page.goto(url(f + '.html')); await ready(page);
      await page.screenshot({ path: path.join(ROOT, f + '.png') });
      await page.close();
    }
    console.log('ads done');
  }
  if (only === 'brand') {
    const ICONS = path.join(ROOT, '..', '..', 'icons');
    // [kind, size, file]: see brand.html
    for (const [k, size, f] of [['any', 512, 'icon-512.png'], ['any', 192, 'icon-192.png'], ['maskable', 512, 'maskable-512.png'],
      ['full', 180, 'apple-touch-icon.png'], ['favicon', 32, 'favicon-32.png']]) {
      const page = await browser.newPage({ viewport: { width: size, height: size } });
      await page.goto(url('brand.html', `?k=${k}&s=${size}`)); await ready(page);
      await page.locator('#o > svg').screenshot({ path: path.join(ICONS, f), omitBackground: k === 'any' || k === 'favicon' });
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.goto(url('brand.html', '?k=og')); await ready(page);
    await page.locator('.board').screenshot({ path: path.join(ICONS, 'og.png') });
    await page.close();
    console.log('brand done');
  }
  if (only === 'logo') {
    const LOGO = path.join(ROOT, '..', 'logo');
    for (const f of fs.readdirSync(LOGO).filter((f) => f.endsWith('.svg'))) {
      const file = path.join(LOGO, f);
      const [, w, h] = fs.readFileSync(file, 'utf8').match(/width="(\d+)" height="(\d+)"/).map(Number);
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.goto('file://' + file);
      await page.screenshot({ path: file.replace(/\.svg$/, '.png'), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
      await page.close();
    }
    console.log('logo done');
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
