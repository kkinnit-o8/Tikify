// Captures the REAL Tikify app (served at /Tikify/) with a demo library: stills + frame bursts of real interactions.
// CSS transitions are slowed via CDP Animation.setPlaybackRate so the real slide-ups/toasts are captured frame by frame.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000/Tikify/';
const OUT = process.argv[2] || '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad/caps';
const COVERS = 'design/future-look/covers/';
const SLOW = 0.15; // animation playback rate during bursts

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
// The sound "she" is looking for (fictional re-upload creator, demo data only)
const DEMO_LINK = 'https://www.tiktok.com/@nightcore.edits/video/7311000000000000001';
const DEMO_INFO = {
  tiktokId: '7311000000000000001', musicId: '7311000000000000002',
  title: 'haunted (sped up + reverb)', artist: 'nightcore.edits', isOriginal: false,
  coverUrl: BASE + COVERS + 'haunted.png', coverUrls: [BASE + COVERS + 'haunted.png'], videoCoverUrl: BASE + COVERS + 'haunted.png',
  audioUrl: BASE + 'demo-audio.wav', duration: 23, videoTitle: 'this sound >>> #fyp', videoAuthor: '@nightcore.edits',
  sourceUrl: DEMO_LINK,
};

async function seed(page) {
  await page.evaluate(async ({ SOUNDS, PLAYLISTS, COVERS }) => {
    const wav = (seconds) => {
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

async function installMocks(page) {
  await page.waitForFunction(() => typeof TikTok !== 'undefined' && typeof DB !== 'undefined');
  await page.evaluate(({ DEMO_INFO }) => {
    const wav = (seconds) => {
      const n = 8000 * seconds, b = new ArrayBuffer(44 + n), v = new DataView(b);
      const s = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      s(0, 'RIFF'); v.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
      v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true);
      v.setUint16(34, 8, true); s(36, 'data'); v.setUint32(40, n, true); new Uint8Array(b, 44).fill(128);
      return new Blob([b], { type: 'audio/wav' });
    };
    TikTok.lookup = async () => { await new Promise((r) => setTimeout(r, 1400)); return { ...DEMO_INFO }; };
    TikTok.downloadBlob = async (url, { kind = 'audio', onProgress } = {}) => {
      if (kind === 'image') return (await fetch(url)).blob();
      for (let i = 1; i <= 4; i++) { await new Promise((r) => setTimeout(r, 220)); onProgress && onProgress(i / 4); }
      return wav(23);
    };
  }, { DEMO_INFO });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const log = [];
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Animation.enable');
  const rate = (r) => cdp.send('Animation.setPlaybackRate', { playbackRate: r });

  await page.goto(BASE + '#/library');
  await page.waitForFunction(() => typeof DB !== 'undefined');
  await seed(page);
  const session = { queue: PLAYLISTS[0][1], baseQueue: PLAYLISTS[0][1], upNext: [], index: 0, contextId: 'pl:pl0', context: 'Late Night Drive', t: 48 };
  await page.addInitScript((s) => { localStorage.setItem('tikify.session', JSON.stringify(s)); }, session);
  await page.reload();
  await installMocks(page);
  await page.waitForSelector('.mini-player:not([hidden])');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const still = async (name) => { await page.screenshot({ path: path.join(OUT, name + '.png'), type: 'png' }); log.push({ still: name, t: Date.now() }); };
  // frame burst: screenshots as fast as possible for `ms` (wall clock), with timestamps
  const burst = async (name, ms) => {
    const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now(); const times = []; let i = 0;
    while (Date.now() - t0 < ms) {
      const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
      times.push(Date.now() - t0); fs.writeFileSync(path.join(dir, `f_${String(i++).padStart(3, '0')}.jpg`), buf);
    }
    fs.writeFileSync(path.join(dir, 'times.json'), JSON.stringify(times));
    console.log(name, i, 'frames over', ms, 'ms');
  };
  const go = async (hash, sel) => { await page.evaluate((h) => { location.hash = h; }, hash); if (sel) await page.waitForSelector(sel); await page.waitForTimeout(350); };

  // 1. Library (mini player paused at 0:48 of Midnight Drive, as after a relaunch)
  await still('library');
  // library with the music playing
  await page.click('#miniPlay'); await page.waitForTimeout(400); await still('library_playing');
  await page.click('#miniPlay'); await page.waitForTimeout(300);

  // 2. Add sound flow (real UI; lookup mocked with demo data)
  await go('#/add', '#linkInput');
  await still('add_empty');
  // typing the link, frame per 2 characters
  const tdir = path.join(OUT, 'add_type'); fs.mkdirSync(tdir, { recursive: true });
  await page.click('#linkInput');
  for (let i = 0; i < DEMO_LINK.length; i++) {
    await page.keyboard.type(DEMO_LINK[i]);
    if (i % 2 === 1 || i === DEMO_LINK.length - 1) await page.screenshot({ path: path.join(tdir, `f_${String(i).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await still('add_typed');
  // paste variant: clear, put the link on the clipboard, tap Paste (real app flow) → lookup starts automatically
  await page.fill('#linkInput', '');
  await page.evaluate((l) => navigator.clipboard.writeText(l), DEMO_LINK);
  await still('add_empty2');
  await rate(SLOW);
  await page.click('#pasteBtn');
  await burst('add_lookup', 1800);               // link appears + "Finding the sound…" spinner
  await page.waitForSelector('.preview');
  await rate(1);
  await page.waitForTimeout(500);
  await still('add_preview');
  // tick "Late Night Drive" (real checkbox), then Save
  await page.click('.pl-checks label:nth-child(1)');
  await page.waitForTimeout(200);
  await still('add_preview_checked');
  await rate(SLOW);
  await page.click('#saveBtn');
  await burst('add_save', 2600);                 // Downloading… % → ✓ saved + toast
  await page.waitForSelector('.saved');
  await page.waitForTimeout(300);
  await still('add_saved');
  await rate(1);
  await page.waitForTimeout(2500);
  await still('add_saved_notoast');

  // 3. Playlist with the new sound inside, play it
  await go('#/playlist/pl0', '.pl-header');
  await still('playlist');
  await rate(SLOW);
  await page.click('#plPlay');
  await burst('playlist_play', 1200);
  await rate(1);
  await page.waitForTimeout(300);
  await page.evaluate(() => { audio.currentTime = 48; });
  await page.waitForTimeout(500);
  await still('playlist_playing');

  // 4. Full-screen player: open (real slide-up), seek, shuffle, repeat, next, pause
  await rate(SLOW);
  await page.click('#miniOpen');
  await burst('player_open', 2600);
  await rate(1);
  await page.waitForTimeout(400);
  await still('player');
  for (const t of [12, 30, 61, 95, 130]) { await page.evaluate((t) => { audio.currentTime = t; }, t); await page.waitForTimeout(250); await still('player_t' + t); }
  await page.evaluate(() => { audio.currentTime = 48; }); await page.waitForTimeout(250);
  await page.click('#shuffleBtn'); await page.waitForTimeout(250); await still('player_shuffle');
  await page.click('#repeatBtn'); await page.waitForTimeout(250); await still('player_repeat');
  await page.click('#repeatBtn'); await page.waitForTimeout(250); await still('player_repeat1');
  await page.click('#repeatBtn'); await page.click('#shuffleBtn'); await page.waitForTimeout(250);
  await rate(SLOW);
  await page.click('#nextBtn');
  await burst('player_next', 1400);
  await rate(1);
  await page.waitForTimeout(400);
  await still('player_next_still');
  await page.click('#playBtn'); await page.waitForTimeout(300); await still('player_paused');
  await page.click('#playBtn'); await page.waitForTimeout(300);
  await page.click('#nextBtn'); await page.waitForTimeout(500); await still('player_third');
  await page.click('#playerMore'); await page.waitForTimeout(600); await still('player_menu');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await rate(SLOW);
  await page.click('#playerClose');
  await burst('player_close', 1800);
  await rate(1);
  await page.waitForTimeout(400);

  // 5. All sounds list + a sound's menu (bottom sheet)
  await go('#/all', '.row.track');
  await still('all');
  const menuBtn = await page.$('.row.track [aria-label*="More"], .row.track .icon-btn');
  if (menuBtn) { await rate(SLOW); await menuBtn.click(); await burst('sheet_open', 1600); await rate(1); await page.waitForTimeout(300); await still('sheet'); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }

  // 6. Search (typed, real results)
  await go('#/search', '#q');
  await still('search');
  const sdir = path.join(OUT, 'search_type'); fs.mkdirSync(sdir, { recursive: true });
  await page.click('#q');
  const Qs = 'night';
  for (let i = 0; i < Qs.length; i++) { await page.keyboard.type(Qs[i]); await page.waitForTimeout(120); await page.screenshot({ path: path.join(sdir, `f_${String(i).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 92 }); }
  await page.waitForTimeout(300);
  await still('search_results');

  // 7. Library again with the new sound saved (the "after" state) + new playlist sheet
  await go('#/library', '.pl-card');
  await still('library_after');
  await rate(SLOW);
  const np = await page.$('text=New playlist');
  if (np) { await np.click(); await burst('newpl_open', 1600); await rate(1); await page.waitForTimeout(300); await page.keyboard.type('Haunted szn'); await page.waitForTimeout(200); await still('newpl_typed'); await page.keyboard.press('Escape'); }
  await rate(1);

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1));
  if (errors.length) console.error('PAGE ERRORS:\n' + errors.join('\n'));
  console.log('done →', OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
