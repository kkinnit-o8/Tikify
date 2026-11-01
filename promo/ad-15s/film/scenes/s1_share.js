/* s1 · 0 → b4 (2.264), both formats: SHARE A VIDEO → GET THE SOUND. A short video plays (a night drive, its sound
   ticker "♫ night drive (slowed)"). The cursor taps Share on b1.5 and the share sheet slides up; it taps Tikify on b2.5;
   ♪ notes leave the video and are swallowed by the Tikify icon; then the camera dives INTO the icon (×62, x^3.5, speed
   peak on the cut) — the frame is its pink corner on the cut. The step label that spells this out is its own scene
   (s0_label.js), so it stays readable through the dive. This is the app's real Android path: a TikTok shared to
   Tikify opens Add sound with the link and looks it up by itself. */
(function () {
  const { E, p, el, zoom, about } = FILM;
  const C1 = T.b(4), T_SHARE = T.b(1.5), T_TIK = T.b(2.5);
  const V = FILM.H > FILM.W, FW = FILM.W, FH = FILM.H, MX = FW / 2, MY = FH / 2;
  // the video card is designed at 600×1040 and scaled into place
  const CARD = V ? { x: 240, y: 430, k: 1 } : { x: 300, y: 70, k: 940 / 1040 };
  const CW = 600, CHh = 1040, SHEET = 330, TIK = [230, CHh - SHEET + 166], SHARE = [540, 780], DISC = [540, 944];
  const W = (lx, ly) => [CARD.x + CARD.k * lx, CARD.y + CARD.k * ly];
  const S = {};
  const ICO = {
    chat: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
    share: 'M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z',
    link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  };
  const svgP = (d, size, color = '#fff') => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="display:block;fill:${color}"><path d="${d}"/></svg>`;

  FILM.scene({
    id: 's1', t0: 0, t1: C1,
    zoom: (lt) => S.z ? S.z(lt) : 1,
    build(root) {
      S.par = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      const BL = V ? [['#FFB8CC', 1300, 820, 160], ['#D9C6FF', 1150, 80, 900], ['#BFF3EE', 1150, 1000, 1550], ['#FFD9E4', 900, 160, 1800]]
                   : [['#FFB8CC', 1180, 1500, -60], ['#D9C6FF', 980, 140, 560], ['#BFF3EE', 900, 1650, 900], ['#FFD9E4', 800, 900, 1100]];
      S.blobs = BL.map(([c, r, x, y]) => el('div', `position:absolute;left:${x - r / 2}px;top:${y - r / 2}px;width:${r}px;height:${r}px;border-radius:50%;background:radial-gradient(circle,${c} 0%,${c}D9 38%,${c}00 70%)`, S.par));
      S.null = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);

      // ---- the video card (a generic short-video player; no platform logo)
      S.card = el('div', `position:absolute;left:${CARD.x}px;top:${CARD.y}px;width:${CW}px;height:${CHh}px;transform-origin:0 0;transform:scale(${CARD.k});border-radius:48px;overflow:hidden;background:#140B2E;box-shadow:0 40px 100px rgba(60,20,90,.35),0 0 0 3px rgba(255,255,255,.7)`, S.null);
      S.vid = el('div', 'position:absolute;inset:-30px', S.card);
      el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,#120A30 0%,#2C1060 34%,#7A1E6E 52%,#E8456A 61%,#2A0F2E 62%,#0E0716 100%)', S.vid);
      el('div', 'position:absolute;left:-10%;right:-10%;top:44%;height:30%;background:radial-gradient(ellipse at 50% 60%,rgba(255,140,90,.75),rgba(255,80,120,0) 60%)', S.vid);
      S.road = el('div', 'position:absolute;left:0;right:0;top:62%;bottom:0;background:linear-gradient(180deg,#1A0E26,#09050F);clip-path:polygon(47% 0,53% 0,100% 100%,0 100%)', S.vid);
      S.dash = [0, 1, 2, 3, 4, 5].map(() => el('div', 'position:absolute;left:50%;top:0;width:14px;height:60px;margin-left:-7px;border-radius:4px;background:rgba(255,230,200,.85)', S.vid));
      S.bok = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const c = ['#FF8FB3', '#FFC27A', '#7FF3EE', '#B28CFF'][i % 4], r = 40 + (i * 37) % 70;
        return el('div', `position:absolute;left:0;top:0;width:${r}px;height:${r}px;border-radius:50%;background:radial-gradient(circle,${c} 0%,${c}88 45%,${c}00 72%)`, S.vid); });
      el('div', 'position:absolute;left:0;right:0;bottom:0;height:46%;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.55))', S.card);
      // right rail
      const rail = el('div', 'position:absolute;left:500px;top:390px;width:80px', S.card);
      T.img(T.COV.night, 'position:absolute;left:0;top:0;width:80px;height:80px;border-radius:40px;box-shadow:0 0 0 4px #fff', rail);
      const ri = (y, icon, label) => el('div', `position:absolute;left:-20px;top:${y}px;width:120px;display:grid;justify-items:center;gap:6px;font:700 26px/1 Inter;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.4)`, rail, `${icon}<span>${label}</span>`);
      ri(122, T.svg('heart', 64), '48.2K'); ri(246, svgP(ICO.chat, 58), '1,204');
      S.shareBtn = ri(366, svgP(ICO.share, 64), 'Share');
      S.disc = el('div', `position:absolute;left:${DISC[0] - 40}px;top:${DISC[1] - 40}px;width:80px;height:80px;border-radius:40px;background:#222;box-shadow:0 0 0 10px #2b2b2b`, S.card);
      T.img(T.COV.night, 'position:absolute;left:18px;top:18px;width:44px;height:44px;border-radius:22px', S.disc);
      // bottom-left: handle, caption, sound ticker
      el('div', 'position:absolute;left:30px;top:858px;font:700 34px/1 Inter;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.4)', S.card, '@mira.wav');
      el('div', 'position:absolute;left:30px;top:906px;font:500 28px/1.2 Inter;color:rgba(255,255,255,.92)', S.card, 'late night drives hit different');
      const tk = el('div', 'position:absolute;left:30px;top:956px;width:410px;height:36px;display:flex;align-items:center;gap:10px;font:600 28px/1 Inter;color:#fff;overflow:hidden', S.card, '<span style="flex:none">♫</span>');
      S.tick = el('div', 'white-space:nowrap', el('div', 'overflow:hidden;flex:1', tk), 'night drive (slowed) · mira.wav &nbsp; &nbsp; night drive (slowed) · mira.wav &nbsp; &nbsp;');
      S.prog = el('div', 'position:absolute;left:0;bottom:0;height:5px;background:rgba(255,255,255,.9)', S.card);
      S.dim = el('div', 'position:absolute;inset:0;background:#000;opacity:0', S.card);
      // the system share sheet
      S.sheet = el('div', `position:absolute;left:0;top:${CHh}px;width:${CW}px;height:${SHEET + 40}px;border-radius:36px 36px 0 0;background:#1E1E1E`, S.card);
      el('div', 'position:absolute;left:270px;top:14px;width:60px;height:8px;border-radius:4px;background:#555', S.sheet);
      el('div', 'position:absolute;left:0;width:600px;top:44px;text-align:center;font:700 32px/1 Inter;color:#fff', S.sheet, 'Share to');
      const tgt = (x, inner, bg, label, r = 56) => {
        const w = el('div', `position:absolute;left:${x - 70}px;top:110px;width:140px;display:grid;justify-items:center;gap:14px;font:600 25px/1 Inter;color:#ddd`, S.sheet);
        const ic = el('div', `width:112px;height:112px;border-radius:${r}px;background:${bg};display:grid;place-items:center`, w, inner); el('span', '', w, label); return ic;
      };
      tgt(90, svgP(ICO.link, 54), '#3A3A3A', 'Copy link');
      S.tik = tgt(TIK[0], T.svg('note', 70), T.GRAD, 'Tikify', 28);
      tgt(370, svgP(ICO.chat, 50), '#3A3A3A', 'Message');
      tgt(510, T.svg('dots', 54), '#3A3A3A', 'More');
      S.tikGlow = el('div', `position:absolute;left:${TIK[0] - 76}px;top:${110 - 20}px;width:152px;height:152px;border-radius:40px;background:${T.GRAD};filter:blur(18px);opacity:0`, S.sheet);
      S.sheet.insertBefore(S.tikGlow, S.sheet.firstChild);

      // ---- ♪ notes: the sound leaving the video into Tikify
      S.notes = [0, 1, 2, 3, 4].map(() => el('div', 'position:absolute;left:-32px;top:-32px;width:64px;height:64px;border-radius:32px;background:#fff;display:grid;place-items:center;box-shadow:0 10px 24px rgba(60,20,80,.3)', S.null, T.svg('note', 38, '#FE2C55')));
      S.arr = S.notes.map((_, i) => T_TIK + .34 + i * .07);    // right after the tap: 1.75 … 2.03
      S.cur = T.cursor(S.null);
      const tikW = W(TIK[0], TIK[1]), shW = W(SHARE[0], SHARE[1]);
      S.TIKW = tikW; S.PT = [tikW[0] - 30 * CARD.k, tikW[1] - 24 * CARD.k];  // the icon's pink corner, clear of the note (checked at ×62)
      S.keys = [[.3, [FW + 80, FH * .8]], [T_SHARE - .05, shW, .12], [T_SHARE + .16, shW], [T_TIK - .05, tikW, .1], [T_TIK + .2, tikW], [2.05, [FW + 120, FH + 80], .08]];
      S.z = (lt) => { const q1 = E.smooth(p(lt, 1.78, 2.12)); return (1 + .08 * q1) * zoom(lt, 1.96, C1 - 1 / 30, 1, 62 / 1.08 / CARD.k, E.in(3.5)); };
      FILM.cue('share', T_SHARE, 'click'); FILM.cue('sheet', T_SHARE + .04, 'whoosh'); FILM.cue('tikify', T_TIK, 'click');
      S.arr.forEach((a, i) => FILM.cue('dot' + i, a, 'pop')); FILM.cue('dive', C1, 'riser');
    },
    update(lt) {
      const t = lt;
      S.blobs.forEach((b, i) => { b.style.transform = `translate(${40 * Math.sin(t * .6 + i * 1.9)}px,${30 * Math.cos(t * .5 + i * 1.3)}px)`; });
      // the video plays: lane dashes rush at the camera, bokeh drifts, the clip sways a little
      S.vid.style.transform = `translate(${10 * Math.sin(t * 1.3)}px,${6 * Math.sin(t * 2.1)}px) scale(1.04)`;
      S.dash.forEach((d, i) => { const u = (t * .95 + i / 6) % 1, e = u * u, y = 1100 * (.62 + .38 * e) - 30, s = .15 + 1.6 * e;
        d.style.transform = `translate(${0}px,${y}px) scale(${s},${s * 1.4})`; d.style.opacity = Math.min(1, u * 4); });
      S.bok.forEach((b, i) => { const x = (60 + i * 83 + t * (14 + i * 3)) % 680 - 40, y = 140 + (i * 97) % 420 + 20 * Math.sin(t * .7 + i); b.style.transform = `translate(${x}px,${y}px)`; });
      S.disc.style.transform = `rotate(${t * 140}deg)`;
      S.tick.style.transform = `translateX(${-(t * 70) % 470}px)`;
      S.prog.style.width = (38 + t * 6) + '%';
      // the share sheet slides up on the drop, Tikify glows, gets tapped on b2
      const sq = E.soft(p(t, T_SHARE + .02, T_SHARE + .42));
      S.sheet.style.transform = `translateY(${-(SHEET) * sq}px)`;
      S.dim.style.opacity = .4 * sq;
      S.shareBtn.style.transform = `scale(${1 + .16 * T.bump(t, T_SHARE - .04, .26)})`;
      S.tikGlow.style.opacity = .85 * p(t, T_SHARE + .3, T_SHARE + .5) * (.75 + .25 * Math.sin(t * 9));
      const arrPulse = S.arr.reduce((a, ta) => Math.max(a, T.bump(t, ta, .2)), 0);
      S.tik.style.transform = `scale(${1 - .1 * T.bump(t, T_TIK - .04, .24) + .14 * arrPulse})`;
      // ♪ notes: they pop out of the video picture and arc down into the Tikify icon, swallowed on arrival
      const [dx0, dy0] = W(300, 360);
      S.notes.forEach((d, i) => {
        const t0 = S.arr[i] - .5, u = p(t, t0, S.arr[i]);
        if (u <= 0 || u >= 1) { d.style.display = 'none'; return; }
        d.style.display = 'grid';
        const e = E.bez(.3, 0, .7, 1)(u), [ex, ey] = S.TIKW;
        const P1 = [dx0 - 120 + i * 60, dy0 - (V ? 260 : 200)], P2 = [ex + 40 - i * 20, ey - (V ? 300 : 260)];
        const m = 1 - e, x = m * m * m * dx0 + 3 * m * m * e * P1[0] + 3 * m * e * e * P2[0] + e * e * e * ex;
        const y = m * m * m * dy0 + 3 * m * m * e * P1[1] + 3 * m * e * e * P2[1] + e * e * e * ey;
        d.style.transform = `translate(${x}px,${y}px) scale(${(.5 + .7 * Math.sin(Math.PI * Math.min(1, u * 1.4))) * (1 - .8 * p(u, .85, 1))}) rotate(${-30 + 60 * e}deg)`;
      });
      T.cursorAt(S.cur, t, T.path(t, S.keys), [T_SHARE, T_TIK]);
      // camera null: move the pivot onto the Tikify icon, then dive into it (overlapping at ≈0.45)
      const q1 = E.smooth(p(t, 1.78, 2.12)), ddx = (MX - S.PT[0]) * q1, ddy = (MY - S.PT[1]) * q1, z = S.z(t);
      S.null.style.transform = about(S.PT[0], S.PT[1], z, ddx, ddy);
      S.par.style.transform = about(S.PT[0], S.PT[1], Math.pow(z, .6), ddx * .6, ddy * .6);
    },
  });
})();
