// Real-interaction sequences via CDP screencast at ~2× resolution: viewport 750×1624 @DPR1 with CSS zoom 1.923 on <html>
// (the app lays out as on a 390-px phone; all its media queries stay in the phone range). Animations slowed so
// 0.2–0.25 s transitions span dozens of frames. times.json: animation-time seconds per frame.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000/Tikify/';
const OUT = process.argv[2] || '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad/caps';
const COVERS = 'design/future-look/covers/';
const ZOOM = 750 / 390;
const SLOW = 0.12;
const SOUNDS = [
  ['midnight', 'Midnight Drive (sped up)', 'Noctra', 178], ['neon', 'after hours', 'citylights', 192],
  ['velvet', 'velvet (slowed + reverb)', 'rose.mp3', 167], ['golden', 'golden hour, but sad', 'sunnie.wav', 114],
  ['rain', 'rainy café', 'mono.loft', 210], ['phonk', 'GYM PHONK 03', 'ironvoice', 154],
  ['dance', 'the dance everyone’s doing', 'kaiimoves', 61], ['slowed', 'dreamy (slowed)', 'hazey', 143],
  ['lofi', '3am study loop', 'paperplanes', 180], ['summer', 'summer anthem', 'wavesclub', 128], ['ocean', 'deep focus', 'tidal.mind', 240],
];
const PLAYLISTS = [
  ['Late Night Drive', ['midnight', 'neon', 'velvet', 'golden', 'rain']], ['Gym', ['phonk', 'dance', 'summer', 'neon']],
  ['Soft Hours', ['slowed', 'lofi', 'ocean', 'rain']], ['Road trip', ['summer', 'midnight', 'golden', 'dance', 'neon']],
];
const DEMO_LINK = 'https://www.tiktok.com/@nightcore.edits/video/7311000000000000001';
const DEMO_INFO = {
  tiktokId: '7311000000000000001', musicId: '7311000000000000002', title: 'haunted (sped up + reverb)', artist: 'nightcore.edits', isOriginal: false,
  coverUrl: BASE + COVERS + 'haunted.png', coverUrls: [BASE + COVERS + 'haunted.png'], videoCoverUrl: BASE + COVERS + 'haunted.png',
  audioUrl: BASE + 'demo-audio.wav', duration: 23, videoTitle: 'this sound >>> #fyp', videoAuthor: '@nightcore.edits', sourceUrl: DEMO_LINK,
};
const WAV_SRC = `const wav = (seconds) => { const n = 8000 * seconds, b = new ArrayBuffer(44 + n), v = new DataView(b);
  const s = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  s(0, 'RIFF'); v.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true);
  v.setUint16(34, 8, true); s(36, 'data'); v.setUint32(40, n, true); new Uint8Array(b, 44).fill(128);
  return new Blob([b], { type: 'audio/wav' }); };`;

