// Renders the Tikify concept images with Playwright.
//   node design/future-look/render.js            → everything
//   node design/future-look/render.js covers     → only one stage (covers | screens | ads)
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
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
