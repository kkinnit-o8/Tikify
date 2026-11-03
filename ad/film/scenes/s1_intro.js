/* 0.0–6.2  INTRO — ref beat: glowing app icons one by one → "All in one place." → icons collapse into a dot on a line → wordmark.
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
  const CY = 860, TILE = 300, GAP = 380, ROWZ = .47;
  // glow follows the centred sound; then neutral violet for the row and the wordmark
  L.GLOW.push([0, '#ff6a3d', .3, 540, CY, 420, 460], [.25, '#ff6a3d', .62, 540, CY, 470, 520]);
  SOUNDS.forEach((s, i) => { if (i) L.GLOW.push([.5 * i - .12, SOUNDS[i - 1][2], .62, 540, CY, 470, 520], [.5 * i + .06, s[2], .64, 540, CY, 470, 520]); });
  L.GLOW.push([2.42, '#ff9a2a', .62, 540, CY, 470, 520], [3.0, '#6c5ce7', .55, 540, CY, 620, 520], [3.55, '#6c5ce7', .5, 540, CY, 560, 470],
    [4.05, '#7d6cf0', .3, 540, CY, 380, 320], [4.5, '#7d6cf0', .62, 540, CY, 640, 560], [5.9, '#6c5ce7', .52, 540, CY + 40, 600, 600]);

  // carousel position (which sound is centred): 0.28 s moves that land on the beat (0.5, 1.0, 1.5, 2.0)
  const posAt = (t) => kf(t, [[0, 0], [.22, 0], [.5, 1, E.smooth], [.72, 1], [1.0, 2, E.smooth], [1.22, 2], [1.5, 3, E.smooth], [1.72, 3], [2.0, 4, E.smooth],
    [2.42, 4], [3.02, 2, E.smooth]]);
  const zoomAt = (t) => FILM.zoom(t, 2.42, 3.02, 1, ROWZ, E.smooth);
  const rowQ = (t) => E.smooth(p(t, 2.42, 3.02));

  FILM.scene({ id: 's1', t0: 0, t1: 6.2, post: .05,
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
      const k0 = E.soft(p(t, -.18, .42));                                // first sound already 30 % in on frame 0
      this.tiles.forEach((o, i) => {
        const d = Math.abs(i - pos), dim = 1 - rq;
        let x = 540 + (i - pos) * GAP * Z, y = CY, s = Z * (1 - .24 * Math.min(d, 1.5) * dim);
        let op = lerp(d < 1 ? 1 - .72 * d : .28 * (1 - clamp(d - 1)), 1, rq), bl = 7 * Math.min(d, 1) * dim;
        if (i === 0) { s *= lerp(.84, 1, k0); bl += 14 * (1 - k0); }
        op *= i === 0 ? clamp(k0 * 1.6) : clamp((t + .1) / .4);
        // collapse into the knob: outer tiles leave first, all land on the centre at 4.02
        const c0 = 3.5 + .05 * (2 - Math.abs(i - 2)), cq = E.in(3)(p(t, c0, 4.02));
        if (t > c0) { x = lerp(x, 540, cq); s = lerp(s, 34 / TILE, cq); bl = lerp(bl, 0, cq); }
        o.w.style.display = op < .01 || t > 4.06 ? 'none' : 'block';
        o.w.style.opacity = op; o.w.style.filter = bl > .3 ? `blur(${bl}px)` : 'none';
        o.w.style.transform = `translate(${x}px,${y}px) scale(${s})`;
        o.img.style.borderRadius = `${lerp(68, TILE / 2, E.smooth(p(t, c0, 3.95)))}px`;
        o.white.style.opacity = E.in(2)(p(t, c0 + .1, 4.0));
        o.note.style.opacity = 1 - p(t, c0, c0 + .25);
        o.lab.style.opacity = Math.max(0, 1 - 1.9 * d) * (1 - rq);
        o.img.style.boxShadow = `0 30px 80px rgba(0,0,0,.55), 0 0 ${120 * (1 - Math.min(d, 1)) * (1 - cq)}px ${L.rgba(L.mix(o.col, o.col, 0), .45 * (1 - rq))}`;
      });
      L.capUpdate(this.cap, t, 2.72, 3.42);
      // knob + bar 4.0 → 4.62
      const on = t >= 4.0 && t < 4.7;
      this.bar.style.display = on ? 'block' : 'none';
      if (on) {
        const W = 640 * E.soft(p(t, 4.0, 4.34)), left = -W / 2;
        const kx = t < 4.26 ? lerp(0, -320, E.soft(p(t, 4.0, 4.26))) : lerp(-320, 320, E.in(2)(p(t, 4.26, 4.5)));
        const sq = E.in(3)(p(t, 4.5, 4.64));                                 // the bar snaps shut into the wordmark's centre
        this.bar.style.transform = `scaleX(${1 - sq})`; this.bar.style.opacity = 1 - sq * .6;
        this.track.style.left = left + 'px'; this.track.style.width = W + 'px';
        this.fill.style.left = left + 'px'; this.fill.style.width = Math.max(0, kx - left) + 'px';
        this.knob.style.transform = `translateX(${kx}px) scale(${1 + .25 * Math.exp(-(((t - 4.5) / .05) ** 2))})`;
      }
      // wordmark: grows out of the bar's centre on the drop, letters rise; then flies at the camera into the phone shot
      const wq = E.soft(p(t, 4.48, 5.05)), fly = E.in(3)(p(t, 5.86, 6.2));
      this.wm.style.display = t < 4.46 || t > 6.2 ? 'none' : 'block';
      const ws = lerp(.72, 1, wq) * lerp(1, 1.035, E.glide(p(t, 4.6, 5.9))) * FILM.zoom(fly, 0, 1, 1, 1.9, E.lin);
      this.wm.style.transform = `scale(${ws})`;
      this.wm.style.filter = (fly > .02 || wq < .98) ? `blur(${(1 - wq) * 14 + fly * 18}px)` : 'none';
      this.wm.style.opacity = clamp(wq * 2) * (1 - E.in(2)(p(t, 6.0, 6.2)));
      const iq = E.soft(p(t, 4.53, 5.0)); this.icon.style.transform = `scale(${lerp(.3, 1, iq)}) rotate(${lerp(-14, 0, iq)}deg)`; this.icon.style.opacity = clamp(iq * 3);
      FILM.riseGlyphs(this.letters, t, 4.56, .035, .55, 140);
      L.capUpdate(this.sub, t, 4.9, 9, .06, '#c9c9d2');
    },
    zoom(lt) { return lt < 3 ? zoomAt(lt) : FILM.zoom(lt, 5.86, 6.2, 1, 1.9, E.in(3)); },
  });
  [0, .5, 1, 1.5, 2].forEach((t, i) => FILM.cue('tile' + i, t, 'pluck'));
  FILM.cue('row', 2.45, 'whoosh'); FILM.cue('collapse', 3.5, 'riser'); FILM.cue('knob', 4.0, 'pop'); FILM.cue('drop', 4.5, 'hit');
  FILM.cue('fly', 5.86, 'whoosh');
})();