async function seed(page) {
  await page.evaluate(new Function('args', `return (async ({ SOUNDS, PLAYLISTS, COVERS }) => { ${WAV_SRC}
    const now = Date.now();
    for (const [i, [id, title, artist, duration]] of SOUNDS.entries()) {
      const coverBlob = await (await fetch(COVERS + id + '.png')).blob();
      await DB.put('sounds', { id, title, artist, coverBlob, sourceUrl: 'https://www.tiktok.com/@demo/video/1', tiktokId: String(i + 1), duration, addedAt: now - i * 60000 });
      await DB.put('audio', { id, blob: wav(duration) });
    }
    for (const [i, [name, soundIds]] of PLAYLISTS.entries()) await DB.put('playlists', { id: 'pl' + i, name, soundIds, createdAt: now - (10 - i) * 1000 });
    localStorage.setItem('tikify.installDismissedAt', JSON.stringify(now)); localStorage.setItem('tikify.lastBackupAt', JSON.stringify(now));
  })(args)`), { SOUNDS, PLAYLISTS, COVERS });
}
async function installMocks(page) {
  await page.waitForFunction(() => typeof TikTok !== 'undefined' && typeof DB !== 'undefined');
  await page.evaluate(new Function('DEMO_INFO', `${WAV_SRC}
    TikTok.lookup = async () => { await new Promise((r) => setTimeout(r, 1500)); return { ...DEMO_INFO }; };
    TikTok.downloadBlob = async (url, { kind = 'audio', onProgress } = {}) => {
      if (kind === 'image') return (await fetch(url)).blob();
      for (let i = 1; i <= 6; i++) { await new Promise((r) => setTimeout(r, 230)); onProgress && onProgress(i / 6); }
      return wav(23);
    };`), DEMO_INFO);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 750, height: 1624 }, deviceScaleFactor: 1, serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write'] });
  await context.addInitScript((z) => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = z; }); }, ZOOM);
  const page = await context.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Animation.enable');
  const rate = (r) => cdp.send('Animation.setPlaybackRate', { playbackRate: r });
  let cast = null;
  cdp.on('Page.screencastFrame', (ev) => {
    if (cast) { cast.times.push(ev.metadata.timestamp); fs.writeFileSync(path.join(cast.dir, `f_${String(cast.i++).padStart(3, '0')}.jpg`), Buffer.from(ev.data, 'base64')); }
    cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }).catch(() => {});
  });
  const burst = async (name, ms, action, r = SLOW) => {
    const dir = path.join(OUT, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    await rate(r);
    cast = { dir, i: 0, times: [] };
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 93, maxWidth: 750, maxHeight: 1624, everyNthFrame: 1 });
    await page.waitForTimeout(200);
    const act = action();
    await page.waitForTimeout(ms);
    await act;
    await cdp.send('Page.stopScreencast');
    const c = cast; cast = null;
    const t0 = c.times[0] || 0;
    fs.writeFileSync(path.join(dir, 'times.json'), JSON.stringify({ rate: r, times: c.times.map((t) => +((t - t0) * r).toFixed(4)), wall: c.times.map((t) => +(t - t0).toFixed(4)) }));
    await rate(1);
    console.log(name, c.i, 'frames, anim span', c.times.length ? ((c.times[c.times.length - 1] - t0) * r).toFixed(2) + 's' : '-');
  };
  const click = (sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error('no ' + s); el.click(); }, sel);
  const go = async (hash, sel) => { await page.evaluate((h) => { location.hash = h; }, hash); if (sel) await page.waitForSelector(sel); await page.waitForTimeout(350); };
  const still = async (name) => page.screenshot({ path: path.join(OUT, name + '.png'), type: 'png' });

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
  await still('z_library');

  await burst('mini_play', 1400, () => click('#miniPlay'));
  await click('#miniPlay'); await page.waitForTimeout(300);

  await go('#/add', '#linkInput');
  await page.evaluate((l) => navigator.clipboard.writeText(l), DEMO_LINK);
  await burst('add_lookup', 2800, () => click('#pasteBtn'));
  await page.waitForSelector('.preview'); await page.waitForTimeout(400);
  await still('z_add_preview');
  await burst('add_check', 1000, () => click('.pl-checks label:nth-child(1) input'));
  await burst('add_save', 3400, () => click('#saveBtn'));
  await page.waitForSelector('.saved'); await page.waitForTimeout(300);
  await still('z_add_saved');
  await page.waitForTimeout(2600);

  await go('#/playlist/pl0', '.pl-header');
  await still('z_playlist');
  await burst('playlist_play', 1800, () => click('#plPlay'));
  await page.evaluate(() => { audio.currentTime = 48; }); await page.waitForTimeout(300);
  await still('z_playlist_playing');

  await burst('player_open', 3200, () => click('#miniOpen'));
  await page.waitForTimeout(300);
  await still('z_player');
  await burst('player_shuffle', 1000, () => click('#shuffleBtn'));
  await burst('player_repeat', 1000, () => click('#repeatBtn'));
  await burst('player_repeat1', 1000, () => click('#repeatBtn'));
  await still('z_player_shuffle_repeat1');
  await click('#repeatBtn'); await click('#shuffleBtn'); await page.waitForTimeout(200);
  await burst('player_seek', 3000, async () => { for (let t = 48; t <= 112; t += 2) { await page.evaluate((t) => { audio.currentTime = t; }, t); await page.waitForTimeout(80); } }, 1);
  await page.evaluate(() => { audio.currentTime = 48; }); await page.waitForTimeout(200);
  await burst('player_next', 2200, () => click('#nextBtn'));
  await still('z_player_next');
  await burst('player_pause', 1200, () => click('#playBtn'));
  await click('#playBtn'); await page.waitForTimeout(200);
  await burst('player_close', 3200, () => click('#playerClose'));
  await page.waitForTimeout(400);

  await go('#/all', '.row.track');
  await still('z_all');
  const hasMenu = await page.$('.row.track .icon-btn');
  if (hasMenu) { await burst('sheet_open', 3000, () => click('.row.track .icon-btn')); await still('z_sheet'); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }

  await go('#/search', '#q');
  await burst('search_type', 3200, async () => { await page.focus('#q'); for (const ch of 'night') { await page.keyboard.type(ch); await page.waitForTimeout(340); } }, 1);
  await still('z_search');

  await go('#/library', '.pl-card');
  await still('z_library_after');
  await burst('card_tap', 1800, () => click('[data-go="#/playlist/pl0"]'));

  await browser.close();
  if (errors.length) console.error('PAGE ERRORS:\n' + errors.join('\n'));
  console.log('done →', OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
