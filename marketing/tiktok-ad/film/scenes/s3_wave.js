/* s3 · 4.42–7.60 · "It's either slowed, sped up, bass boosted, or doesn't sound right on your app."
   ONE waveform acts every problem out: it grows out of the sound card's waveform (match by size, still flying forward),
   stretches (slowed), compresses (sped up), clips red and shakes (bass boosted), glitches (doesn't sound right); each big
   word lands on its spoken syllable and pushes the previous one out. At the end the waveform flattens into a line that
   s4 grows into the search capsule. */
(function () {
  const { E, p, el, clamp, lerp, settleShake } = FILM;
  const T = K.T, T0 = T.audioEnd, T1 = 7.60;
  const WX = 540, WY = 1240, WW = 1000, WH = 420;                   // resting waveform rect (centre, size)
  K.LINE = { x: 540, y: 960, w: 860 };                              // the flattened line that s4 turns into the capsule
  const WORDS = [
    { k: 'slowed', txt: 'slowed,', t: T.slowed, size: 196, pill: '0.8×' },
    { k: 'sped', txt: 'sped up,', t: T.sped, size: 196, pill: '1.25×' },
    { k: 'boost', txt: 'bass boosted,', t: T.bass, size: 150, pill: '+12 dB' },
    { k: 'wrong', txt: 'doesn’t sound<br>right', t: T.or, size: 140, pill: '✕  wrong version' },
  ];
  const wgv = (t) => E.smooth(p(t, T.or - .08, T.or + .2));
  let S = {};
  FILM.scene({
    id: 's3', t0: T0, t1: T1,
    zoom: (lt) => FILM.zoom(lt, 0, .34, K.WAVE0[2] * 1.6 / WW, 1, E.out(5)),
    build(root) {
      S.its = el('div', `position:absolute;left:0;right:0;top:470px;text-align:center;font-size:70px;font-weight:600;color:${K.C.inkSoft}`, root);
      S.its.className = 'disp'; S.wIts = K.words(S.its, 'It’s either');
      S.w = WORDS.map((w) => {
        const d = el('div', `position:absolute;left:0;right:0;top:${w.k === 'wrong' ? 540 : 600}px;text-align:center;font-size:${w.size}px;color:${K.C.ink};white-space:nowrap`, root, w.txt);
        d.className = 'disp';
        if (w.k === 'boost') d.style.fontWeight = 900;
        if (w.k === 'wrong') d.style.lineHeight = '1.02';
        return d;
      });
      S.pills = WORDS.map((w) => el('div', `position:absolute;left:50%;top:${w.k === 'wrong' ? 1010 : 850}px;transform:translateX(-50%);padding:14px 34px;border-radius:999px;` +
        `font:700 46px Inter;letter-spacing:-.01em;white-space:nowrap;color:${w.k === 'wrong' || w.k === 'boost' ? '#fff' : K.C.ink};` +
        `background:${w.k === 'wrong' || w.k === 'boost' ? K.C.danger : '#fff'};box-shadow:0 14px 40px rgba(60,30,90,.14)`, root, w.pill));
      S.app = el('div', `position:absolute;left:0;right:0;top:760px;text-align:center;font-size:66px;font-weight:600;color:${K.C.inkSoft}`, root);
      S.app.className = 'disp'; S.wApp = K.words(S.app, 'on your app.');
      S.wrap = el('div', `position:absolute;left:${WX - WW / 2}px;top:${WY - WH / 2}px;width:${WW}px;height:${WH}px;transform-origin:${WW / 2}px ${WH / 2}px`, root);
      S.cv = el('canvas', `position:absolute;left:0;top:0;width:${WW}px;height:${WH}px`, S.wrap); S.cv.width = WW; S.cv.height = WH;
      S.cx = S.cv.getContext('2d');
    },
    update(lt, t) {
      // --- the waveform: grows out of the card's (rect match), then acts out each word ---
      const g = E.out(5)(p(t, T0, T0 + .34));                          // carries the dive's speed through the cut
      const sx0 = K.WAVE0[2] * 1.6 / WW, sy0 = K.WAVE0[3] * 1.6 / WH;          // the card waveform's rect at the cut
      const cx = lerp(K.WAVE0[0], WX, g), cy = lerp(K.WAVE0[1], WY, g) + 70 * wgv(t);
      let sx = lerp(sx0, 1, g), sy = lerp(sy0, 1, g);
      // per-word parameters, blended over ~0.14 s around each onset
      const w = (k) => E.smooth(p(t, k - .08, k + .1));
      const ws = w(T.slowed), wp = w(T.sped), wb = w(T.bass), wg = w(T.or);
      const speed = lerp(lerp(lerp(lerp(1, .32, ws), 3.4, wp), 1.3, wb), 1, wg);
      const n = Math.round(lerp(lerp(lerp(lerp(46, 34, ws), 92, wp), 56, wb), 56, wg));
      const amp = lerp(lerp(lerp(lerp(.95, .8, ws), .9, wp), 1.7, wb), 1, wg);
      sx *= lerp(lerp(1, 1.08, ws), 1, wp);
      // collapse into a line at the end: height → 0, width → the capsule's, centre → frame centre
      const cl = E.smooth(p(t, 7.36, T1));
      const fy = lerp(cy, K.LINE.y, cl), fsx = lerp(sx, K.LINE.w / WW, cl);
      const shake = settleShake(t, T.bass, 16, 7, 8) + settleShake(t, T.boosted, 12, 7, 8);
      S.wrap.style.transform = `translate(${cx - WX + shake * (1 - wg)}px,${fy - WY}px) scale(${fsx},${sy})`;
      K.wave(S.cx, WW, WH, t, { n, speed, amp: amp * (1 - cl), clip: wb * (1 - wg), glitch: wg * (1 - cl), color: K.C.ink, gap: .36 });
      if (cl > 0) {                                                    // the line itself (bars at zero height leave dots)
        S.cx.fillStyle = K.C.ink; S.cx.globalAlpha = cl; S.cx.beginPath(); S.cx.roundRect(0, WH / 2 - 3 / sy, WW, 6 / sy, 3); S.cx.fill(); S.cx.globalAlpha = 1;
      }
      // --- words ---
      [T.its, T.either].forEach((t0, i) => K.wordIn(S.wIts[i], t, t0 - .05, .38, 24));
      const itsOut = K.wordOut(S.its, t, T.or - .06, .18, -70);
      WORDS.forEach((wd, i) => {
        const d = S.w[i], nx = WORDS[i + 1], tEnd = nx ? nx.t : 7.36;
        const on = t >= wd.t - .08 && t < tEnd + .18;
        d.style.display = on ? 'block' : 'none'; S.pills[i].style.display = on ? 'block' : 'none';
        if (!on) return;
        let q;
        if (wd.k === 'sped') {                                         // zips in fast from the right, x-smear
          q = E.out(4)(p(t, wd.t - .06, wd.t + .16));
          d.style.opacity = clamp(q * 3); d.style.transform = `translateX(${(1 - q) * 700}px) scaleX(${1 - .1 * (1 - q)})`;
          d.style.filter = q < .98 ? `blur(${(1 - q) * 18}px)` : 'none'; d.style.letterSpacing = '-.06em';
        } else {
          q = K.wordIn(d, t, wd.t - .06, wd.k === 'slowed' ? .6 : .36, 40, 16);
        }
        if (wd.k === 'slowed') d.style.letterSpacing = (lerp(-.035, .07, E.glide(p(t, wd.t, tEnd)))).toFixed(4) + 'em';   // time-stretched
        if (wd.k === 'boost') { const sh = settleShake(t, T.bass, 18, 9, 7) + settleShake(t, T.boosted, 14, 9, 7); d.style.transform += ` translateX(${sh}px) rotate(${sh * .08}deg)`; }
        if (wd.k === 'wrong') {                                        // glitch: RGB split + band jitter at 14 Hz
          const f = Math.floor(FILM.TQ(t) * 14), j = (FILM.hash(f * 2.3) - .5) * 22 * (1 - E.smooth(p(t, 7.2, 7.36)));
          d.style.textShadow = `${6 + j * .4}px 0 0 rgba(254,44,85,.7), ${-6 - j * .4}px 0 0 rgba(37,244,238,.75)`;
          d.style.transform += ` translateX(${j}px)`;
        }
        // exit: pushed up and out by the next word
        const out = E.in(2)(p(t, tEnd - .04, tEnd + .14));
        if (out > 0) { d.style.transform += ` translateY(${-110 * out}px)`; d.style.opacity = (1 - out) * (+d.style.opacity || 1); d.style.filter = `blur(${out * 14}px)`; }
        // pill: lands just after the word (chip overshoot ≤4 %)
        const pq = E.back(1.1)(p(t, wd.t + .05, wd.t + .35)), pe = clamp(p(t, wd.t + .05, wd.t + .14));
        S.pills[i].style.opacity = pe * (1 - out);
        S.pills[i].style.transform = `translateX(-50%) translateY(${(1 - pq) * 30 - 60 * out}px) scale(${.9 + .1 * pq})`;
      });
      [T.on, T.your, T.app].forEach((t0, i) => K.wordIn(S.wApp[i], t, t0 - .05, .34, 22));
      S.app.style.top = '858px';
      const ao = K.wordOut(S.app, t, 7.40, .18, -60);
    },
  });
  FILM.cue('glitch', T.or, 'glitch'); FILM.cue('thump', T.bass, 'thump'); FILM.cue('thump', T.boosted, 'thump');
})();
