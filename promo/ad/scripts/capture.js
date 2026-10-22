// Captures real Tikify screens (360x640 @3x = 1080x1920) for the ad, with the lookup service mocked.
const { chromium } = require('playwright');
const fs = require('fs');
const [,, base, out, coverPath] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, serviceWorkers: 'block', colorScheme: 'dark' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.route('https://www.tikwm.com/api/**', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 0, data: {
    id: '7420000000000000001', title: 'late night drive 🌙', cover: 'https://cdn.example/cover.jpg', duration: 42,
    author: { unique_id: 'nightdrive', nickname: 'Night Drive' },
    music_info: { id: '7420000000000000099', title: 'Midnight City (sped up)', author: 'Neon Waves', original: false, play: 'https://cdn.example/a.mp3', cover: 'https://cdn.example/cover.jpg', duration: 42 } } }) }));
  await page.route('https://cdn.example/cover.jpg', (r) => r.fulfill({ contentType: 'image/jpeg', body: fs.readFileSync(coverPath) }));
  await page.goto(base);
  await page.waitForTimeout(800);
  for (const n of ['Gym', 'Chill', 'Road trip']) await page.evaluate((n) => createPlaylist(n), n);
  await page.goto(base + '#/add');
  await page.waitForTimeout(600);
  await page.screenshot({ path: out + '/add_empty.png' });
  await page.fill('#linkInput', 'https://vm.tiktok.com/ZMh8kQ2xR/');
  await page.evaluate(() => { const i = document.querySelector('#linkInput'); i.blur(); i.scrollLeft = 0; });
  await page.screenshot({ path: out + '/add_link.png' });
  await page.click('#findBtn');
  await page.waitForSelector('.preview');
  await page.waitForTimeout(500);
  await page.click('label.pl-check:has-text("Gym")'); await page.evaluate(() => { document.activeElement.blur(); for (const el of document.querySelectorAll('*')) if (el.scrollTop) el.scrollTop = 0; document.querySelector('#linkInput').scrollLeft = 0; });
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.screenshot({ path: out + '/add_preview.png' });
  // The whole preview card in one tall image (tab bar hidden), to scroll through smoothly in the ad.
  await page.setViewportSize({ width: 360, height: 1200 });
  await page.addStyleTag({ content: '.tabbar{display:none!important}' });
  await page.waitForTimeout(300);
  await page.evaluate(() => { for (const el of document.querySelectorAll('*')) if (el.scrollTop) el.scrollTop = 0; });
  await page.screenshot({ path: out + '/add_tall.png' });
  await page.setViewportSize({ width: 360, height: 640 });
  await page.addStyleTag({ content: '.tabbar{display:flex!important}' });
  await page.route('https://cdn.example/a.mp3', (r) => r.fulfill({ contentType: 'audio/mpeg', body: Buffer.alloc(40000, 1) }));
  await page.click('#saveBtn');
  await page.waitForSelector('.saved');
  await page.waitForTimeout(400);
  await page.evaluate(() => { for (const el of document.querySelectorAll('*')) if (el.scrollTop) el.scrollTop = 0; });
  await page.screenshot({ path: out + '/add_saved.png' });
  await browser.close();
})();
