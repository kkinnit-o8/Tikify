// Drive the REAL Tikify app (served locally) with mocked tikwm + CDN, save screenshots and DOM snapshots of each state.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2];
const COV = process.argv[3];
const TONE = process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
const SOUNDS = [
  { id: '7400000000000000001', title: 'summer nights (sped up)', author: 'nova', cover: 'c1' },
  { id: '7400000000000000002', title: 'original sound - lunawaves', author: 'lunawaves', cover: 'c2' },
  { id: '7400000000000000003', title: 'slowed + reverb', author: 'midnight.fm', cover: 'c3' },
  { id: '7400000000000000004', title: 'that one audio', author: 'user8172', cover: 'c4' },
  { id: '7400000000000000005', title: 'gym phonk', author: 'kxng', cover: 'c5' },
  { id: '7400000000000000006', title: 'late night drive', author: 'the waves', cover: 'c6' },
  { id: '7400000000000000007', title: 'dance challenge', author: 'DJ Nova', cover: 'c7' },
  { id: '7400000000000000008', title: 'midnight (slowed)', author: 'nova', cover: 'c8' },
];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  await ctx.route('https://www.tikwm.com/**', async (route) => {
    const u = new URL(route.request().url());
    const link = u.searchParams.get('url') || (route.request().postData() || '');
    const m = /video%2F(\d+)|video\/(\d+)/.exec(link + ' ' + decodeURIComponent(link));
    const vid = m && (m[1] || m[2]);
    const s = SOUNDS.find((x) => x.id === vid) || SOUNDS[0];
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({
      code: 0, msg: 'success', data: { id: s.id, title: s.title + ' #fyp', cover: `https://cdn.test/${s.cover}.jpg`, origin_cover: `https://cdn.test/${s.cover}.jpg`,
        music: `https://cdn.test/${s.id}.mp3`, play: `https://cdn.test/${s.id}.mp4`, duration: 30,
        music_info: { id: 'm' + s.id, title: s.title, author: s.author, original: /^original/.test(s.title), cover: `https://cdn.test/${s.cover}.jpg`, play: `https://cdn.test/${s.id}.mp3`, duration: 30 },
        author: { unique_id: s.author.replace(/\W/g, ''), nickname: s.author } } }) });
  });
  await ctx.route('https://cdn.test/**', async (route) => {
    const u = route.request().url();
    const hdr = { 'access-control-allow-origin': '*' };
    if (u.endsWith('.jpg')) return route.fulfill({ status: 200, contentType: 'image/jpeg', headers: hdr, body: fs.readFileSync(`${COV}/${u.split('/').pop()}`) });
    return route.fulfill({ status: 200, contentType: 'audio/mpeg', headers: hdr, body: fs.readFileSync(TONE) });
  });
  const AVG = JSON.parse(fs.readFileSync(COV + '/avg.json', 'utf8'));
  const shot = async (name) => {
    await page.waitForTimeout(450);
    await page.evaluate(async (AVG) => {
      const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
      const near = (c) => Object.entries(AVG).sort((a, b) => dist(a[1], c) - dist(b[1], c))[0][0];
      const avgOf = async (src) => { const im = new Image(); im.src = src; await im.decode(); const cv = document.createElement('canvas'); cv.width = cv.height = 8;
        const x = cv.getContext('2d'); x.drawImage(im, 0, 0, 8, 8); const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } return [r / 64, g / 64, b / 64]; };
      for (const img of document.querySelectorAll('img')) { const s = img.getAttribute('src') || ''; if (s.startsWith('blob:') || s.includes('cdn.test')) { try { img.setAttribute('data-cover', near(await avgOf(s))); } catch (e) {} } }
      const bg = document.getElementById('playerBg');
      if (bg && bg.style.backgroundImage) { const m = /url\("?(.*?)"?\)/.exec(bg.style.backgroundImage); if (m) { try { bg.setAttribute('data-cover', near(await avgOf(m[1]))); } catch (e) {} } }
    }, AVG);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    const html = await page.evaluate(() => document.getElementById('app').outerHTML + '\n<!--player-->\n' + (document.querySelector('.player') ? document.querySelector('.player').outerHTML : '') + '\n<!--toast-->\n' + [...document.querySelectorAll('.toast')].map((e) => e.outerHTML).join(''));
    fs.writeFileSync(`${OUT}/${name}.html`, html);
    console.log('shot', name);
  };
  await page.goto('http://127.0.0.1:8765/Tikify/');
  await page.waitForTimeout(1500);
  for (const sel of ['[data-later]', '[data-cancel]']) { const b = await page.$(sel); if (b) { await b.click().catch(() => {}); await page.waitForTimeout(300); } }
  await shot('00_first');
  // playlists
  for (const name of ['Gym', 'Chill', 'Road trip']) {
    await page.goto('http://127.0.0.1:8765/Tikify/#/library'); await page.waitForTimeout(500);
    await page.click('#newPl'); await page.waitForTimeout(300);
    await page.fill('.sheet-form input', name); await page.click('.sheet-form button[type=submit]'); await page.waitForTimeout(400);
  }
  // add sounds; the first one is the hero, captured in each state
  const plFor = { 0: ['Gym'], 1: ['Chill'], 2: ['Chill', 'Road trip'], 3: ['Gym'], 4: ['Gym'], 5: ['Road trip', 'Chill'], 6: ['Gym', 'Road trip'], 7: ['Chill', 'Gym'] };
  const order = [6, 4, 3, 7, 1, 2, 5, 0];
  for (const i of order) {
    const s = SOUNDS[i];
    await page.goto(`http://127.0.0.1:8765/Tikify/#/library`); await page.waitForTimeout(300);
    await page.goto(`http://127.0.0.1:8765/Tikify/#/add`); await page.reload(); await page.waitForTimeout(900);
    if (i === 0) await shot('10_add_empty');
    await page.fill('#linkInput', `https://www.tiktok.com/@${s.author.replace(/\W/g, '')}/video/${s.id}`);
    if (i === 0) await shot('11_add_link');
    await page.click('#findBtn');
    await page.waitForSelector('#saveBtn', { timeout: 15000 });
    if (i === 0) await shot('12_add_preview');
    for (const pl of plFor[i]) await page.click(`.pl-check:has-text("${pl}")`);
    if (i === 0) await shot('13_add_checked');
    await page.click('#saveBtn');
    await page.waitForSelector('.saved', { timeout: 15000 });
    if (i === 0) { await page.waitForTimeout(150); await shot('14_add_saved'); }
    await page.waitForTimeout(400);
  }
  await page.goto('http://127.0.0.1:8765/Tikify/#/library'); await page.waitForTimeout(900);
  await shot('20_library');
  await page.click('.row:has-text("Gym")'); await page.waitForTimeout(900);
  await shot('21_playlist');
  await page.click('.track:has-text("summer nights"), .row:has-text("summer nights")');
  await page.waitForTimeout(900);
  await shot('22_playlist_playing');
  const mini = await page.$('#miniOpen'); if (mini) await mini.click();
  await page.waitForTimeout(1200);
  await shot('23_player');
  await page.click('#playerClose'); await page.waitForTimeout(500);
  await page.goto('http://127.0.0.1:8765/Tikify/#/library'); await page.waitForTimeout(900);
  await shot('24_library_playing');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
