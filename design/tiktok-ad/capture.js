// Captures the real Tikify app for the TikTok ad: served from this repo through request interception (no server),
// filled with the made-up demo library, and driven through real taps. The TikTok lookup (tikwm.com) is answered
// with demo data. Run `node design/future-look/render.js covers` first.  Usage: node design/tiktok-ad/capture.js [outDir]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const REPO = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'film', 'assets', 'cap'));
const ORIGIN = 'https://tikify.test';
const BASE = ORIGIN + '/Tikify/';
const COVERS = path.join(REPO, 'design/future-look/covers');
const DSF = 4;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml' };

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
const NEW = 'midnight'; // added through the real Add flow
const PLAYLISTS = [
  ['Late Night Drive', ['neon', 'velvet', 'golden', 'rain']],
  ['Gym', ['phonk', 'dance', 'summer', 'neon']],
  ['Soft Hours', ['slowed', 'lofi', 'ocean', 'rain']],
  ['Road trip', ['summer', 'golden', 'dance', 'neon']],
];
const LINK = 'https://vm.tiktok.com/ZMtikifyDemo/';

function wav(seconds) { // 8 kHz 8-bit mono silence
  const n = 8000 * seconds, b = Buffer.alloc(44 + n, 128);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34);
  b.write('data', 36); b.writeUInt32LE(n, 40); return b;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: DSF, serviceWorkers: 'block', hasTouch: false });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ORIGIN });
  const gates = { lookup: null, audio: null };
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.origin === ORIGIN && u.pathname.startsWith('/Tikify/')) {
      let p = decodeURIComponent(u.pathname.slice('/Tikify/'.length)) || 'index.html';
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(REPO, p);
      if (!f.startsWith(REPO) || !fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nf' });
      return route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' } });
    }
    if (u.hostname === 'www.tikwm.com') {
      if (gates.lookup) await gates.lookup;
      const data = { id: '7300000000000000001', title: 'need this sound 😭', duration: 15,
        cover: 'https://media.tikify-demo.test/cover/midnight.png',
        music: 'https://media.tikify-demo.test/audio/midnight.wav',
        music_info: { id: '9001', title: 'Midnight Drive (sped up)', author: 'Noctra', original: false, duration: 178,
          cover: 'https://media.tikify-demo.test/cover/midnight.png', play: 'https://media.tikify-demo.test/audio/midnight.wav' },
        author: { unique_id: 'demo', nickname: 'demo' } };
      return route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify({ code: 0, msg: 'success', data }) });
    }
    if (u.hostname === 'media.tikify-demo.test') {
      if (u.pathname.startsWith('/cover/')) return route.fulfill({ status: 200, headers: { 'content-type': 'image/png', 'access-control-allow-origin': '*' }, body: fs.readFileSync(path.join(COVERS, path.basename(u.pathname))) });
      if (gates.audio) await gates.audio;
      const body = wav(178);
      return route.fulfill({ status: 200, headers: { 'content-type': 'audio/wav', 'content-length': String(body.length), 'access-control-allow-origin': '*' }, body });
    }
    return route.abort();
  });

  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(BASE + '#/library');
  await page.waitForFunction(() => typeof DB !== 'undefined');
  const covers = {};
  for (const [id] of SOUNDS) covers[id] = 'data:image/png;base64,' + fs.readFileSync(path.join(COVERS, id + '.png')).toString('base64');
  await page.evaluate(async ({ SOUNDS, PLAYLISTS, covers, NEW }) => {
    const wav = (seconds) => { const n = 8000 * seconds, b = new ArrayBuffer(44 + n), v = new DataView(b);
      const s = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      s(0, 'RIFF'); v.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
      v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true);
      v.setUint16(34, 8, true); s(36, 'data'); v.setUint32(40, n, true); new Uint8Array(b, 44).fill(128);
      return new Blob([b], { type: 'audio/wav' }); };
    const now = Date.now();
    for (const [i, [id, title, artist, duration]] of SOUNDS.entries()) {
      if (id === NEW) continue;
      const coverBlob = await (await fetch(covers[id])).blob();
      await DB.put('sounds', { id, title, artist, coverBlob, sourceUrl: 'https://www.tiktok.com/@demo/video/1', tiktokId: String(i + 1), duration, addedAt: now - (i + 1) * 3600000 });
      await DB.put('audio', { id, blob: wav(duration) });
    }
    for (const [i, [name, soundIds]] of PLAYLISTS.entries()) await DB.put('playlists', { id: 'pl' + i, name, soundIds, createdAt: now - (10 - i) * 1000 });
    localStorage.setItem('tikify.installDismissedAt', JSON.stringify(now));
    localStorage.setItem('tikify.lastBackupAt', JSON.stringify(now));
  }, { SOUNDS, PLAYLISTS, covers, NEW });
  await page.reload();
  await page.waitForSelector('#view');
  await page.evaluate(() => document.fonts.ready);
  await sleep(700);

  const rects = {};
  const rect = async (sel) => { try { const r = await page.locator(sel).first().boundingBox({ timeout: 1500 }); return r && { x: r.x, y: r.y, w: r.width, h: r.height }; } catch { console.log('  no rect for', sel); return null; } };
  const shot = async (name, sels = {}) => {
    await sleep(120);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    rects[name] = {};
    for (const [k, s] of Object.entries(sels)) rects[name][k] = await rect(s);
    console.log('shot', name);
  };

  await shot('library_before');
  // ---- Add a sound: paste a link, find, preview, pick a playlist, save ----
  await page.click('.tabbar [href="#/add"], .tabbar [data-go="#/add"], .tabbar a:nth-child(2), .tabbar button:nth-child(2)');
  await page.waitForSelector('#linkInput');
  await sleep(400);
  await shot('add_empty', { paste: '#pasteBtn', input: '#linkInput', find: '#findBtn', tab: '.tabbar' });
  await page.evaluate((t) => navigator.clipboard.writeText(t), LINK);
  let openLookup; gates.lookup = new Promise((r) => (openLookup = r));
  await page.click('#pasteBtn');
  await page.waitForSelector('.loading');
  await sleep(500);
  await shot('add_loading', { paste: '#pasteBtn', input: '#linkInput', find: '#findBtn', loading: '.loading' });
  openLookup(); gates.lookup = null;
  await page.waitForSelector('.preview');
  await page.waitForFunction(() => { const i = document.querySelector('.preview img.cover'); return i && i.complete && i.naturalWidth > 0; });
  await sleep(500);
  await shot('add_preview', { input: '#linkInput', cover: '.preview img.cover', play: '#previewPlay', title: '#pTitle', artist: '#pArtist', preview: '.preview', checks: '.pl-checks', save: '#saveBtn' });
  // scroll so the playlists and the Save button show
  await page.evaluate(() => { const v = document.querySelector('#view'); const s = document.querySelector('#saveBtn'); v.scrollTop += s.getBoundingClientRect().bottom - (innerHeight - 140); });
  await sleep(400);
  await shot('add_preview_scrolled', { cover: '.preview img.cover', title: '#pTitle', checks: '.pl-checks', lnd: '.pl-check:nth-of-type(1)', save: '#saveBtn' });
  await page.click('.pl-check:has-text("Late Night Drive")');
  await sleep(300);
  await shot('add_checked', { checks: '.pl-checks', lnd: '.pl-check:has-text("Late Night Drive")', save: '#saveBtn' });
  let openAudio; gates.audio = new Promise((r) => (openAudio = r));
  await page.click('#saveBtn');
  await sleep(500);
  await shot('add_downloading', { save: '#saveBtn' });
  openAudio(); gates.audio = null;
  await page.waitForSelector('.saved');
  await sleep(350);
  await shot('add_saved', { saved: '.saved', icon: '.saved .big-icon', play: '#playNow', toast: '.toast' });
  await sleep(3500);
  // ---- Library ----
  await page.click('.tabbar a:nth-child(1), .tabbar button:nth-child(1)');
  await page.waitForSelector('[data-go="#/playlist/pl0"]');
  await sleep(600);
  await shot('library', { all: '[data-go="#/playlist/all"], .grid > *:nth-child(1)', lnd: '[data-go="#/playlist/pl0"]', grid: '.grid', newpl: 'text=New playlist' });
  // ---- Playlist, tap the new sound ----
  await page.click('[data-go="#/playlist/pl0"]');
  await page.waitForSelector('.pl-header');
  await sleep(500);
  await shot('playlist', { header: '.pl-header', play: '#plPlay', rows: '.track-list, .tracks, ul' });
  const row = page.locator('.track:has-text("Midnight Drive"), li:has-text("Midnight Drive")').first();
  await row.scrollIntoViewIfNeeded();
  await sleep(300);
  await shot('playlist_scrolled', { row: '.track:has-text("Midnight Drive"), li:has-text("Midnight Drive")' });
  await row.click();
  await page.waitForSelector('.mini-player:not([hidden])');
  await sleep(500);
  await page.mouse.move(2, 400);
  await page.evaluate(() => { audio.currentTime = 52; const v = document.querySelector('#view');
    const r = [...document.querySelectorAll('#view li, #view .track')].find((e) => /Midnight Drive/.test(e.textContent));
    const m = document.querySelector('.mini-player').getBoundingClientRect();
    v.scrollTop += r.getBoundingClientRect().bottom - (m.top - 16); });
  await sleep(900);
  await shot('playlist_playing', { row: '.track:has-text("Midnight Drive"), li:has-text("Midnight Drive")', mini: '.mini-player', play: '#plPlay' });
  // ---- Full player ----
  await page.click('#miniOpen');
  await sleep(900);
  await page.mouse.move(2, 300); await sleep(200);
  await shot('player', { art: '#playerCover', title: '#playerTitle', artist: '#playerArtist', play: '#playBtn', seek: '#seek', shuffle: '#shuffleBtn', repeat: '#repeatBtn', controls: '.controls', ctx: '#playerContext' });
  await page.evaluate(() => { audio.currentTime = 58; }); await sleep(600);
  await shot('player_b');
  // close player, search
  await page.click('#playerClose'); await sleep(800);
  await page.click('.tabbar [data-tab=search]');
  await sleep(500);
  const sInput = page.locator('#view input').first();
  await sInput.click().catch(() => {});
  for (const ch of 'sped') { await page.keyboard.type(ch); await sleep(90); }
  await sleep(600);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await sleep(300);
  await shot('search', { input: '#view input' });

  fs.writeFileSync(path.join(OUT, 'rects.json'), JSON.stringify({ dsf: DSF, viewport: [393, 852], rects }, null, 1));
  await browser.close();
  if (errors.length) console.error('Page errors:\n' + errors.join('\n'));
  console.log('done');
}
main().catch((e) => { console.error(e); process.exit(1); });
