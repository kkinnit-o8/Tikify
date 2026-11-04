// Renders frames [from,to) of the film with sub-frame motion blur (180° shutter). Sub-frames are JPEGs, blended by blend.py.
//   node render.js <subDir> <from> <to> <base N> <hi N> "<t0-t1,t0-t1,...>"
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [dir, from, to, nb, nh, win] = process.argv.slice(2);
  const fast = (win || '').split(',').filter(Boolean).map((w) => w.split('-').map(Number));
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await pg.goto('file://' + path.resolve(__dirname, 'film/index.html'));
  await pg.waitForFunction(() => window.__comp, null, { timeout: 60000 });
  const { fps } = await pg.evaluate(() => window.__comp);
  const hard = await pg.evaluate(() => [CUT1, CUT2]);
  const SH = 0.5 / fps;
  for (let f = +from; f < +to; f++) {
    const t = f / fps;
    const N = fast.some(([a, c]) => t >= a && t <= c) ? +nh : +nb;
    const meta = [];
    for (let j = 0; j < N; j++) {
      let ts = N === 1 ? t : t + ((j + .5) / N - .5) * SH;
      for (const c of hard) { if (t < c && ts >= c) ts = c - 1e-4; if (t >= c && ts < c) ts = c; }
      ts = Math.max(0, ts);
      await pg.evaluate((x) => window.__seek(x), ts);
      const out = path.join(dir, `f${String(f).padStart(4, '0')}_${String(j).padStart(2, '0')}.jpg`);
      await pg.screenshot({ path: out, type: 'jpeg', quality: 95 });
    }
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.n`), String(N));
  }
  const errs = await pg.evaluate(() => window.__errors());
  if (errs.length) console.log('SCENE ERRORS', errs);
  await b.close();
  console.log('worker done', from, to);
})();
