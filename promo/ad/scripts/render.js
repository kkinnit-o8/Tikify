// Renders ad.html frame by frame. Usage:
//   node render.js ad.html out.mp4 [fps]            -> video (silent AAC track for upload compatibility)
//   node render.js ad.html outdir --stills 1,2.5,4   -> PNG stills at those seconds
//   node render.js ad.html out.mp4 60 SPEED LEN       -> video only, ad time = real time * SPEED, LEN real seconds
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const [,, html, out, arg3, arg4] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto('file://' + path.resolve(html));
  await page.evaluate(() => window.ready);
  if (arg3 === '--stills') {
    for (const s of arg4.split(',').map(Number)) {
      await page.evaluate((t) => seek(t), s);
      await page.screenshot({ path: `${out}/still_${s.toFixed(2)}.png` });
    }
    return browser.close();
  }
  const fps = Number(arg3) || 30;
  const speed = Number(arg4) || 1;
  const len = Number(process.argv[6]) || 0;
  const dur = len || await page.evaluate(() => DURATION);
  const audio = len ? ['-an'] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', '-c:a', 'aac', '-b:a', '128k'];
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    ...audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps),
    '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(dur * fps);
  for (let f = 0; f < n; f++) {
    await page.evaluate((t) => seek(t), (f / fps) * speed);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${n}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
})();
