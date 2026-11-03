/* 0.0–5.78  INTRO (on the music: one sound per beat 0–4, knob on beat 6, wordmark on the downbeat 4.521) — ref beat: glowing app icons one by one → "All in one place." → icons collapse into a dot on a line → wordmark.
   Tikify: five TikTok sounds (cover + name) slide through a carousel, each lighting the glow in its own colour → the row
   → they collapse into the seek-bar knob → the knob plays the bar to its end on the drop (4.5) → the bar becomes the wordmark. */
(function () {
  const { p, tw, kf, E, el, clamp, lerp, TQ } = FILM;
  const SOUNDS = [
    ['c2', 'original sound', '#ff6a3d'],
    ['c1', 'sped up', '#e8357c'],
    ['c3', 'slowed + reverb', '#7b5cf6'],
    ['c4', 'that one audio', '#25c8f4'],
    ['c5', 'gym phonk', '#ff9a2a'],
  ];
  const CY = 860, TILE = 300, GAP = 380, ROWZ = .47, B = L.B;
  const ARR = [0, 1, 2, 3, 4].map(B);                                  // each sound lands on a beat: 0.188 … 2.664
  const ROW0 = 2.85, ROW1 = 3.42, COL1 = 3.89, KNOB = B(6), WM = B(7), FLY0 = 5.42, FLY1 = B(9);
  // glow follows the centred sound; then neutral violet for the row and the wordmark
  L.GLOW.push([0, '#ff6a3d', .34, 540, CY, 420, 460], [.2, '#ff6a3d', .64, 540, CY, 470, 520]);
  SOUNDS.forEach((s, i) => { if (i) L.GLOW.push([ARR[i] - .14, SOUNDS[i - 1][2], .62, 540, CY, 470, 520], [ARR[i] + .04, s[2], .66, 540, CY, 470, 520]); });
  L.GLOW.push([ROW0, '#ff9a2a', .62, 540, CY, 470, 520], [ROW1, '#6c5ce7', .55, 540, CY, 620, 520], [3.5, '#6c5ce7', .5, 540, CY, 560, 470],
    [KNOB, '#7d6cf0', .3, 540, CY, 380, 320], [WM, '#7d6cf0', .64, 540, CY, 640, 560], [FLY0, '#6c5ce7', .54, 540, CY + 40, 600, 600]);

  // carousel position (which sound is centred): 0.3 s moves whose PEAK SPEED sits on the beat (E.smooth peaks at ~42 %)
  const posAt = (t) => kf(t, [[0, 0], ...[1, 2, 3, 4].flatMap((i) => [[ARR[i] - .13, i - 1], [ARR[i] + .17, i, E.smooth]]), [ROW0, 4], [ROW1, 2, E.smooth]]);
  const zoomAt = (t) => FILM.zoom(t, ROW0, ROW1, 1, ROWZ, E.smooth);
  const rowQ = (t) => E.smooth(p(t, ROW0, ROW1));

  FILM.scene({ id: 's1', t0: 0, t1: FLY1 + .02, post: .05,
    build(root) {
      this.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      this.tiles = SOUNDS.map(([c, name, col], i) => {
        const w = el('div', `position:absolute;left:0;top:0;width:${TILE}px;height:${TILE}px;margin:${-TILE / 2}px 0 0 ${-TILE / 2}px;will-change:transform`, this.cam);
        const img = el('div', `position:absolute;inset:0;border-radius:68px;overflow:hidden;background:url(covers/${c}.jpg) center/cover;
          box-shadow:0 30px 80px rgba(0,0,0,.55), 0 0 0 1.5px rgba(255,255,255,.10) inset`, w);
        el('div', 'position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.22),rgba(255,255,255,0) 40%)', img);
        const note = el('div', 'position:absolute;inset:0;display:grid;place-items:center', img,
          '<svg viewBox="0 0 24 24" width="104" height="104" fill="#fff" style="filter:drop-shadow(0 6px 18px rgba(0,0,0,.25))"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>');
        const white = el('div', 'position:absolute;inset:0;background:#fff;opacity:0', img);
        const lab = el('div', `position:absolute;left:50%;top:${TILE + 44}px;transform:translateX(-50%);white-space:nowrap;font:600 50px/1 Inter;letter-spacing:-.02em;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.5)`, w, name);
        return { w, img, note, white, lab, col };
      });
      this.cap = L.caption(root, 'All in one place.', { y: 1080, size: 58 });
      // seek bar: track + played fill + knob (Tikify's player seek: 4px track, 14px white thumb — here at film scale)
      this.bar = el('div', `position:absolute;left:540px;top:${CY}px;width:0;height:0`, root);
      this.track = el('div', 'position:absolute;left:0;top:-4px;height:8px;border-radius:4px;background:rgba(255,255,255,.26)', this.bar);
      this.fill = el('div', 'position:absolute;left:0;top:-4px;height:8px;border-radius:4px;background:#fff;box-shadow:0 0 24px rgba(255,255,255,.6)', this.bar);
      this.knob = el('div', 'position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:#fff;box-shadow:0 0 30px rgba(255,255,255,.75)', this.bar);
      // wordmark: the real app icon + "Tikify"; subtitle words
      this.wm = el('div', `position:absolute;left:0;top:${CY}px;width:1080px;height:0;transform-origin:540px 0`, root);
      const row = el('div', 'position:absolute;left:0;top:0;width:1080px;display:flex;justify-content:center;align-items:center;transform:translateY(-50%);gap:34px', this.wm);
      this.icon = el('img', 'width:156px;height:156px;display:block;filter:drop-shadow(0 18px 40px rgba(0,0,0,.45))', row); this.icon.src = '../../icons/icon-512.png';
      const word = el('div', 'font:800 164px/1 Inter;letter-spacing:-.05em;color:#fff;display:flex;padding-bottom:10px', row);
      this.letters = FILM.glyphs(word, 'Tikify');
      this.sub = L.caption(this.wm, 'music player for your TikTok sounds', { y: 150, size: 46, weight: 500 });
    },
    update(lt, t) {
      const pos = posAt(t), Z = zoomAt(t), rq = rowQ(t);
      const k0 = E.soft(p(t, -.22, ARR[0] + .22));                       // first sound already ~35 % in on frame 0, settled by the first beat
      this.tiles.forEach((o, i) => {
        const d = Math.abs(i - pos), dim = 1 - rq;
        let x = 540 + (i - pos) * GAP * Z, y = CY, s = Z * (1 - .24 * Math.min(d, 1.5) * dim);
        let op = lerp(d < 1 ? 1 - .72 * d : .28 * (1 - clamp(d - 1)), 1, rq), bl = 7 * Math.min(d, 1) * dim;
        if (i === 0) { s *= lerp(.84, 1, k0); bl += 14 * (1 - k0); }
        op *= i === 0 ? clamp(k0 * 1.6) : clamp((t + .1) / .4);
        // collapse into the knob: outer tiles leave first, all land on the centre just before beat 6 (the knob)
        const c0 = 3.44 + .05 * (2 - Math.abs(i - 2)), cq = E.in(3)(p(t, c0, COL1));
        if (t > c0) { x = lerp(x, 540, cq); s = lerp(s, 34 / TILE, cq); bl = lerp(bl, 0, cq); }
        o.w.style.display = op < .01 || t > COL1 + .04 ? 'none' : 'block';
        o.w.style.opacity = op; o.w.style.filter = bl > .3 ? `blur(${bl}px)` : 'none';
        o.w.style.transform = `translate(${x}px,${y}px) scale(${s})`;
        o.img.style.borderRadius = `${lerp(68, TILE / 2, E.smooth(p(t, c0, COL1 - .05)))}px`;
        o.white.style.opacity = E.in(2)(p(t, c0 + .08, COL1 - .02));
        o.note.style.opacity = 1 - p(t, c0, c0 + .25);
        o.lab.style.opacity = Math.max(0, 1 - 1.9 * d) * (1 - rq);
        o.img.style.boxShadow = `0 30px 80px rgba(0,0,0,.55), 0 0 ${120 * (1 - Math.min(d, 1)) * (1 - cq)}px ${L.rgba(L.mix(o.col, o.col, 0), .45 * (1 - rq))}`;
      });
      L.capUpdate(this.cap, t, 2.9, 3.64);
      // knob (beat 6) + bar; the knob runs the bar to its end ON the downbeat (4.521), where the wordmark grows out of it
      const on = t >= COL1 - .01 && t < WM + .18;
      this.bar.style.display = on ? 'block' : 'none';
      if (on) {
        const W = 640 * E.soft(p(t, KNOB - .02, KNOB + .3)), left = -W / 2;
        const kx = t < KNOB + .22 ? lerp(0, -320, E.soft(p(t, KNOB - .02, KNOB + .22))) : lerp(-320, 320, E.in(2)(p(t, KNOB + .22, WM)));
        const sq = E.in(3)(p(t, WM, WM + .14));                              // the bar snaps shut into the wordmark's centre
        this.bar.style.transform = `scaleX(${1 - sq})`; this.bar.style.opacity = 1 - sq * .6;
        this.track.style.left = left + 'px'; this.track.style.width = W + 'px';
        this.fill.style.left = left + 'px'; this.fill.style.width = Math.max(0, kx - left) + 'px';
        this.knob.style.transform = `translateX(${kx}px) scale(${1 + .25 * Math.exp(-(((t - WM) / .05) ** 2))})`;
      }
      // wordmark: grows out of the bar's centre on the drop, letters rise; then flies at the camera into the phone shot
      const wq = E.soft(p(t, WM - .02, WM + .55)), fly = E.in(3)(p(t, FLY0, FLY1));
      this.wm.style.display = t < WM - .04 || t > FLY1 ? 'none' : 'block';
      const ws = lerp(.72, 1, wq) * lerp(1, 1.035, E.glide(p(t, WM + .08, FLY0))) * FILM.zoom(fly, 0, 1, 1, 1.9, E.lin);
      this.wm.style.transform = `scale(${ws})`;
      this.wm.style.filter = (fly > .02 || wq < .98) ? `blur(${(1 - wq) * 14 + fly * 18}px)` : 'none';
      this.wm.style.opacity = clamp(wq * 2) * (1 - E.in(2)(p(t, FLY1 - .17, FLY1)));
      const iq = E.soft(p(t, WM + .01, WM + .48)); this.icon.style.transform = `scale(${lerp(.3, 1, iq)}) rotate(${lerp(-14, 0, iq)}deg)`; this.icon.style.opacity = clamp(iq * 3);
      FILM.riseGlyphs(this.letters, t, WM + .04, .035, .55, 140);
      L.capUpdate(this.sub, t, WM + .3, 99, .06, '#c9c9d2');
    },
    zoom(lt) { return lt < 3.5 ? zoomAt(lt) : FILM.zoom(lt, FLY0, FLY1, 1, 1.9, E.in(3)); },
  });
  ARR.forEach((t, i) => FILM.cue('tile' + i, t, 'beat'));
  FILM.cue('knob', KNOB, 'beat'); FILM.cue('wordmark', WM, 'beat'); FILM.cue('phone', FLY1, 'beat');
})();
