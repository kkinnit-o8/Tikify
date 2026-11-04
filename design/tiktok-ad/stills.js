// Renders single frames of the film for checking: node stills.js out.jpg t1,t2,... (contact sheet via python later)
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [out, list] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await pg.goto('file://' + path.resolve(__dirname, 'film/index.html'));
  await pg.waitForFunction(() => window.__comp, null, { timeout: 30000 });
  console.log('errors', await pg.evaluate(() => window.__errors()));
  console.log('qa', await pg.evaluate(() => window.__qa()));
  for (const t of list.split(',').map(Number)) {
    await pg.evaluate((t) => window.__seek(t), t);
    await pg.screenshot({ path: path.join(out, `t${t.toFixed(3)}.jpg`), type: 'jpeg', quality: 88 });
  }
  console.log('errors after', await pg.evaluate(() => window.__errors()));
  await b.close();
})();
