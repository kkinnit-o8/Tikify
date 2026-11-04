// Takes the app's store screenshots (screenshots/*.jpg, listed in manifest.webmanifest) from the real
// app, filled with a demo library. Serve the folder above the repo first, so the app runs under /Tikify/:
//   cd .. && python3 -m http.server 8000
//   node design/future-look/render.js covers     (the demo covers)
//   node design/screenshots.js [outDir]          (default: screenshots/)
// The demo sounds are made up; their audio is silence.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.TIKIFY_URL || 'http://127.0.0.1:8000/Tikify/';
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'screenshots'));
const COVERS = 'design/future-look/covers/';

const SOUNDS = [
  ['midnight', 'Midnight Drive (sped up)', 'Noctra', 178],
  ['neon', 'after hours', 'citylights', 192],
  ['velvet', 'velvet (slowed + reverb)', 'rose.mp3', 167],
  ['golden', 'golden hour, but sad', 'sunnie.wav', 114],
  ['rain', 'rainy café', 'mono.loft', 210],
  ['phonk', 'GYM PHONK 03', 'ironvoice', 154],
  ['dance', 'the dance everyone’s doing', 'kaiimoves', 61],
  ['slowed', 'dreamy (slowed)', 'hazey', 143],
  ['lofi', '3am study loop', 'paperplanes', 180],
  ['summer', 'summer anthem', 'wavesclub', 128],
  ['ocean', 'deep focus', 'tidal.mind', 240],
];
const PLAYLISTS = [
  ['Late Night Drive', ['midnight', 'neon', 'velvet', 'golden', 'rain']],
  ['Gym', ['phonk', 'dance', 'summer', 'neon']],
  ['Soft Hours', ['slowed', 'lofi', 'ocean', 'rain']],
  ['Road trip', ['summer', 'midnight', 'golden', 'dance', 'neon']],
];

async function seed(page) {
  await page.evaluate(async ({ SOUNDS, PLAYLISTS, COVERS }) => {
    const wav = (seconds) => { // 8 kHz, 8-bit mono silence
      const n = 8000 * seconds, b = new ArrayBuffer(44 + n), v = new DataView(b);
      const s = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      s(0, 'RIFF'); v.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
      v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true);
      v.setUint16(34, 8, true); s(36, 'data'); v.setUint32(40, n, true); new Uint8Array(b, 44).fill(128);
      return new Blob([b], { type: 'audio/wav' });
    };
    const now = Date.now();
    for (const [i, [id, title, artist, duration]] of SOUNDS.entries()) {
      const coverBlob = await (await fetch(COVERS + id + '.png')).blob();
      await DB.put('sounds', { id, title, artist, coverBlob, sourceUrl: 'https://www.tiktok.com/@demo/video/1', tiktokId: String(i + 1), duration, addedAt: now - i * 60000 });
      await DB.put('audio', { id, blob: wav(duration) });
    }
    for (const [i, [name, soundIds]] of PLAYLISTS.entries()) {
      await DB.put('playlists', { id: 'pl' + i, name, soundIds, createdAt: now - (10 - i) * 1000 });
    }
    localStorage.setItem('tikify.installDismissedAt', JSON.stringify(now));
    localStorage.setItem('tikify.lastBackupAt', JSON.stringify(now));
  }, { SOUNDS, PLAYLISTS, COVERS });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, serviceWorkers: 'block' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (process.env.DEBUG) page.on('console', (m) => console.log('console:', m.text()));
  await page.goto(BASE + '#/library');
  await page.waitForFunction(() => typeof DB !== 'undefined');
  await seed(page);
  // Paused 48 s into the first sound of Late Night Drive, as after a relaunch. Set before the app
  // starts, since leaving the page saves the (empty) session over it.
  const session = { queue: PLAYLISTS[0][1], baseQueue: PLAYLISTS[0][1], upNext: [], index: 0, contextId: 'pl:pl0', context: 'Late Night Drive', t: 48 };
  await page.addInitScript((s) => { localStorage.setItem('tikify.session', JSON.stringify(s)); }, session);
  await page.reload();
  if (process.env.DEBUG) { await page.waitForTimeout(1500); console.log(await page.evaluate(() => ({ n: state.sounds.size, q: state.queue, i: state.index, sess: localStorage.getItem('tikify.session') }))); }
  await page.waitForSelector('.mini-player:not([hidden])');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const shot = (name) => page.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 88 });
  await shot('library');

  await page.click('[data-go="#/playlist/pl0"]');
  await page.waitForSelector('.pl-header');
  await page.click('#plPlay'); // plays the playlist, so its row and the play button show it playing
  await page.waitForTimeout(400);
  await page.evaluate(() => { audio.currentTime = 48; });
  await page.waitForTimeout(700);
  await shot('playlist');

  await page.click('#miniOpen');
  await page.waitForTimeout(700);
  await shot('player');
  await browser.close();
  if (errors.length) { console.error('Page errors:\n' + errors.join('\n')); process.exit(1); }
  console.log('Saved to ' + OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
