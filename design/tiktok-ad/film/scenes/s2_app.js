/* s2 THE DROP (CUT1 → CUT2): the logo lands on the drop over the reply's own gradient, the dark stage floods up from
   below and pushes it out, and the real app (screenshots of real interactions, demo library) shows what it does:
   paste a link → found → pick a playlist → save → library → tap the sound → it plays → full player → needle into the cover. */
(function () {
  const { el, E, p, lerp, clamp, kf } = FILM;
  const AY = 975;                                   // where the camera's point of interest sits on screen
  const B = (k) => FB(k);
  const T = {
    in: B(9), paste: 5.84, loading: 5.9, preview: B(10), scroll: B(11), chip: 6.97, checked: 7.03, save: 7.21, dl: 7.27,
    saved: B(12), lib: B(13), tile: 8.43, pl: B(14), row: 8.80, playing: 8.86, mini: 9.02, player: B(15),
  };
  const SHOTS = ['add_empty', 'add_loading', 'add_preview', 'add_preview_scrolled', 'add_checked', 'add_downloading', 'add_saved', 'library', 'playlist_scrolled', 'playlist_playing', 'player'];
  const STATE = [[T.in, 'add_empty'], [T.loading, 'add_loading'], [T.preview, 'add_preview'], [T.scroll, 'add_preview_scrolled'], [T.checked, 'add_checked'],
    [T.dl, 'add_downloading'], [T.saved, 'add_saved'], [T.lib, 'library'], [T.pl, 'playlist_scrolled'], [T.playing, 'playlist_playing']];
  const SCROLL = 109;                               // add_preview → add_preview_scrolled: the page scrolled 109 css px
  const NEED0 = 9.56;
  // the scroll from the found sound down to the playlists: one move, fastest on the beat where the screenshot changes
  const scrollC = (t) => lerp(362, 699, E.inOut(2.4)(p(t, T.scroll - .26, T.scroll + .34)));
  function cam(t) {                                  // → [px, py, S] in phone CSS px
    if (t < T.preview) return [196, 205, lerp(2.1, 2.16, E.glide(p(t, T.in, T.preview)))];
    if (t < T.scroll - .26) { const q = E.smooth(p(t, T.preview, T.preview + .6)); return [196, lerp(205, 362, q), lerp(2.16, 1.76, q)]; }
    if (t < T.scroll + .34) { const c = scrollC(t), S = lerp(1.76, 2.0, E.inOut(2)(p(t, T.scroll - .26, T.scroll + .34))); return [196, t < T.scroll ? c : c - SCROLL, S]; }
    if (t < T.saved) return [196, lerp(590, 618, E.smooth(p(t, T.checked, T.checked + .3))), 2.0];
    if (t < T.lib) { const q = E.out(3)(p(t, T.saved, T.saved + .38)); return [196, lerp(462, 490, q), lerp(1.84, 1.92, q) + .07 * E.glide(p(t, T.saved + .3, T.lib))]; }
    if (t < T.pl) { const q = E.out(3)(p(t, T.lib, T.lib + .4)); return [196, lerp(300, 330, q), lerp(1.82, 1.9, q)]; }
    if (t < T.player) { const q = E.out(3)(p(t, T.pl, T.pl + .4)); const py = lerp(530, 560, q) - (t >= T.playing ? 66 : 0); return [196, py, lerp(1.64, 1.7, q)]; }
    // player opens (slides up 0.25 s), camera settles on it, then pushes into the cover and needles through it
    const q = E.smooth(p(t, T.player, T.player + .4));
    let py = lerp(494, 462, q), S = lerp(1.7, 1.5, q);
    const nq = p(t, NEED0, CUT2);
    if (nq > 0) { py = lerp(462, 308, E.inOut(2)(nq)); S = 1.5 * Math.exp(Math.log(10.5) * E.in(4.2)(nq)); }
    return [196, py, S];
  }
  FILM.scene({ id: 's2', t0: CUT1, t1: CUT2,
    build(root) {
      root.style.zIndex = 9;
      // ---- logo lockup (lands on the drop) ----
      this.logo = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px', root);
      const lk = this.lk = el('div', 'position:absolute;left:540px;top:900px;display:flex;align-items:center;gap:34px;transform-origin:0 0', this.logo);
      this.mk = el('div', 'filter:drop-shadow(0 18px 40px rgba(60,0,30,.45))', lk, markSVG(196, 'mL'));
      el('div', 'font:800 156px Inter;letter-spacing:-.045em;color:#fff;text-shadow:0 12px 50px rgba(90,0,40,.35);line-height:1;padding-bottom:12px', lk, 'Tikify');
      this.lkW = lk.offsetWidth; this.lkH = lk.offsetHeight;
      // ---- phone ----
      this.win = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px', root);
      this.null = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px', this.win);
      this.cam = el('div', 'position:absolute;left:0;top:0;width:393px;height:852px;transform-origin:0 0', this.null);
      el('div', 'position:absolute;left:-150px;top:-60px;width:693px;height:900px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,45,122,.34),rgba(139,92,255,.16) 55%,rgba(0,0,0,0));filter:blur(30px)', this.cam);
      const ph = this.ph = el('div', 'position:absolute;left:0;top:0;width:393px;height:852px;border-radius:50px;overflow:hidden;background:#08070b;box-shadow:0 0 0 7px #0c0b0f,0 0 0 8.4px rgba(255,255,255,.17),0 36px 110px rgba(0,0,0,.62)', this.cam);
      this.img = {};
      for (const s of SHOTS) this.img[s] = el('img', 'position:absolute;left:0;top:0;width:393px;height:852px;display:none', ph);
      for (const s of SHOTS) this.img[s].src = `assets/cap/${s}.png`;
      this.img.player.style.zIndex = 2;
      this.taps = el('div', 'position:absolute;left:0;top:0;width:393px;height:852px;z-index:5', ph);
      this.tap = [tapRing(this.taps), tapRing(this.taps)];
    },
    async update(lt, t) {
      // ---- logo: from far (×0.36) decelerating in = the needle's forward motion continues; pushed up by the stage ----
      const la = p(t, CUT1, CUT1 + .5), ls = Math.exp(Math.log(.36) * (1 - E.out(3)(la)));
      const ly = -1250 * E.in(3)(p(t, 5.27, T.in));
      this.logo.style.display = t < T.in ? 'block' : 'none';
      this.lk.style.transform = `translate(${-this.lkW / 2}px,${-this.lkH / 2 + ly}px) scale(${ls})`;
      this.lk.style.transformOrigin = `${this.lkW / 2}px ${this.lkH / 2}px`;
      this.lk.style.filter = la < .45 ? `blur(${((1 - la / .45) * 10).toFixed(1)}px)` : 'none';
      pulseBars(this.mk, t, .28);
      // ---- phone ----
      const on = t >= T.in;
      this.win.style.display = on ? 'block' : 'none';
      if (!on) return;
      // window: content passes under a soft edge below the captions; it opens up for the needle
      const mt = lerp(430, -420, E.inOut(2)(p(t, 9.42, 9.72)));
      this.win.style.webkitMaskImage = this.win.style.maskImage = `linear-gradient(180deg,rgba(0,0,0,0) ${mt}px,#000 ${mt + 95}px)`;
      // entrance: rises in at the speed the logo leaves (push), decelerating
      const ey = 1150 * Math.pow(1 - E.out(3.2)(p(t, T.in, T.in + .5)), 1);
      this.null.style.transform = `translateY(${ey.toFixed(1)}px)`;
      const [px, py, S] = cam(t);
      this.cam.style.transform = `translate(${540 - px * S}px,${AY - py * S}px) scale(${S})`;
      // state
      let cur = STATE[0][1]; for (const [ts, n] of STATE) if (FILM.TQ(t) >= ts - 1e-6) cur = n;
      for (const s of SHOTS) this.img[s].style.display = s === cur ? 'block' : 'none';
      // the full player slides up over the playlist, as the app does (transform .25s ease)
      const po = t >= T.player;
      this.img.player.style.display = po ? 'block' : 'none';
      if (po) this.img.player.style.transform = `translateY(${(852 * (1 - E.bez(.25, .1, .25, 1)(p(t, T.player, T.player + .25)))).toFixed(1)}px)`;
      // taps (real targets, from the captured layout)
      const taps = [[T.paste, 351, 148], [T.chip, 104, 589], [T.save, 196, 738], [T.tile, 291, 203], [T.row, 196, 725], [T.mini, 120, 738]];
      let used = 0;
      for (const [tt, x, y] of taps) if (t > tt - .16 && t < tt + .44 && used < 2) this.tap[used++](t, tt, x, y);
      for (let i = used; i < 2; i++) this.tap[i](t, -9, 0, 0);
      await Promise.all(SHOTS.filter((s) => s === cur || (s === 'player' && po)).map((s) => (this.img[s].complete && this.img[s].naturalWidth ? null : this.img[s].decode().catch(() => {}))));
    },
    zoom(lt) { const t = lt + CUT1; if (t < CUT1 + .5) return Math.exp(Math.log(.36) * (1 - E.out(3)(p(t, CUT1, CUT1 + .5)))); return cam(t)[2]; },
  });
})();
