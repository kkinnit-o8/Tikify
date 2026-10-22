// Renders a frame range of a page to a video chunk, or stills. Usage:
//   node render_par.js page.html "part=body" out.mp4 60 START END     -> frames [START, END) as video only
//   node render_par.js page.html "part=body" outdir stills 0.5,1.2     -> PNGs at those seconds
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const [,, html, query, out, a4, a5, a6] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto('file://' + path.resolve(html) + '?' + query);
  await page.evaluate(() => window.ready);
  if (a4 === 'stills') {
    for (const s of a5.split(',').map(Number)) {
      await page.evaluate((t) => seek(t), s);
      await page.screenshot({ path: `${out}/${query.replace(/\W/g, '')}_${s.toFixed(3)}.png` });
    }
    return browser.close();
  }
  const fps = Number(a4), start = Number(a5), end = Number(a6);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '10', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = start; f < end; f++) {
    await page.evaluate((t) => seek(t), f / fps);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - start) % 60 === 0) console.log(`${out}: ${f - start}/${end - start}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
})();
