/* 9:16 · s2 · b4 → b9 (2.264 → 5.094): the real "Add sound" screen, in the app's own vertical layout, on pink plates.
   Same beats as the 16:9 cut: arrival from the dive, Paste on b5, Find sound on b6, the result card born on b6.5,
   Save to library on b7.5 → "Downloading… N %", lean in, needle INTO the button on the big hit (b9). */
(function () {
  const { E, p, el, zoom } = FILM;
  const C1 = T.b(4), C2 = T.b(9);
  const PX = 60, PY = 250, PW = 960, PH = 1320;
  const W = (x, y) => [PX + x, PY + y];
  const CARD = { x: 56, y: 500, w: 848, h: 770 };
  const PASTE = W(56 + 848 - 58, 296), FIND = W(480, 422), SAVE = W(CARD.x + 48 + 376, CARD.y + 646 + 42);
  const NP = W(CARD.x + 48 + 100, CARD.y + 688);                      // needle pivot: Save button, left of its label
  const T_PASTE = T.b(5), T_FIND = T.b(6), T_CARD = T.b(6.5), T_SAVE = T.b(7.5), DL0 = T_SAVE + .07, DL1 = 4.84, ND = 4.86;
  const LINK = 'https://www.tiktok.com/@mira.wav/video/7431906528114';
  const S = {};

  function cam(t) {
    let s = zoom(t, C1, C1 + .62, .32, 1.12, E.out(4)), fx = 540, fy = PY + 520;   // panel top high in the frame, input in the upper-middle
    const q2 = E.smooth(p(t, 3.5, 4.1));                    // results land → crane back to the whole page
    s *= Math.exp(Math.log(.98 / 1.12) * q2); fy += (PY + PH / 2 - fy) * q2;
    const q3 = E.glide(p(t, T_SAVE - .05, ND + .04));       // lean in on the click
    s *= Math.exp(Math.log(1.1 / .98) * q3); fy += (SAVE[1] - 30 - fy) * q3;      // keeps the needle pivot within ±56 px of the frame centre: the button covers 1920 at ×22
    let tx = 540 - s * fx, ty = 960 - s * fy;
    const zN = zoom(t, ND, C2, 1, 22, E.in(4));             // needle into the button: ×22 so the 84 px button covers 1920
    const px = tx + s * NP[0], py = ty + s * NP[1];
    return { s: s * zN, tx: px + zN * (tx - px), ty: py + zN * (ty - py) };
  }
  const scr = (w) => (t) => { const c = cam(t); return [c.tx + c.s * w[0], c.ty + c.s * w[1]]; };

  FILM.scene({
    id: 's2', t0: C1, t1: C2,
    zoom: (lt) => cam(C1 + lt).s,
    build(root) {
      S.null = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0', root);
      const pn = el('div', `position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:44px;background:#121212;overflow:hidden;box-shadow:0 50px 120px rgba(90,0,40,.38),0 0 0 2px rgba(255,255,255,.06)`, S.null);
      pn.innerHTML = `
        <div style="position:absolute;left:56px;top:44px;font:800 64px/1 Inter;letter-spacing:-.02em;color:#fff">Add sound</div>
        <div style="position:absolute;left:850px;top:44px">${T.svg('more', 56)}</div>
        <div style="position:absolute;left:56px;top:136px;width:848px;font:500 31px/1.3 Inter;color:#A7A7A7">Copy the link of a TikTok video (Share → Copy link) and paste it here.</div>
        <div class="in" style="position:absolute;left:56px;top:244px;width:848px;height:104px;border-radius:18px;background:#242424;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(37,244,238,0)">
          <div class="ph" style="position:absolute;left:32px;top:32px;font:500 33px/1.2 Inter;color:#6E6E6E;white-space:nowrap">https://www.tiktok.com/@user/video/…</div>
          <div class="sel" style="position:absolute;left:26px;top:24px;height:56px;border-radius:8px;background:rgba(37,244,238,.28)"></div>
          <div class="lk" style="position:absolute;left:32px;top:32px;width:690px;overflow:hidden;font:500 33px/1.2 Inter;color:#fff;white-space:nowrap">${LINK}</div>
          <div class="pb" style="position:absolute;right:14px;top:12px;width:80px;height:80px;border-radius:40px;display:grid;place-items:center;background:#242424">${T.svg('paste', 44)}</div>
        </div>
        <div class="fb" style="position:absolute;left:56px;top:374px;width:848px;height:96px;border-radius:48px;background:#fff;display:grid;place-items:center;font:700 36px/1 Inter;color:#000">Find sound</div>
        <div class="ld" style="position:absolute;left:56px;top:540px;width:848px;display:flex;justify-content:center;align-items:center;gap:22px;font:500 32px/1 Inter;color:#A7A7A7">
          <svg class="sp" width="46" height="46" viewBox="0 0 46 46" style="display:block"><circle cx="23" cy="23" r="19" fill="none" stroke="#3a3a3a" stroke-width="5"/><path d="M23 4a19 19 0 0 1 19 19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>
          Finding the sound…</div>
        <div class="glow" style="position:absolute;left:${CARD.x - 6}px;top:${CARD.y - 6}px;width:${CARD.w + 12}px;height:${CARD.h + 12}px;border-radius:32px;background:${T.GRAD};filter:blur(22px)"></div>
        <div class="card" style="position:absolute;left:${CARD.x}px;top:${CARD.y}px;width:${CARD.w}px;height:${CARD.h}px;border-radius:28px;background:#1B1B1B;overflow:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.07)">
          <div class="cv" style="position:absolute;left:254px;top:40px;width:340px;height:340px;border-radius:16px;background:url(${T.COV.night}) center/cover;box-shadow:0 18px 40px rgba(0,0,0,.45)"></div>
          <div class="pp" style="position:absolute;left:530px;top:316px;width:92px;height:92px;border-radius:46px;background:#1ED760;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0,0,0,.5)">${T.svg('play', 46, '#000')}</div>
          <div class="r1" style="position:absolute;left:48px;top:426px;font:800 56px/1.1 Inter;letter-spacing:-.02em;color:#fff">night drive (slowed)</div>
          <div class="r2" style="position:absolute;left:48px;top:494px;font:500 34px/1.2 Inter;color:#A7A7A7">mira.wav</div>
          <div class="r3" style="position:absolute;left:48px;top:556px;display:flex;gap:14px;align-items:center">
            <div style="font:600 24px/1 Inter;letter-spacing:.08em;color:#A7A7A7;margin-right:6px">ADD TO</div>
            <div style="height:58px;padding:0 24px;border-radius:29px;background:#2A2A2A;font:600 29px/58px Inter;color:#fff">Gym</div>
            <div style="height:58px;padding:0 24px;border-radius:29px;background:#2A2A2A;font:600 29px/58px Inter;color:#fff">Chill</div>
            <div style="height:58px;padding:0 24px 0 16px;border-radius:29px;background:#fff;font:700 29px/58px Inter;color:#000;display:flex;align-items:center;gap:8px">${T.svg('check', 34, '#000')}Road trip</div>
          </div>
          <div class="sv" style="position:absolute;left:48px;top:646px;width:752px;height:84px;border-radius:42px;background:#fff;overflow:hidden">
            <div class="fill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:${T.GRAD}"></div>
            <div class="svl" style="position:absolute;inset:0;display:grid;place-items:center;font:700 33px/1 Inter;color:#000">Save to library</div>
            <div class="svw" style="position:absolute;inset:0;display:grid;place-items:center;font:700 33px/1 Inter;color:#fff;clip-path:inset(0 100% 0 0)"></div>
          </div>
        </div>`;
      const q = (c) => pn.querySelector('.' + c);
      Object.assign(S, { inp: q('in'), ph: q('ph'), sel: q('sel'), lk: q('lk'), pb: q('pb'), fb: q('fb'), ld: q('ld'), sp: q('sp'), glow: q('glow'), card: q('card'),
        cv: q('cv'), pp: q('pp'), rows: [q('r1'), q('r2'), q('r3')], sv: q('sv'), fill: q('fill'), svl: q('svl'), svw: q('svw') });
      S.selW = 690;
      S.cur = T.cursor(root);
      S.keys = [[C1 + .28, [1180, 2060]], [T_PASTE - .06, scr(PASTE), .1], [T_PASTE + .16, scr(PASTE)], [T_FIND - .05, scr(FIND), .08], [T_FIND + .2, scr(FIND)],
        [T_SAVE - .06, scr(SAVE), .1], [T_SAVE + .18, scr(SAVE)], [ND + .02, [1250, 2150], .06]];
      FILM.cue('paste', T_PASTE, 'click'); FILM.cue('find', T_FIND, 'click'); FILM.cue('card', T_CARD, 'pop'); FILM.cue('save', T_SAVE, 'click');
      FILM.cue('needle', C2, 'riser');
    },
    update(lt, t) {
      const c = cam(t);
      S.null.style.transform = T.mat(c.tx, c.ty, c.s);
      const pq = p(t, T_PASTE + .02, T_PASTE + .2);
      S.ph.style.visibility = t < T_PASTE + .02 ? 'visible' : 'hidden';
      S.lk.style.clipPath = `inset(-10px ${100 - 100 * E.out(2)(pq)}% -10px -10px)`;
      S.sel.style.width = S.selW * E.out(2)(pq) + 'px'; S.sel.style.opacity = 1 - p(t, T_PASTE + .3, T_PASTE + .75);
      const focus = p(t, T_PASTE - .02, T_PASTE + .06) * (1 - .75 * p(t, T_FIND, T_FIND + .4));
      S.inp.style.boxShadow = `inset 0 0 0 3px rgba(37,244,238,${focus})`;
      S.pb.style.background = `rgba(${36 + 30 * T.bump(t, T_PASTE - .04, .3)},${36 + 30 * T.bump(t, T_PASTE - .04, .3)},${36 + 30 * T.bump(t, T_PASTE - .04, .3)},1)`;
      S.fb.style.transform = `scale(${1 - .035 * T.bump(t, T_FIND - .03, .24)})`;
      const ld = p(t, T_FIND + .04, T_FIND + .14) * (1 - p(t, T_CARD - .04, T_CARD + .06));
      S.ld.style.opacity = ld; S.ld.style.transform = `translateY(${10 * (1 - ld)}px)`;
      S.sp.style.transform = `rotate(${t * 520}deg)`;
      const cq = E.soft(p(t, T_CARD, T_CARD + .55));
      S.card.style.clipPath = `inset(0 0 ${100 - 100 * cq}% 0 round 28px)`;
      S.card.style.transform = `translateY(${-70 * (1 - cq)}px) scale(${.96 + .04 * cq})`;
      S.cv.style.transform = `scale(${.86 + .14 * E.soft(p(t, T_CARD + .04, T_CARD + .6))})`;
      S.pp.style.transform = `scale(${E.back(1.1)(p(t, T_CARD + .22, T_CARD + .62))})`;
      S.rows.forEach((r, i) => { const rq = E.soft(p(t, T_CARD + .08 + i * .05, T_CARD + .62 + i * .05)); r.style.transform = `translateY(${40 * (1 - rq)}px)`; r.style.opacity = Math.min(1, rq * 1.8); });
      const sq = E.soft(p(t, T_CARD + .22, T_CARD + .75)); S.sv.style.transform = `translateY(${40 * (1 - sq)}px) scale(${1 - .03 * T.bump(t, T_SAVE - .03, .24)})`; S.sv.style.opacity = Math.min(1, sq * 1.8);
      S.glow.style.opacity = .7 * E.soft(p(t, T_CARD + .1, T_CARD + .6)) - .3 * p(t, T_CARD + .7, T_CARD + 1.2) + .35 * p(t, DL0, DL1);
      const dq = E.glide(p(t, DL0, DL1)), n = Math.round(100 * E.glide(p(FILM.TQ(t), DL0, DL1)));
      S.fill.style.width = (100 * dq) + '%';
      S.svl.textContent = S.svw.textContent = t < DL0 ? 'Save to library' : `Downloading… ${n}%`;
      S.svw.style.clipPath = `inset(0 ${100 - 100 * dq}% 0 0)`;
      T.cursorAt(S.cur, t, T.path(t, S.keys), [T_PASTE, T_FIND, T_SAVE]);
    },
  });
})();
