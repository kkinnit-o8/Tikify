/* DROP EDIT (DROP → END): logo hit → paste/find/save flow on a real phone → playlist → player → feature list → fan → end card.
   All UI is real app captures; cuts sit on the 168.9-BPM grid (TL.bars / TL.beats). */
(() => {
  const E = FILM.E, el = FILM.el, p = FILM.p, clamp = FILM.clamp;
  const T = TL, B = T.bars, BT = T.beats, DROP = T.DROP, END = T.dur;
  const beat = (bar, n) => B[bar - 1] + (n - 1) * T.BEAT;          // bar 1-based, beat 1-based
  const KICKS = [beat(5, 2), beat(8, 2), beat(9, 2), beat(10, 2), beat(12, 2), beat(13, 2), beat(14, 2)];
  const SNARES = [B[0], B[3], B[8], B[12], B[14]];
  const PW = 560, PL = 260, PT = 440;                                   // drop phone rect (mockup hand-off across cuts)
  const needle = (t, cut, a = 1, b = 1.12) => FILM.needle(t, cut, a, b, .2);
  const ICON = UI.APP + 'icons/icon-512.png';
  const BRAND = 'linear-gradient(135deg,#ff6a3d,#ff2d7a 55%,#8b5cff)';

  /* ---------- living background for the whole drop ---------- */
  let plate, glow, glow2;
  FILM.scene({
    id: 'bg', t0: DROP, t1: END,
    build(root) {
      el('div', 'position:absolute;inset:0;background:#08070b', root);
      plate = el('img', 'position:absolute;left:0;top:-60px;width:1080px;height:auto;opacity:.95;will-change:transform', root); plate.src = UI.ASSETS + 'bg_glow.png'; plate.decoding = 'sync';
      UI.pending.push(plate.decode().catch(() => {}));
      glow = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 78%, rgba(255,45,122,.42), rgba(139,92,255,.12) 45%, rgba(0,0,0,0) 70%);mix-blend-mode:screen', root);
      glow2 = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%, rgba(255,106,61,.22), rgba(0,0,0,0) 55%);mix-blend-mode:screen', root);
      el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.5) 100%)', root);
    },
    update(lt, t) {
      plate.style.transform = `translateY(${-30 * p(t, DROP, END)}px) scale(${1.04 + .03 * Math.sin(t * .5)})`;
      glow.style.opacity = .35 + .65 * UI.pulse(t, [...KICKS, ...SNARES], .2);
      glow2.style.opacity = .25 + .75 * UI.pulse(t, B, .25);
    },
  });

  /* ---------- 1. logo hit (bar 1) ---------- */
  let flash, ring, icon, wm, tag1, tag2, g1;
  FILM.scene({
    id: 'logo', t0: B[0], t1: B[1],
    build(root) {
      g1 = el('div', 'position:absolute;inset:0;transform-origin:540px 900px;will-change:transform', root);
      ring = el('div', 'position:absolute;left:340px;top:660px;width:400px;height:400px;border-radius:50%;border:4px solid rgba(255,255,255,.65);will-change:transform', g1);
      icon = el('img', 'position:absolute;left:340px;top:660px;width:400px;height:400px;border-radius:92px;box-shadow:0 60px 140px rgba(255,45,122,.35),0 30px 60px rgba(0,0,0,.6);will-change:transform', g1); icon.src = ICON; icon.decoding = 'sync';
      UI.pending.push(icon.decode().catch(() => {}));
      wm = UI.kine(g1, 'Tikify', { y: 1110, size: 170, weight: 900, ls: -0.045 });
      tag1 = UI.kine(g1, 'Save TikTok sounds.', { y: 1330, size: 48, weight: 600, color: '#d9d6df', ls: -0.01 });
      tag2 = UI.kine(g1, 'Play them like music.', { y: 1392, size: 64, weight: 400, font: 'Instrument Serif', italic: true, ls: 0 });
      flash = el('div', 'position:absolute;inset:0;background:#fff;mix-blend-mode:screen;pointer-events:none', root);
      UI.blurWin(DROP, DROP + .3, 10); UI.blurWin(B[1] - .22, B[1] + .22, 10);
    },
    update(lt, t) {
      flash.style.opacity = .85 * (1 - E.out(2)(p(t, DROP, DROP + .11)));
      const sIn = FILM.zoom(t, DROP, DROP + .55, .28, 1, E.out(3));
      const sOut = FILM.zoom(t, B[1] - .2, B[1], 1, 1.28, E.in(3));
      g1.style.transform = `scale(${sIn * sOut})`;
      const breathe = 1 + .012 * Math.sin((t - DROP) * 6);
      icon.style.transform = `scale(${breathe * UI.punch(t, BT[2], 1.05, .3)})`;
      const rq = p(t, DROP, DROP + .7); ring.style.transform = `scale(${1 + 2.6 * E.out(2)(rq)})`; ring.style.opacity = (1 - rq) * .9;
      UI.rise(wm, t, BT[1] + .02, .035, .5); wm.box.style.opacity = t >= BT[1] ? 1 : 0;
      UI.rise(tag1, t, BT[2] + .02, .012, .45); tag1.box.style.opacity = t >= BT[2] ? 1 : 0;
      UI.rise(tag2, t, BT[2] + .14, .014, .5); tag2.box.style.opacity = t >= BT[2] + .1 ? 1 : 0;
    },
    zoom(lt) { const t = lt + B[0]; return FILM.zoom(t, DROP, DROP + .55, .28, 1, E.out(3)) * FILM.zoom(t, B[1] - .2, B[1], 1, 1.28, E.in(3)); },
  });

  /* ---------- 2. paste → find → save (bars 2–5) on the real Add flow ---------- */
  let ph2, g2, tapAdd, tapPaste, tapChip, tapSave, w2a, w2b, w2c, pressed;
  const CUT_ADD = beat(2, 3), T_PASTE = beat(2, 4) + .02, T_FOUND = B[3], T_CHIP = beat(4, 3) - .05, T_SCROLL = beat(4, 3) + .22, T_SAVE = beat(4, 4) + .08, T_SAVED = beat(5, 2);
  const SCR_W = 532 / 1170, SCR_H = 1151 / 2532;
  FILM.scene({
    id: 'add', t0: B[1], t1: B[5],
    build(root) {
      g2 = el('div', 'position:absolute;inset:0;transform-origin:540px 1030px;will-change:transform', root);
      ph2 = UI.phone(g2, PW, PL, PT);
      UI.still(ph2, 'library');
      // taps (screen px) — positions read from the real layout (CSS px × 3 → 1170 space → screen space)
      const sx = (cssx) => cssx * 3 * SCR_W, sy = (cssy) => cssy * 3 * SCR_H;
      tapAdd = UI.tap(ph2, sx(195), sy(790), beat(2, 2) + .05);
      tapPaste = UI.tap(ph2, sx(367), sy(75), T_PASTE - .12);
      const DSCR = T.pos.before[1] - T.pos.after[1];   // scroll delta between the unscrolled and scrolled stills (CSS px)
      tapChip = UI.tap(ph2, sx(T.pos.chip[0]), sy(T.pos.chip[1] + DSCR), T_CHIP - .06);
      tapSave = UI.tap(ph2, sx(T.pos.after[0]), sy(T.pos.after[1]), T_SAVE - .08);
      pressed = el('div', `position:absolute;left:${sx(T.pos.after[0]) - 230}px;top:${sy(T.pos.after[1]) - 30}px;width:460px;height:60px;border-radius:30px;background:rgba(0,0,0,.28);display:none`, ph2.fx);
      w2a = UI.kine(root, 'PASTE THE LINK', { y: 262, size: 84, weight: 900 });
      w2b = UI.kine(root, 'FOUND IT.', { y: 232, size: 128, weight: 900, grad: true, ls: -0.05 });
      w2c = UI.kine(root, 'SAVED.', { y: 232, size: 136, weight: 900, grad: true, ls: -0.05 });
      UI.blurWin(T_PASTE - .05, T_PASTE + .45, 8); UI.blurWin(T_FOUND - .05, T_FOUND + .45, 8); UI.blurWin(T_SAVED - .05, T_SAVED + .45, 8);
      UI.blurWin(B[5] - .22, B[5] + .22, 8); UI.blurWin(CUT_ADD - .1, CUT_ADD + .1, 6);
    },
    update(lt, t) {
      // phone enters continuing forward (prev shot flew in ×1.28), settles frontal; needle breathing out of the scene
      const sIn = FILM.zoom(t, B[1], B[1] + .6, .66, 1, E.out(3));
      const yIn = 320 * (1 - E.out(3)(p(t, B[1], B[1] + .6)));
      const ryIn = -16 * (1 - E.smooth(p(t, B[1], B[1] + .9)));
      // camera push into the preview card after FOUND IT, release before the cut
      const push = FILM.zoom(t, T_FOUND, T_FOUND + .8, 1, 1.2, E.glide) / FILM.zoom(t, T_SAVE - .25, T_SAVE + .05, 1, 1.2, E.smooth);
      const snare = UI.punch(t, T_FOUND, 1.07, .34) * UI.punch(t, T_SAVED, 1.08, .34) * UI.punch(t, beat(5, 1), 1.03, .3);
      const outN = needle(t, B[5], 1, 1.12);
      g2.style.transform = `translate(0,${yIn}px) rotateY(${ryIn}deg) scale(${sIn * push * snare * outN})`;
      g2.style.transformOrigin = (t >= T_FOUND && t < T_SAVE) ? `${PL + 14 + T.pos.cover[0] * 3 * SCR_W}px ${PT + 14 + (T.pos.cover[1] + (t < T_SCROLL ? T.pos.before[1] - T.pos.after[1] : 0)) * 3 * SCR_H}px` : '540px 1030px';
      // screen states (hard state changes on the grid)
      pressed.style.display = 'none';
      if (t < CUT_ADD) UI.still(ph2, 'library');
      else if (t < T_PASTE) UI.still(ph2, 'add_empty2');
      else if (t < T_FOUND) UI.seq(ph2, 'add_lookup', t - T_PASTE, 'wall', .36, (1.54 - .36) / (T_FOUND - T_PASTE));
      else if (t < T_CHIP) UI.still(ph2, 'add_preview');
      else if (t < T_SCROLL) UI.still(ph2, 'add_preview_checked');
      else if (t < T_SAVED) { UI.still(ph2, 'add_preview_scrolled'); if (t >= T_SAVE - .02) pressed.style.display = 'block'; }
      else UI.seq(ph2, 'add_save', t - T_SAVED, 'wall', 1.8, 1.0);
      tapAdd(t); tapPaste(t); tapChip(t); tapSave(t);
      // kinetic words in the top band
      if (t < T_FOUND) { UI.smearIn(w2a, t, T_PASTE - .02, .4, -1000); w2b.box.style.opacity = 0; } else { w2a.box.style.opacity = 0; }
      if (t >= T_FOUND && t < T_SAVED) { UI.smearIn(w2b, t, T_FOUND, .38, 1000); w2b.box.style.transform += ` scale(${UI.punch(t, T_FOUND, 1.25, .36)})`; } else if (t >= T_SAVED) w2b.box.style.opacity = 0;
      if (t >= T_SAVED) { w2c.box.style.opacity = 1; const q = E.out(3)(p(t, T_SAVED, T_SAVED + .3)); w2c.box.style.transform = `scale(${.6 + .4 * q + (UI.punch(t, T_SAVED, 1.18, .4) - 1)})`; w2c.blur(w2c.box, (1 - q) * 18, (1 - q) * 18); } else w2c.box.style.opacity = 0;
    },
    zoom(lt) { const t = lt + B[1]; return FILM.zoom(t, B[1], B[1] + .6, .66, 1, E.out(3)) * needle(t, B[5], 1, 1.12); },
  });

  /* ---------- 3. playlist → player (bars 6–8) ---------- */
  let ph3, g3, tapPlay, tapMini, w3a, w3b;
  const T_PLAY = beat(6, 3), T_SLIDE0 = B[6] - .22, T_SLIDE1 = B[6] + .1, T_SHUF = beat(8, 1), T_REP = beat(8, 2), T_REP1 = beat(8, 3), T_NEXT = beat(8, 4);
  FILM.scene({
    id: 'play', t0: B[5], t1: B[8],
    build(root) {
      g3 = el('div', 'position:absolute;inset:0;transform-origin:540px 1030px;will-change:transform', root);
      ph3 = UI.phone(g3, PW, PL, PT);
      UI.still(ph3, 'add_saved_notoast'); UI.still(ph3, 'playlist', ph3.img2); ph3.img2.style.display = 'block';
      tapPlay = UI.tap(ph3, 532 * .92, 1151 * .49, T_PLAY - .1);
      tapMini = UI.tap(ph3, 532 * .35, 1151 * .845, T_SLIDE0 - .1);
      w3a = UI.kine(root, 'ADD IT TO A PLAYLIST', { y: 268, size: 72, weight: 900 });
      w3b = UI.kine(root, 'Play it like music.', { y: 236, size: 104, weight: 400, font: 'Instrument Serif', italic: true, ls: 0 });
      UI.blurWin(B[5] - .02, B[5] + .35, 8); UI.blurWin(T_SLIDE0, T_SLIDE1 + .05, 8); UI.blurWin(B[8] - .22, B[8] + .22, 8); UI.blurWin(T_NEXT - .05, T_NEXT + .2, 6);
    },
    update(lt, t) {
      // continue the needle from the previous cut (×1.12 → settles back ×1 by the player), push into the cover during the player
      const inN = needle(t, B[5], 1, 1.12) / FILM.zoom(t, B[5] + .25, B[5] + 1.0, 1, 1.12, E.smooth);
      const push = FILM.zoom(t, B[6] + .1, B[7], 1, 1.14, E.glide);
      const outN = needle(t, B[8], 1, 1.12);
      const kick = UI.punch(t, beat(5, 2) + 0, 1.0) * UI.punch(t, T_PLAY, 1.04, .3) * UI.punch(t, T_SHUF, 1.03, .25) * UI.punch(t, T_REP, 1.04, .25) * UI.punch(t, T_REP1, 1.03, .25) * UI.punch(t, T_NEXT, 1.05, .3);
      g3.style.transform = `scale(${inN * push * kick * outN})`;
      g3.style.transformOrigin = t >= B[6] ? '540px 900px' : '540px 1030px';
      // mirrored whip inside the screen: Add (saved) pans out left, playlist pans in from the right — equal speed across the cut
      const wq = p(t, B[5], B[5] + .3);
      const xo = -540 * E.in(2)(p(t, B[5] - .3, B[5])) - 540 * (t >= B[5] ? 1 : 0) * 0, xi = 540 * (1 - E.out(2)(wq));
      ph3.img.style.transform = `translate(${t < B[5] ? xo : -600}px,0)`; ph3.img.style.display = t < B[5] + .05 ? 'block' : 'none';
      ph3.img2.style.transform = `translate(${xi}px,0)`;
      // screen states
      if (t < T_PLAY) UI.still(ph3, 'playlist', ph3.img2);
      else if (t < T_SLIDE0) UI.seq(ph3, 'playlist_play', t - T_PLAY, 'anim', 0, 1, ph3.img2);
      else if (t < T_SLIDE1) UI.seq(ph3, 'player_open', t - T_SLIDE0, 'anim', 0, .31 / (T_SLIDE1 - T_SLIDE0), ph3.img2);
      else if (t < T_SHUF) UI.still(ph3, 'player', ph3.img2);
      else if (t < T_REP) UI.still(ph3, 'player_shuffle', ph3.img2);
      else if (t < T_REP1) UI.still(ph3, 'player_repeat', ph3.img2);
      else if (t < T_NEXT) UI.still(ph3, 'player_repeat1', ph3.img2);
      else UI.still(ph3, 'player_next_still', ph3.img2);
      tapPlay(t); tapMini(t);
      if (t < B[6]) { UI.smearIn(w3a, t, B[5] + .02, .4, -1000); if (t > B[6] - .3) UI.smearOut(w3a, t, B[6] - .3, .3, -1000); w3b.box.style.opacity = 0; }
      else { w3a.box.style.opacity = 0; w3b.box.style.opacity = 1; UI.rise(w3b, t, B[6] + .02, .018, .5); }
    },
    zoom(lt) { const t = lt + B[5]; return needle(t, B[5], 1, 1.12) / FILM.zoom(t, B[5] + .25, B[5] + 1.0, 1, 1.12, E.smooth) * needle(t, B[8], 1, 1.12); },
  });

  /* ---------- 4. feature list on the vocal (bars 9–12) ---------- */
  const FEATS = [
    ['Save any TikTok sound', 'add_saved_notoast'], ['Make playlists', 'library_after'], ['Shuffle & repeat', 'z_player_shuffle_repeat1'],
    ['Plays offline', 'all'], ['Keeps playing, screen locked', 'library_playing'], ['Free. No account.', 'library'],
  ];
  const FT = [B[8], B[9], B[10], beat(11, 3), B[11], beat(12, 3)];
  let g4, list, lines = [], dot, ph4, g4p;
  FILM.scene({
    id: 'feat', t0: B[8], t1: B[12],
    build(root) {
      g4 = el('div', 'position:absolute;inset:0;transform-origin:540px 960px;will-change:transform', root);
      list = el('div', 'position:absolute;left:120px;top:0;width:900px;will-change:transform', g4);
      lines = FEATS.map(([txt], i) => el('div', `position:absolute;left:0;top:${i * 104}px;height:104px;font:800 64px/104px Inter;letter-spacing:-.035em;color:#55525e;white-space:nowrap;will-change:transform,color`, list, txt));
      dot = el('div', 'position:absolute;left:66px;top:0;width:22px;height:22px;border-radius:50%;background:' + BRAND + ';box-shadow:0 0 24px rgba(255,45,122,.8);will-change:transform', g4);
      g4p = el('div', 'position:absolute;inset:0;transform-origin:540px 1380px;will-change:transform', g4);
      ph4 = UI.phone(g4p, 436, 322, 960);
      UI.still(ph4, FEATS[0][1]);
      el('div', 'position:absolute;left:0;top:760px;width:1080px;height:120px;background:linear-gradient(rgba(8,7,11,0),rgba(8,7,11,.9))', g4);  // fade under the list
      FT.forEach((ft) => UI.blurWin(ft - .04, ft + .2, 6)); UI.blurWin(B[12] - .22, B[12] + .22, 8);
    },
    update(lt, t) {
      let idx = 0; FT.forEach((ft, i) => { if (t >= ft) idx = i; });
      const prev = FT[idx], y = idx * 104, yPrev = Math.max(0, idx - 1) * 104;
      const q = E.smooth(p(t, prev, prev + .28));
      const ly = 520 - (yPrev + (y - yPrev) * q);
      list.style.transform = `translate(0,${ly}px)`;
      lines.forEach((l, i) => { const on = i === idx, d = i - idx; l.style.color = on ? '#fff' : '#8a8696'; l.style.opacity = on ? 1 : d < 0 ? .22 : d === 1 ? .55 : d === 2 ? .28 : .1; l.style.transform = `scale(${on ? 1 + .04 * (1 - q) : 1})`; l.style.transformOrigin = '0 50%'; });
      dot.style.transform = `translate(0,${520 + 41}px) scale(${UI.punch(t, prev, 1.9, .3)})`;
      UI.still(ph4, FEATS[idx][1]);
      const inN = needle(t, B[8], 1, 1.12) / FILM.zoom(t, B[8] + .25, B[8] + .9, 1, 1.12, E.smooth);
      g4.style.transform = `scale(${inN * needle(t, B[12], 1, 1.12)})`;
      g4p.style.transform = `scale(${UI.punch(t, prev, 1.06, .32)}) rotateY(${3 * Math.sin(t * .8)}deg)`;
    },
    zoom(lt) { const t = lt + B[8]; return needle(t, B[8], 1, 1.12) / FILM.zoom(t, B[8] + .25, B[8] + .9, 1, 1.12, E.smooth) * needle(t, B[12], 1, 1.12); },
  });

  /* ---------- 5. fan of screens + tikify.no (bars 13–14) ---------- */
  let g5, fan, w5, w5b, phones5 = [];
  FILM.scene({
    id: 'fan', t0: B[12], t1: B[14],
    build(root) {
      g5 = el('div', 'position:absolute;inset:0;transform-origin:540px 1100px;will-change:transform', root);
      w5 = UI.kine(g5, 'tikify.no', { y: 270, size: 150, weight: 900, grad: true, ls: -0.05 });
      w5b = UI.kine(g5, 'Free · No account · Works offline', { y: 455, size: 44, weight: 600, color: '#c9c5d2', ls: -0.01 });
      fan = el('div', 'position:absolute;inset:0;transform-style:preserve-3d;transform-origin:540px 1200px;will-change:transform', g5);
      const specs = [['playlist_playing', -300, 34, -260], ['library_after', 0, 0, 0], ['player', 300, -34, -260]];
      phones5 = specs.map(([name, dx, ry, dz]) => { const w = el('div', `position:absolute;inset:0;transform-style:preserve-3d;transform:translate3d(${dx}px,0,${dz}px) rotateY(${ry}deg);will-change:transform`, fan); const ph = UI.phone(w, 400, 340, 790); UI.still(ph, name); return { w, ph, dx, ry, dz }; });
      UI.blurWin(beat(13, 2) - .02, beat(13, 2) + .45, 8); UI.blurWin(beat(14, 2) - .02, beat(14, 2) + .45, 8); UI.blurWin(B[14] - .22, B[14] + .22, 10);
    },
    update(lt, t) {
      const inN = needle(t, B[12], 1, 1.12) / FILM.zoom(t, B[12] + .25, B[12] + .9, 1, 1.12, E.smooth);
      const outZ = FILM.zoom(t, B[14] - .22, B[14], 1, 1.45, E.in(3));
      g5.style.transform = `scale(${inN * outZ})`;
      const r1 = 14 * E.smooth(p(t, beat(13, 2), beat(13, 2) + .45)), r2 = -28 * E.smooth(p(t, beat(14, 2), beat(14, 2) + .45));
      const sway = 2.5 * Math.sin((t - B[12]) * 1.2);
      fan.style.transform = `rotateY(${r1 + r2 + sway}deg) rotateX(${4 * Math.sin((t - B[12]) * .9)}deg)`;
      const kq = UI.punch(t, beat(13, 2), 1.05, .3) * UI.punch(t, beat(14, 2), 1.05, .3);
      phones5.forEach((o, i) => { const q = E.out(3)(p(t, B[12] + .04 * Math.abs(i - 1), B[12] + .5)); o.w.style.transform = `translate3d(${o.dx * q}px,${(1 - q) * 160}px,${o.dz * q}px) rotateY(${o.ry * q}deg) scale(${kq})`; });
      UI.rise(w5b, t, B[12] + .25, .012, .45); w5b.box.style.opacity = t >= B[12] + .2 ? 1 : 0;
      const q5 = E.out(3)(p(t, B[12], B[12] + .45)); w5.box.style.transform = `translate(0,${(1 - q5) * -120}px) scale(${.7 + .3 * q5})`; w5.blur(w5.box, 0, (1 - q5) * 26); w5.box.style.opacity = 1;
    },
    zoom(lt) { const t = lt + B[12]; return needle(t, B[12], 1, 1.12) / FILM.zoom(t, B[12] + .25, B[12] + .9, 1, 1.12, E.smooth) * FILM.zoom(t, B[14] - .22, B[14], 1, 1.45, E.in(3)); },
  });

  /* ---------- 6. end card (bars 15–16) ---------- */
  let g6, icon6, wm6, url6, line6, chips6 = [];
  FILM.scene({
    id: 'end', t0: B[14], t1: END,
    build(root) {
      g6 = el('div', 'position:absolute;inset:0;transform-origin:540px 860px;will-change:transform', root);
      icon6 = el('img', 'position:absolute;left:340px;top:600px;width:400px;height:400px;border-radius:92px;box-shadow:0 60px 140px rgba(255,45,122,.35),0 30px 60px rgba(0,0,0,.6);will-change:transform', g6); icon6.src = ICON; icon6.decoding = 'sync';
      wm6 = UI.kine(g6, 'Tikify', { y: 1040, size: 170, weight: 900, ls: -0.045 });
      url6 = UI.kine(g6, 'tikify.no', { y: 1240, size: 72, weight: 800, grad: true, ls: -0.03 });
      line6 = UI.kine(g6, 'Your TikTok sounds, played like music.', { y: 1345, size: 54, weight: 400, font: 'Instrument Serif', italic: true, color: '#e8e4ee', ls: 0 });
      const labels = ['Free', 'No account', 'Works offline', 'iPhone & Android'];
      const row = el('div', 'position:absolute;left:0;top:1450px;width:1080px;display:flex;justify-content:center;gap:16px', g6);
      chips6 = labels.map((l) => { const c = el('div', 'padding:16px 28px;border-radius:999px;font:600 30px/1 Inter;color:#f2f2f5;will-change:transform', row, l); c.className = 'glass'; return c; });
      UI.blurWin(B[14], B[14] + .4, 10);
    },
    update(lt, t) {
      const sIn = FILM.zoom(t, B[14], B[14] + .55, .3, 1, E.out(3));
      g6.style.transform = `scale(${sIn})`;
      icon6.style.transform = `scale(${1 + .015 * Math.sin((t - B[14]) * 2.2)})`;
      UI.rise(wm6, t, B[14] + .12, .035, .5); wm6.box.style.opacity = t >= B[14] + .1 ? 1 : 0;
      const qu = E.out(3)(p(t, B[14] + .3, B[14] + .7)); url6.box.style.opacity = t >= B[14] + .3 ? 1 : 0; url6.box.style.transform = `translate(0,${(1 - qu) * 60}px) scale(${.8 + .2 * qu})`;
      UI.rise(line6, t, B[14] + .45, .012, .5); line6.box.style.opacity = t >= B[14] + .45 ? 1 : 0;
      chips6.forEach((c, i) => { const t0 = beat(15, 2) + i * (T.BEAT / 2), q = FILM.pop(t, t0, .5); c.style.opacity = clamp(q * 3); c.style.transform = `translate(0,${(1 - q) * 40}px) scale(${.6 + .4 * q})`; });
    },
    zoom(lt) { const t = lt + B[14]; return FILM.zoom(t, B[14], B[14] + .55, .3, 1, E.out(3)); },
  });
})();
