// Deterministic frame capture of film/index.html with Playwright: sub-frame motion blur (windows from window.__blur),
// sub-frames never straddle a hard cut (window.__cues.hard). Usage:
//   node capture_film.mjs <out_dir> [--from f] [--to f] [--every n] [--offset k] [--stills t1,t2,...] [--sub n] [--shutter 0.5] [--qa]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const outDir = resolve(args[0]);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FROM = parseInt(opt('--from', '0')), TO = opt('--to', null), EVERY = parseInt(opt('--every', '1')), OFFSET = parseInt(opt('--offset', '0'));
const STILLS = opt('--stills', null); const SUB = parseInt(opt('--sub', '2')); const SHUT = parseFloat(opt('--shutter', '0.5')); const QA = args.includes('--qa');
const PAGE = 'file:///tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad/film/index.html';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--force-color-profile=srgb', '--disable-lcd-text'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(PAGE);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const comp = await page.evaluate(() => window.__comp);
const blur = await page.evaluate(() => window.__blur || []);
const hard = await page.evaluate(() => (window.__cues && window.__cues.hard) || []);
const fps = comp.fps, total = Math.round(comp.duration * fps);
console.log('comp', comp, 'frames', total, 'blur windows', blur.length, 'hard cuts', hard.length);
if (QA) { console.log((await page.evaluate(() => window.__qa())).join('\n')); const errs = await page.evaluate(() => window.__errors()); if (errs.length) console.log('SCENE ERRORS\n' + errs.join('\n')); await browser.close(); process.exit(0); }

const seek = async (t) => { await page.evaluate((t) => window.__seek(t), t); };
const shot = async (path, png = false) => { await page.screenshot(png ? { path, type: 'png' } : { path, type: 'jpeg', quality: 96 }); };

if (STILLS) {
  for (const ts of STILLS.split(',').map(Number)) { await seek(ts); await shot(`${outDir}/still_${ts.toFixed(3)}.png`, true); }
  const errs = await page.evaluate(() => window.__errors()); if (errs.length) console.log('SCENE ERRORS\n' + errs.join('\n'));
  await browser.close(); process.exit(0);
}
const subAt = (t) => { let n = SUB; for (const [a, b, k] of blur) if (t >= a && t <= b) n = Math.max(n, k); return n; };
const to = TO ? parseInt(TO) : total;
const t0 = Date.now(); let done = 0;
for (let f = FROM + OFFSET; f < to; f += EVERY) {
  const t = f / fps, n = subAt(t), span = SHUT / fps;
  const cut = hard.find((c) => c > t + 1e-6 && c < t + span);        // a hard cut inside this frame's shutter → stay on this side
  const times = []; for (let k = 0; k < n; k++) { let ts = t + (k / n) * span; if (cut && ts >= cut) ts = cut - 1e-4; times.push(ts); }
  if (n === 1) { await seek(t); await shot(`${outDir}/f_${String(f).padStart(5, '0')}.png`, true); }
  else for (let k = 0; k < n; k++) { await seek(times[k]); await shot(`${outDir}/f_${String(f).padStart(5, '0')}_${String(k).padStart(2, '0')}.jpg`); }
  done++;
  if (done % 25 === 0) console.log(`f ${f}/${to}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
const errs = await page.evaluate(() => window.__errors()); if (errs.length) console.log('SCENE ERRORS\n' + errs.join('\n'));
await browser.close();
console.log('done', done, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
