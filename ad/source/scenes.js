/* Tikify TikTok ad v2 (dark, smooth) — 12 scenes on the track's bar grid (bar = 4 beats = 1.438 s, B(n) = 0.23 + n·0.3595).
   s1 hook 0–B4 · s2 copy link B4–B8 · s3 paste+save B8–B12 (breakdown) · s4 DROP brand B12–B16 · s5 playlists B16–B20
   s6 player B20–B24 · s7 lock screen B24–B28 · s8 offline B28–B32 · s9 free B32–B36 · s10 home screen B36–B40
   s11 recap B40–B44 · s12 end card B44–end.
   No hard cuts: neighbours overlap by ±T.H2 around each bar and hand off with a forward zoom-blur (T.trans), a shared object
   (the video card s1→s2, the copied link s2→s3, the phone s6→s7) or a dive into the thing just tapped (s3, s5, s10). */
(function () {
  const { E, p, el, zoom, about, clamp, TQ, lerp } = FILM;
  const { B, C, W, H, BT, H2 } = T;

  /* ---------- shared: the vertical video card (a TikTok-style post; no third-party logo) ---------- */
  const CARD = { x: 280, y: 640, w: 520, h: 920 };
  const cardY = (t) => 10 * Math.sin(t * 1.6);                       // the card floats; same pure function in s1 and s2
  function videoCard(root) {
    const R = CARD;
    const c = el('div', `position:absolute;left:${R.x}px;top:${R.y}px;width:${R.w}px;height:${R.h}px;border-radius:44px;overflow:hidden;background:#111;box-shadow:0 0 0 4px rgba(255,255,255,.10),0 0 60px rgba(254,44,85,.35),0 0 140px rgba(123,44,191,.4),0 50px 100px rgba(0,0,0,.6)`, root);
    el('div', 'position:absolute;inset:0;background:linear-gradient(170deg,#FF9A3D 0%,#F0306E 40%,#6A1FB8 82%,#2A0C55 100%)', c);
    const beams = [0, 1].map((i) => el('div', `position:absolute;left:${i ? 330 : 40}px;top:-120px;width:150px;height:900px;transform-origin:75px 0;background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0) 80%);clip-path:polygon(42% 0,58% 0,100% 100%,0 100%)`, c));
    el('div', 'position:absolute;left:-40px;right:-40px;top:610px;height:320px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.28),rgba(255,255,255,0))', c);
    const balls = [[150, 80, '#FFE27A'], [260, 104, '#FFFFFF'], [380, 70, '#25F4EE']].map(([x, d, col], i) => {
      const sh = el('div', `position:absolute;left:${x - d * .5}px;top:${640 - 10}px;width:${d}px;height:20px;border-radius:50%;background:rgba(40,0,50,.35)`, c);
      const b = el('div', `position:absolute;left:${x - d / 2}px;top:${640 - d}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0%,${col} 38%,${col} 70%,rgba(0,0,0,.15) 100%);box-shadow:0 0 30px ${col}88`, c);
      return { b, sh, ph: i * .33 };
    });
    el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(10,0,20,.6) 100%)', c);
    [['heart', '1.2M', 430], ['comment', '8,214', 545], ['share', 'Share', 660]].forEach(([ic, n, y]) => {
      const a = T.at(c, R.w - 52, y);
      T.ico(a, ic, 0, 0, 62, '#fff', 'filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))');
      el('div', 'position:absolute;left:-60px;top:38px;width:120px;text-align:center;font:700 21px Inter;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4)', a, n);
    });
    el('div', 'position:absolute;left:26px;top:742px;font:800 29px Inter;color:#fff', c, '@djnova');
    el('div', 'position:absolute;left:26px;top:783px;font:500 23px Inter;color:#fff', c, 'this sound is on repeat');
    T.ico(c, 'note', 40, 840, 26, '#fff');
    const tk = el('div', 'position:absolute;left:62px;top:825px;width:290px;height:32px;overflow:hidden', c);
    const tkt = el('div', 'position:absolute;left:0;top:0;font:600 23px/32px Inter;color:#fff;white-space:nowrap', tk, 'original sound - DJ Nova &nbsp;·&nbsp; original sound - DJ Nova &nbsp;·&nbsp; original sound - DJ Nova');
    const disc = el('div', `position:absolute;left:${R.w - 82}px;top:800px;width:60px;height:60px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 8px rgba(30,30,30,.85)`, c, T.cover('gym', 3));
    el('div', 'position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(255,255,255,.3)', c);
    const prog = el('div', 'position:absolute;left:0;bottom:0;height:5px;width:0;background:#fff', c);
    const rp = el('div', 'position:absolute;left:22px;top:22px;height:58px;padding:0 20px 0 14px;border-radius:29px;background:rgba(20,0,30,.42);display:flex;align-items:center;gap:8px;color:#fff', c);
    el('div', 'width:34px;height:34px', rp, T.svg('replay'));
    const rpn = el('div', 'font:800 30px Inter;letter-spacing:-.01em', rp, '×12');
    return {
      c,
      update(t, loopStart, loopLen, count) {
        c.style.transform = `translateY(${cardY(t).toFixed(2)}px)`;
        beams.forEach((b, i) => { b.style.transform = `rotate(${(i ? -1 : 1) * (14 + 9 * Math.sin(t * 1.3 + i * 2))}deg)`; });
        balls.forEach(({ b, sh, ph }) => {            // a smooth sway on the half-time pulse instead of hard bounces
          const x = ((t - .23) / (2 * BT) + ph) % 1, up = .5 - .5 * Math.cos(2 * Math.PI * (x < 0 ? x + 1 : x));
          b.style.transform = `translateY(${(-120 * up).toFixed(1)}px)`;
          sh.style.transform = `scaleX(${(1.1 - .45 * up).toFixed(3)})`; sh.style.opacity = (1 - .55 * up).toFixed(3);
        });
        tkt.style.transform = `translateX(${-((t * 50) % 330)}px)`;
        disc.style.transform = `rotate(${t * 90}deg)`;
        prog.style.width = (R.w * clamp((t - loopStart) / loopLen)).toFixed(1) + 'px';
        rpn.textContent = count;
      },
    };
  }

  /* ---------- the copied link pill: ONE object from the share sheet (s2) into Tikify's input (s3), above both scenes ---------- */
  const LINK = { x: 540, y: 520, w: 660, h: 104 };
  (function () {
    const T0 = B(6), BTN = [CARD.x + 76, CARD.y + 470 + 160];
    let S = {};
    FILM.scene({
      id: 'link', t0: T0, t1: B(8) + .32,
      build(root) {
        root.style.zIndex = 60;
        S.a = T.at(root, LINK.x, LINK.y);
        S.box = el('div', `position:absolute;left:${-LINK.w / 2}px;top:${-LINK.h / 2}px;width:${LINK.w}px;height:${LINK.h}px;${T.GLASS(LINK.h / 2)};overflow:hidden`, S.a);
        S.ic = el('div', `position:absolute;left:12px;top:12px;width:74px;height:74px;border-radius:50%;background:${T.GRAD};padding:17px;box-sizing:border-box;color:#fff;box-shadow:0 0 20px rgba(254,44,85,.5)`, S.box, T.svg('link'));
        S.tx = el('div', `position:absolute;left:104px;top:0;font:700 31px/98px Inter;color:${C.text};white-space:nowrap;transform-origin:0 50%`, S.box, 'tiktok.com/@djnova/video/7302…');
        S.badge = el('div', `position:absolute;left:${LINK.w / 2 - 136}px;top:${-LINK.h / 2 - 36}px;height:56px;padding:0 22px 0 14px;border-radius:28px;background:${C.green};display:flex;align-items:center;gap:6px;font:800 25px Inter;color:#05290f;box-shadow:0 0 24px rgba(30,215,96,.55)`, S.a);
        el('div', 'width:30px;height:30px', S.badge, T.svg('check'));
        S.badge.appendChild(document.createTextNode('Copied'));
        S.bg0 = S.box.style.background; S.sh0 = S.box.style.boxShadow;
      },
      update(lt, t) {
        // A: born at the Copy-link button on B6, glides up to its hold pose
        const m = E.out(3)(p(lt, 0, .55)), sc = .14 + .86 * E.soft(p(lt, 0, .6));
        const by = BTN[1] + cardY(T0);
        let x = BTN[0] + (LINK.x - BTN[0]) * m, y = by + (LINK.y - by) * m - 80 * Math.sin(Math.PI * m) * (1 - m);
        y += 7 * Math.sin((t - T0) * 3.2) * p(lt, .5, .8) * (1 - p(t, B(8) - .3, B(8)));     // gentle float while held
        let w = LINK.w, h = LINK.h, k = 0;
        // C: into the input field of s3 (its rect is a pure function of s3's own time)
        const q = E.smooth(p(t, B(8), B(8) + .3));
        if (q > 0) {
          const r = FILM.S3IN(t - B(8));
          x += (r.x - x) * q; y += (r.y - y) * q; w += (r.w - w) * q; h += (r.h - h) * q; k = q;
        }
        S.a.style.transform = `translate(${(x - LINK.x).toFixed(1)}px,${(y - LINK.y).toFixed(1)}px) scale(${sc.toFixed(4)})`;
        S.box.style.width = w + 'px'; S.box.style.height = h + 'px'; S.box.style.left = -w / 2 + 'px'; S.box.style.top = -h / 2 + 'px';
        S.box.style.borderRadius = (h / 2 * (1 - k) + 8 * k) + 'px';
        S.box.style.background = k > 0 ? `linear-gradient(#242424,#242424) padding-box, ${T.GRAD} border-box` : S.bg0;
        S.box.style.boxShadow = k > 0 ? `0 0 ${(28 * (1 - k)).toFixed(1)}px rgba(254,44,85,${(.3 * (1 - k)).toFixed(3)})` : S.sh0;
        S.tx.style.transform = `scale(${(1 - .3 * k).toFixed(3)})`; S.tx.style.lineHeight = (h - 6) + 'px'; S.tx.style.left = (104 - 86 * k) + 'px';
        S.ic.style.transform = `scale(${(1 - k).toFixed(3)})`;
        T.blurIn(S.badge, lt, B(7) - T0 - .05, .5, 20, 1.1, 10);
        if (k > 0) S.badge.style.opacity = (Math.min(1, +S.badge.style.opacity) * (1 - E.sine(p(k, 0, .4)))).toFixed(3);
        S.a.style.display = t < B(8) + .3 ? 'block' : 'none';
      },
    });
  })();

  /* =================================== s1 · HOOK (0 → B4) =================================== */
  (function () {
    const LINES = [[-.32, 'STOP', C.pink], [B(1), 'REWATCHING', C.cyan], [B(2), 'TIKTOKS', C.purp], [B(3), 'FOR THE SOUND.', '#C77DFF']];
    const COUNTS = ['×12', '×27', '×48', '×99+'], CY = 470, GAP = 34, DUR = B(4);
    let S = {};
    FILM.scene({
      id: 's1', t0: 0, t1: DUR, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.pink, .34, 620], [C.purp, .42, 660], [C.cyan, .2, 520], [C.pink, .22, 480]]);
        S.glow = el('div', 'position:absolute;left:-60px;top:420px;width:1200px;height:1400px;border-radius:50%', root);
        S.stack = el('div', 'position:absolute;left:0;top:0;width:1080px', root);
        let top = 0; S.lines = LINES.map(([, s], i) => {
          const d = el('div', `position:absolute;left:0;top:${top}px;width:1080px;text-align:center`, S.stack);
          const last = i === LINES.length - 1;
          const sp = el('span', `display:inline-block;font-size:200px;line-height:.95;white-space:nowrap;${last ? `background:${T.GRADW};-webkit-background-clip:text;background-clip:text;color:transparent;` : 'color:#fff;'}`, d, s);
          sp.className = 'U';
          const w = sp.offsetWidth; if (w > 930) sp.style.fontSize = (200 * 930 / w).toFixed(1) + 'px';
          const h = sp.offsetHeight; const o = { d, sp, top, h }; top += h + GAP; return o;
        });
        S.offs = S.lines.map((l) => CY - (l.top + l.h / 2));
        S.card = videoCard(root);
        S.tap = T.tap(root);
      },
      update(lt, t) {
        S.bg(t);
        // continuous line index: each beat the stack glides up one line (smooth, ~0.36 s)
        let pos = 0; for (let k = 1; k < LINES.length; k++) pos += E.smooth(p(lt, LINES[k][0] - .04, LINES[k][0] + .34));
        const i0 = Math.min(3, Math.floor(pos)), fr = pos - i0, off = S.offs[i0] + ((S.offs[Math.min(i0 + 1, 3)] - S.offs[i0]) * fr);
        S.stack.style.transform = `translateY(${off.toFixed(2)}px)`;
        const leave = E.in(2)(p(lt, DUR - .25, DUR + H2));
        S.stack.style.opacity = (1 - leave).toFixed(3);
        S.stack.style.filter = leave > .01 ? `blur(${(leave * 16).toFixed(2)}px)` : 'none';
        S.lines.forEach((l, i) => {
          const d = pos - i, fade = d < 0 ? 1 : d < 1 ? 1 - .72 * E.sine(d) : d < 2 ? .28 - .2 * E.sine(d - 1) : Math.max(0, .08 - .08 * (d - 2));
          const q = T.blurIn(l.d, lt, LINES[i][0] - .04, .55, 70, 1.06, 18);
          l.d.style.opacity = (Math.min(1, q * 1.7) * fade).toFixed(3);
          l.sp.style.filter = i === LINES.length - 1 ? 'drop-shadow(0 0 30px rgba(199,125,255,.55))' : `drop-shadow(0 0 ${(34 * Math.max(0, 1 - Math.abs(d))).toFixed(1)}px ${T.hexA(LINES[i][2], .7)})`;
        });
        // the light behind the card takes the colour of the current line
        const ci = Math.min(3, Math.floor(pos)), cq = pos - ci, col = T.mix(LINES[ci][2], LINES[Math.min(3, ci + 1)][2], cq);
        S.glow.style.background = `radial-gradient(closest-side, ${T.hexA(col, .5)} 0%, ${T.hexA(col, .18)} 50%, ${T.hexA(col, 0)} 100%)`;
        S.glow.style.transform = `scale(${(.96 + .06 * T.breath(t)).toFixed(4)})`;
        const kq = LINES.reduce((n, l, i) => (TQ(lt) >= TQ(Math.max(0, l[0])) ? i : n), 0);
        S.card.update(t, kq ? TQ(LINES[kq][0]) : -.3, 1.2, COUNTS[kq]);
        S.tap(lt, 1.5, CARD.x + CARD.w - 52, CARD.y + 660 + cardY(t));
      },
    });
  })();

  /* =================================== s2 · COPY THE LINK (B4 → B8) =================================== */
  (function () {
    const T0 = B(4), DUR = B(8) - T0;
    let S = {};
    FILM.scene({
      id: 's2', t0: T0, t1: B(8), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.purp, .42, 640], [C.cyan, .26, 560], [C.pink, .3, 520], ['#FF9A3D', .14, 420]]);
        S.head = T.rise(root, 'Copy the link', { y: 330, size: 124 });
        S.card = videoCard(root);
        S.sheet = el('div', 'position:absolute;left:0;right:0;top:470px;height:470px;border-radius:34px 34px 0 0;background:linear-gradient(180deg,#221B2E,#15111D);box-shadow:0 -10px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08)', S.card.c);
        el('div', 'position:absolute;left:50%;top:14px;width:60px;height:6px;margin-left:-30px;border-radius:3px;background:#4a4258', S.sheet);
        el('div', `position:absolute;left:0;right:0;top:40px;text-align:center;font:800 27px Inter;color:${C.text}`, S.sheet, 'Share to');
        S.opts = [['link', 'Copy link', T.GRAD], ['comment', 'Message', '#22C7C2'], ['download', 'Save video', C.purp], ['dots', 'More', '#4a4258']].map(([ic, lab, bg], i) => {
          const a = T.at(S.sheet, 76 + i * 123, 160);
          const d = el('div', `position:absolute;left:-46px;top:-46px;width:92px;height:92px;border-radius:50%;background:${bg};padding:24px;box-sizing:border-box;color:#fff;${i === 0 ? 'box-shadow:0 0 26px rgba(254,44,85,.55)' : ''}`, a, ic === 'dots' ? T.dots() : T.svg(ic));
          el('div', `position:absolute;left:-70px;top:58px;width:140px;text-align:center;font:600 19px Inter;color:${C.muted}`, a, lab);
          return d;
        });
        S.toast = el('div', `position:absolute;left:50%;top:330px;height:64px;width:300px;margin-left:-150px;border-radius:32px;background:#F5F1FB;color:${C.ink};font:700 24px/64px Inter;text-align:center`, S.sheet, 'Link copied');
        S.tap = T.tap(root);
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { inS: 1, inBlur: 0, outS: 1.12 });     // the card is identical in s1 → a seamless crossfade
        S.bg(t);
        S.head.update(lt, .02);
        S.card.update(t, TQ(B(3)), 1.2, '×99+');
        const sq = E.soft(p(lt, .02, .55)); S.sheet.style.transform = `translateY(${((1 - sq) * 480).toFixed(1)}px)`;
        const tp = B(5) - T0;
        S.tap(lt, tp, CARD.x + 76, CARD.y + 470 + 160 + cardY(t));
        S.opts[0].style.transform = `scale(${T.press(lt, tp, .06).toFixed(4)})`;
        const ty = E.soft(p(lt, tp + .1, tp + .55)); S.toast.style.transform = `translateY(${((1 - ty) * 24).toFixed(1)}px)`; S.toast.style.opacity = (ty * (1 - E.sine(p(lt, 1.1, 1.4)))).toFixed(3);
      },
    });
  })();

  /* =================================== s3 · PASTE + SAVE (B8 → B12, the breakdown) =================================== */
  (function () {
    const T0 = B(8), DUR = B(12) - T0, PX = 540, PY = 1160, TO = { outS: 1, outBlur: 22 };
    const pushF = (lt) => zoom(lt, -.2, 1.0, 1.12, 1.26, E.glide);
    let S = {}, P;
    FILM.scene({
      id: 's3', t0: T0, t1: B(12), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.purp, .45, 660], [C.cyan, .2, 520], [C.pink, .26, 560], [C.purp, .2, 420]]);
        S.pan = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.needle = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.pan);
        S.push = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.needle);
        S.head = T.rise(S.pan, 'Paste it in Tikify', { y: 330, size: 116 });
        const a = T.at(S.push, PX, PY); P = T.phone(a, 580); const ui = P.ui;
        T.status(ui);
        el('div', 'position:absolute;left:16px;top:52px;font:700 23px Inter;letter-spacing:-.01em', ui, 'Add sound');
        el('div', 'position:absolute;left:16px;right:16px;top:98px;font:500 14px/1.5 Inter;color:#a7a7a7', ui, 'Copy the link of a TikTok video (Share → Copy link) and paste it here.');
        S.input = el('div', 'position:absolute;left:16px;top:152px;width:300px;height:48px;border-radius:6px;border:1px solid #7a7a7a;background:#242424;box-sizing:border-box;padding:0 13px;font:500 16px/46px Inter;color:#a7a7a7;white-space:nowrap;overflow:hidden', ui, 'https://www.tiktok.com/@user/video/…');
        el('div', 'position:absolute;left:326px;top:152px;width:48px;height:48px;border-radius:24px;background:#242424;padding:12px;box-sizing:border-box;color:#fff', ui, T.svg('paste'));
        S.find = el('div', 'position:absolute;left:16px;top:212px;width:358px;height:48px;border-radius:24px;background:#fff;color:#000;font:700 15px/48px Inter;text-align:center', ui, 'Find sound');
        S.spin = el('div', 'position:absolute;left:183px;top:224px;width:24px;height:24px;border-radius:50%;border:3px solid #000;border-right-color:transparent;box-sizing:border-box;display:none', ui);
        S.prev = el('div', 'position:absolute;left:0;top:0;width:390px;height:780px', ui);
        el('div', 'position:absolute;left:16px;top:278px;width:140px;height:140px;border-radius:6px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.5)', S.prev, T.cover('gym', 3));
        el('div', `position:absolute;left:172px;top:320px;width:56px;height:56px;border-radius:50%;background:${C.green};padding:14px;box-sizing:border-box;color:#000`, S.prev, T.svg('play'));
        const lbl = (y, s) => el('div', `position:absolute;left:16px;top:${y}px;font:700 12px Inter;color:#a7a7a7;letter-spacing:.6px`, S.prev, s);
        const inp = (y, s) => el('div', `position:absolute;left:16px;top:${y}px;width:358px;height:44px;border-radius:6px;border:1px solid #7a7a7a;background:#242424;box-sizing:border-box;padding:0 13px;font:500 16px/42px Inter;color:#fff`, S.prev, s);
        lbl(432, 'TITLE'); inp(450, 'Gym motivation mix');
        lbl(506, 'ARTIST'); inp(524, 'DJ Nova');
        lbl(580, 'ADD TO PLAYLISTS');
        [['Gym', 16, 1], ['Chill', 118, 0], ['Road trip', 216, 0]].forEach(([n, x, on]) => {
          const ch = el('div', `position:absolute;left:${x}px;top:598px;height:36px;padding:0 14px 0 10px;border-radius:18px;background:#242424;display:flex;align-items:center;gap:8px;font:600 14px Inter`, S.prev);
          el('div', `width:18px;height:18px;border-radius:4px;${on ? `background:${C.green};color:#000` : 'border:2px solid #a7a7a7;box-sizing:border-box'}`, ch, on ? T.svg('check') : '');
          ch.appendChild(document.createTextNode(n));
        });
        S.save = el('div', 'position:absolute;left:16px;top:652px;width:358px;height:50px;border-radius:25px;background:#fff;color:#000;font:800 16px/50px Inter;text-align:center;box-shadow:0 0 22px rgba(255,255,255,.25)', S.prev, 'Save to library');
        const tb = el('div', 'position:absolute;left:0;right:0;bottom:0;height:72px;background:#121212;border-top:1px solid #222;display:flex;justify-content:space-around;align-items:flex-start;padding-top:10px;box-sizing:border-box;z-index:12', ui);
        [['library', 'Library'], ['plus', 'Add sound'], ['search', 'Search']].forEach(([ic, n], i) => {
          const it = el('div', `display:flex;flex-direction:column;align-items:center;gap:4px;font:600 11px Inter;color:${i === 1 ? '#fff' : '#a7a7a7'}`, tb);
          el('div', `width:${i === 1 ? 44 : 24}px;height:${i === 1 ? 28 : 24}px;border-radius:${i === 1 ? 8 : 0}px;${i === 1 ? `background:${T.GRAD};padding:3px 9px;box-sizing:border-box;color:#fff` : ''}`, it, T.svg(ic));
          it.appendChild(document.createTextNode(n));
        });
        S.tapF = T.tap(S.push); S.tapS = T.tap(S.push);
        S.SAVE = [PX + P.X(195), PY + P.Y(677)];
        S.INPUT = [PX + P.X(166), PY + P.Y(176), 300 * P.k, 48 * P.k];
        S.FIND = [PX + P.X(195), PY + P.Y(236)];
        // where the input field is ON SCREEN at s3 time lt (pan = 0, needle = 1 while the link lands) — used by the link pill
        FILM.S3IN = (lt) => {
          const v = T.transVals(lt, DUR, TO), pu = pushF(lt);
          const x = 540 + pu * (S.INPUT[0] - 540), y = 900 + pu * (S.INPUT[1] - 900);
          return { x: 540 + v.s * (x - 540), y: 960 + v.s * (y - 960), w: S.INPUT[2] * pu * v.s, h: S.INPUT[3] * pu * v.s };
        };
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, TO);
        S.bg(t);
        S.head.update(lt, .06);
        const push = pushF(lt);
        S.push.style.transform = about(540, 900, push);
        const sy = 900 + push * (S.SAVE[1] - 900);
        const dy = -(sy - 1080) * E.smooth(p(lt, .6, 1.08));
        S.pan.style.transform = `translate(0px,${dy.toFixed(2)}px)`;
        // a smooth dive into Save (peak speed on the drop, then the zoom-blur hands over to s4)
        S.needle.style.transform = about(540, sy, zoom(lt, 1.0, DUR + H2, 1, 3.6, E.in(3)));
        const pasted = lt >= .3;
        S.input.textContent = pasted ? 'https://www.tiktok.com/@djnova/video/7302…' : 'https://www.tiktok.com/@user/video/…';
        S.input.style.color = pasted ? '#fff' : '#a7a7a7';
        S.input.style.borderColor = pasted && lt < .55 ? '#fff' : '#7a7a7a';
        const tf1 = B(9) - T0 + .04;
        S.tapF(lt, tf1, S.FIND[0], S.FIND[1]);
        S.find.style.transform = `scale(${T.press(lt, tf1).toFixed(4)})`;
        const loading = lt > tf1 + .08 && lt < B(10) - T0 - .02;
        S.find.style.color = loading ? 'transparent' : '#000';
        S.spin.style.display = loading ? 'block' : 'none'; S.spin.style.transform = `rotate(${lt * 720}deg)`;
        const pv = E.soft(p(lt, B(10) - T0 - .04, B(10) - T0 + .55));
        S.prev.style.opacity = Math.min(1, pv * 2).toFixed(3); S.prev.style.transform = `translateY(${((1 - pv) * 40).toFixed(1)}px)`;
        const ts = B(11) - T0;
        S.tapS(lt, ts, S.SAVE[0], S.SAVE[1]);
        S.save.style.transform = `scale(${T.press(lt, ts, .04).toFixed(4)})`;
      },
    });
  })();

  /* =================================== s4 · DROP: brand (B12 → B16) =================================== */
  (function () {
    const T0 = B(12), DUR = B(16) - T0, IY = 790;
    let S = {};
    FILM.scene({
      id: 's4', t0: T0, t1: B(16), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.purp, .4, 680], [C.pink, .3, 560], [C.cyan, .18, 520], [C.purp, .25, 460]], '#331C45');
        S.bloom = el('div', `position:absolute;left:${540 - 800}px;top:${IY - 800}px;width:1600px;height:1600px;border-radius:50%;background:radial-gradient(closest-side, rgba(254,44,85,.62) 0%, rgba(160,40,170,.38) 32%, rgba(123,44,191,.16) 60%, rgba(37,244,238,0) 100%)`, root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.rings = [0, 1].map(() => el('div', `position:absolute;left:${540 - 200}px;top:${IY - 200}px;width:400px;height:400px;border-radius:50%;border:3px solid rgba(255,255,255,.55);box-sizing:border-box;box-shadow:0 0 24px rgba(254,44,85,.5),inset 0 0 24px rgba(123,44,191,.4)`, S.cam));
        S.icon = T.at(S.cam, 540, IY); S.ic = T.appIcon(S.icon, 330, 1.4);
        S.word = T.rise(S.cam, 'Tikify', { y: 1090, size: 210, cls: 'Iw', glow: 'rgba(254,44,85,.45)' });
        S.l1 = T.rise(S.cam, 'Your TikTok sounds.', { y: 1260, size: 84, color: '#E6DDF5' });
        S.l2 = T.rise(S.cam, 'Played like music.', { y: 1360, size: 84, color: '#E6DDF5' });
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { inS: .7, inBlur: 22 });
        S.bg(t);
        const bq = E.out(3)(p(lt, -.15, .8));
        S.bloom.style.transform = `scale(${((.15 + .85 * bq) * (.97 + .05 * T.breath(t))).toFixed(4)})`; S.bloom.style.opacity = Math.min(1, bq * 1.5).toFixed(3);
        S.cam.style.transform = about(540, 960, zoom(lt, .4, DUR, 1, 1.05, E.glide));
        const z = zoom(lt, -.2, .75, .55, 1, E.out(3)), br = 1 + .018 * T.breath(t) * p(lt, .7, 1);
        S.icon.style.transform = `rotate(${(-8 * (1 - E.out(3)(p(lt, -.2, .75)))).toFixed(2)}deg) scale(${(z * br).toFixed(4)})`;
        S.rings.forEach((r, i) => {
          const tb = i * 2 * BT, q = p(lt, tb, tb + 1.5), on = lt >= tb && q < 1;
          r.style.display = on ? 'block' : 'none';
          r.style.transform = `scale(${(.85 + 2.4 * E.out(2)(q)).toFixed(3)})`; r.style.opacity = (.9 * (1 - E.sine(q))).toFixed(3);
        });
        S.word.update(lt, B(13) - T0 - .08, .035, .6);
        S.l1.update(lt, B(14) - T0 - .06, .02, .55);
        S.l2.update(lt, B(15) - T0 - .06, .02, .55);
      },
    });
  })();

  /* =================================== s5 · PLAYLISTS — one sound splits into three (B16 → B20) =================================== */
  (function () {
    const T0 = B(16), DUR = B(20) - T0, PILL_Y = 690, CY = 1040, XS = [234, 540, 846];
    const PL = [['Gym', 5, ['gym', 'vibe', 'road', 'dance']], ['Chill', 4, ['chill', 'wave', 'night', 'chill']], ['Road trip', 4, ['road', 'vibe', 'gym', 'wave']]];
    const CT = [.3, .54, .78], TAP = 1.1;
    let S = {};
    FILM.scene({
      id: 's5', t0: T0, t1: B(20), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.pink, .26, 560], [C.cyan, .24, 560], [C.purp, .42, 620], ['#FF9A3D', .12, 420]]);
        S.needle = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.needle);
        S.head = T.rise(S.cam, 'Sort into playlists', { y: 330, size: 116 });
        S.pa = T.at(S.cam, 540, PILL_Y); S.pill = T.soundPill(S.pa, { title: 'Gym motivation mix', sub: 'DJ Nova', w: 720, h: 132 });
        const NS = 'http://www.w3.org/2000/svg';
        S.svg = document.createElementNS(NS, 'svg'); S.svg.setAttribute('width', 1080); S.svg.setAttribute('height', 1920); S.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;filter:drop-shadow(0 0 10px rgba(199,125,255,.8))';
        S.svg.innerHTML = '<defs><linearGradient id="brk" gradientUnits="userSpaceOnUse" x1="234" y1="0" x2="846" y2="0"><stop offset="0" stop-color="#FE2C55"/><stop offset=".5" stop-color="#C77DFF"/><stop offset="1" stop-color="#25F4EE"/></linearGradient></defs>';
        S.cam.appendChild(S.svg);
        const r = 26, top = PILL_Y + 66, mid = 836, bot = CY - 150;
        const paths = [`M540 ${top} V${mid}`, `M540 ${mid} H${XS[0] + r} Q${XS[0]} ${mid} ${XS[0]} ${mid + r} V${bot}`, `M540 ${mid} H${XS[2] - r} Q${XS[2]} ${mid} ${XS[2]} ${mid + r} V${bot}`, `M540 ${mid} V${bot}`];
        S.paths = paths.map((d) => { const pa = document.createElementNS(NS, 'path'); pa.setAttribute('d', d); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', 'url(#brk)'); pa.setAttribute('stroke-width', 5); pa.setAttribute('stroke-linecap', 'round'); S.svg.appendChild(pa); return pa; });
        S.paths[0].setAttribute('stroke', '#C77DFF'); S.paths[3].setAttribute('stroke', '#C77DFF');
        S.cards = PL.map(([n, cnt, keys], i) => {
          const a = T.at(S.cam, XS[i], CY);
          const cd = el('div', `position:absolute;left:-139px;top:-150px;width:278px;height:300px;${T.GLASS(44)}`, a);
          el('div', 'position:absolute;left:66px;top:24px;width:130px;height:130px;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.45)', cd, T.mosaic(keys, 10 + i * 4));
          el('div', `position:absolute;left:0;right:0;top:166px;text-align:center;font:800 40px Inter;letter-spacing:-.02em;color:${C.text}`, cd, n);
          const c = el('div', `position:absolute;left:0;right:0;top:220px;text-align:center;font:700 27px Inter;color:${C.muted}`, cd, '0 sounds');
          return { a, cd, c, cnt };
        });
        S.chip = T.at(S.cam, 540, 1300);
        const ch = el('div', `position:absolute;left:-150px;top:-40px;width:300px;height:80px;${T.GLASS2(40)};color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font:700 30px Inter`, S.chip);
        el('div', 'width:34px;height:34px', ch, T.svg('plus')); ch.appendChild(document.createTextNode('New playlist'));
        S.tap = T.tap(S.cam);
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { outS: 1, outBlur: 20 });
        S.bg(t);
        S.head.update(lt, .02);
        const cs = zoom(lt, -.2, 1.2, 1, 1.035, E.glide);
        S.cam.style.transform = about(540, 960, cs);
        S.needle.style.transform = about(540 + cs * (XS[0] - 540), 960 + cs * (CY - 960), zoom(lt, TAP + .02, DUR + H2, 1, 3.2, E.in(3)));
        T.blurIn(S.pa, lt, -.02, .6, 60, .94, 12);
        S.pill.update(t);
        FILM.drawOn(S.paths[0], E.smooth(p(lt, .2, .4)));
        [1, 3, 2].forEach((k, j) => FILM.drawOn(S.paths[k], E.smooth(p(lt, .32 + j * .03, .62 + j * .03))));
        S.cards.forEach((c, i) => {
          const tb = CT[i];
          c.a.style.display = lt >= tb ? 'block' : 'none';
          T.blurIn(c.a, lt, tb, .6, 60, .92, 12);
          const n = Math.min(c.cnt, Math.floor(c.cnt * p(TQ(lt), tb + .08, tb + .5) + 1e-6));
          c.c.textContent = n + (n === 1 ? ' sound' : ' sounds');
        });
        T.blurIn(S.chip, lt, .9, .55, 40, .94, 10);
        S.tap(lt, TAP, XS[0], CY);
        S.cards[0].cd.style.transform = `scale(${T.press(lt, TAP).toFixed(4)})`;
      },
    });
  })();

  /* ---------- shared: player screen (s6) ---------- */
  const PH = { x: 540, y: 1180, w: 580 };
  function playerScreen(P) {
    const ui = P.ui, o = {};
    T.status(ui);
    T.ico(ui, 'down', 30, 64, 28, '#fff');
    el('div', 'position:absolute;left:0;right:0;top:54px;text-align:center;font:700 13px Inter;color:#fff', ui, 'Playing from Gym');
    T.ico(ui, 'dots', 360, 64, 24, '#fff');
    o.cover = el('div', 'position:absolute;left:20px;top:100px;width:350px;height:350px;border-radius:8px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.6)', ui, T.cover('gym', 3));
    o.title = el('div', 'position:absolute;left:20px;top:476px;font:800 24px Inter;letter-spacing:-.01em;color:#fff', ui, 'Gym motivation mix');
    el('div', 'position:absolute;left:20px;top:510px;font:500 16px Inter;color:#a7a7a7', ui, 'DJ Nova');
    el('div', 'position:absolute;left:20px;top:556px;width:350px;height:4px;border-radius:2px;background:#4d4d4d', ui);
    o.fill = el('div', 'position:absolute;left:20px;top:556px;width:100px;height:4px;border-radius:2px;background:#fff', ui);
    o.knob = el('div', 'position:absolute;left:113px;top:551px;width:14px;height:14px;border-radius:7px;background:#fff', ui);
    o.t0 = el('div', 'position:absolute;left:20px;top:570px;font:500 12px Inter;color:#a7a7a7', ui, '0:48');
    el('div', 'position:absolute;right:20px;top:570px;font:500 12px Inter;color:#a7a7a7', ui, '2:34');
    const cy = 640;
    o.shuffle = T.ico(ui, 'shuffle', 40, cy, 28, '#fff');
    o.shDot = el('div', `position:absolute;left:37px;top:${cy + 20}px;width:6px;height:6px;border-radius:3px;background:${C.green};opacity:0`, ui);
    T.ico(ui, 'prev', 112, cy, 38, '#fff');
    o.play = el('div', `position:absolute;left:157px;top:${cy - 38}px;width:76px;height:76px;border-radius:50%;background:#fff;padding:20px;box-sizing:border-box;color:#000`, ui);
    o.playI = el('div', 'width:100%;height:100%', o.play, T.svg('play'));
    o.pauseI = el('div', 'position:absolute;left:20px;top:20px;width:36px;height:36px;display:none', o.play, T.svg('pause'));
    T.ico(ui, 'next', 278, cy, 38, '#fff');
    o.repeat = T.ico(ui, 'repeat', 350, cy, 28, '#fff');
    o.rpDot = el('div', `position:absolute;left:347px;top:${cy + 20}px;width:6px;height:6px;border-radius:3px;background:${C.green};opacity:0`, ui);
    el('div', 'position:absolute;left:0;right:0;top:716px;text-align:center;font:600 13px Inter;color:#a7a7a7', ui, 'Open original TikTok');
    return o;
  }

  /* =================================== s6 · PLAYER (B20 → B24) =================================== */
  (function () {
    const T0 = B(20), DUR = B(24) - T0;
    const camS = (lt) => zoom(lt, -.2, .75, .5, 1, E.out(3)) * zoom(lt, .6, DUR, 1, 1.07, E.glide);
    let S = {}, P;
    FILM.scene({
      id: 's6', t0: T0, t1: B(24), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.cyan, .3, 640], [C.purp, .36, 600], [C.cyan, .16, 520], [C.pink, .14, 460]], '#16303A');
        S.head = T.rise(root, 'Play them like music', { y: 330, size: 116, glow: 'rgba(37,244,238,.35)' });
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        const a = T.at(S.cam, PH.x, PH.y); P = T.phone(a, PH.w); S.o = playerScreen(P);
        P.f.style.boxShadow = P.f.style.boxShadow.replace('rgba(123, 44, 191, 0.45)', 'rgba(37, 244, 238, 0.35)');
        S.taps = [T.tap(S.cam), T.tap(S.cam), T.tap(S.cam)];
        S.PLAY = [PH.x + P.X(195), PH.y + P.Y(640)]; S.SH = [PH.x + P.X(40), PH.y + P.Y(640)]; S.RP = [PH.x + P.X(350), PH.y + P.Y(640)];
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { inS: 1, inBlur: 18, outS: 1, outBlur: 0 });
        S.bg(t);
        S.head.update(lt, .02);
        S.cam.style.transform = about(PH.x, 1300, camS(lt));
        const o = S.o, tp = B(21) - T0, ts = B(22) - T0, tr = B(23) - T0;
        S.taps[0](lt, tp, S.PLAY[0], S.PLAY[1]); S.taps[1](lt, ts, S.SH[0], S.SH[1]); S.taps[2](lt, tr, S.RP[0], S.RP[1]);
        const playing = TQ(lt) >= TQ(tp);
        o.playI.style.display = playing ? 'none' : 'block'; o.pauseI.style.display = playing ? 'block' : 'none';
        o.play.style.transform = `scale(${T.press(lt, tp, .06).toFixed(4)})`;
        const sec = 48 + Math.max(0, lt - tp), fr = sec / 154;
        o.fill.style.width = (350 * fr).toFixed(1) + 'px'; o.knob.style.left = (20 + 350 * fr - 7).toFixed(1) + 'px';
        o.t0.textContent = '0:' + String(Math.floor(sec)).padStart(2, '0');
        o.cover.style.transform = `scale(${(.95 + .05 * E.soft(p(lt, tp, tp + .7)) + .012 * T.breath(t) * p(lt, tp, tp + .5)).toFixed(4)})`;
        const shOn = E.sine(p(lt, ts, ts + .2)), rpOn = E.sine(p(lt, tr, tr + .2));
        o.shuffle.style.color = T.mix('#ffffff', C.green, shOn); o.shDot.style.opacity = shOn.toFixed(3);
        o.repeat.style.color = T.mix('#ffffff', C.green, rpOn); o.rpDot.style.opacity = rpOn.toFixed(3);
        o.title.style.color = T.mix('#ffffff', C.green, E.sine(p(lt, tp, tp + .25)));
      },
    });
  })();

  /* =================================== s7 · LOCK SCREEN (B24 → B28) — same phone rect as s6 =================================== */
  (function () {
    const T0 = B(24), DUR = B(28) - T0, TR = [['Gym motivation mix', 'gym', 3], ['Dance challenge', 'dance', 21], ['Summer vibes', 'vibe', 33]];
    let S = {}, P;
    FILM.scene({
      id: 's7', t0: T0, t1: B(28), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.purp, .5, 660], [C.pink, .32, 560], ['#B84DFF', .3, 520], [C.cyan, .12, 420]], '#2E1A44');
        S.head = T.rise(root, 'Plays with your screen locked', { y: 330, size: 110 });
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        const a = T.at(S.cam, PH.x, PH.y); P = T.phone(a, PH.w); const ui = P.ui;
        el('div', 'position:absolute;inset:0;background:linear-gradient(165deg,#4A1838 0%,#5E1450 34%,#34156A 70%,#120A2A 100%)', ui);
        el('div', 'position:absolute;left:-80px;top:380px;width:340px;height:340px;border-radius:50%;background:radial-gradient(closest-side,rgba(254,44,85,.45),rgba(254,44,85,0))', ui);
        el('div', 'position:absolute;left:180px;top:560px;width:340px;height:340px;border-radius:50%;background:radial-gradient(closest-side,rgba(37,244,238,.28),rgba(37,244,238,0))', ui);
        T.status(ui);
        T.ico(ui, 'lock', 195, 62, 22, '#fff');
        el('div', 'position:absolute;left:0;right:0;top:86px;text-align:center;font:600 19px Inter;color:rgba(255,255,255,.88)', ui, 'Monday, November 2');
        el('div', 'position:absolute;left:0;right:0;top:108px;text-align:center;font:700 96px Inter;letter-spacing:-3px;color:#fff', ui, '9:41');
        const wd = el('div', 'position:absolute;left:14px;top:300px;width:362px;height:176px;border-radius:28px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.3);overflow:hidden', ui);
        S.covers = TR.map(([, k, s]) => el('div', 'position:absolute;left:16px;top:16px;width:64px;height:64px;border-radius:12px;overflow:hidden', wd, T.cover(k, s)));
        S.tclip = el('div', 'position:absolute;left:94px;top:18px;width:250px;height:30px;overflow:hidden', wd);
        S.titles = TR.map(([n]) => el('div', 'position:absolute;left:0;top:0;font:700 18px/30px Inter;color:#fff;white-space:nowrap', S.tclip, n));
        el('div', 'position:absolute;left:94px;top:50px;font:500 15px Inter;color:rgba(255,255,255,.78)', wd, 'DJ Nova');
        el('div', 'position:absolute;left:18px;top:100px;width:326px;height:5px;border-radius:3px;background:rgba(255,255,255,.25)', wd);
        S.fill = el('div', 'position:absolute;left:18px;top:100px;width:40px;height:5px;border-radius:3px;background:#fff', wd);
        T.ico(wd, 'prev', 110, 142, 34, '#fff'); T.ico(wd, 'pause', 181, 142, 38, '#fff'); S.nx = T.ico(wd, 'next', 252, 142, 34, '#fff');
        el('div', 'position:absolute;left:50%;bottom:10px;width:130px;height:5px;margin-left:-65px;border-radius:3px;background:#fff', ui);
        S.taps = [T.tap(S.cam), T.tap(S.cam)];
        S.NEXT = [PH.x + P.X(14 + 252), PH.y + P.Y(300 + 142)];
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { inS: 1, inBlur: 0 });                  // the phone stays put: only its screen and the light change
        S.bg(t);
        S.head.update(lt, .04);
        S.cam.style.transform = about(PH.x, 1300, 1.07 * zoom(lt, 0, DUR, 1, 1.04, E.glide));
        const t1 = B(25) - T0, t2 = B(26) - T0;
        S.taps[0](lt, t1, S.NEXT[0], S.NEXT[1]); S.taps[1](lt, t2, S.NEXT[0], S.NEXT[1]);
        const q = TQ(lt), k = q >= TQ(t2 + .1) ? 2 : q >= TQ(t1 + .1) ? 1 : 0;
        S.covers.forEach((c, i) => { c.style.display = i === k ? 'block' : 'none'; });
        const a1 = E.smooth(p(lt, t1, t1 + .3)), a2 = E.smooth(p(lt, t2, t2 + .3));
        const ys = [-34 * a1, 34 * (1 - a1) - 34 * a2, 34 * (1 - a2)];
        S.titles.forEach((ti, i) => { ti.style.transform = `translateY(${ys[i].toFixed(1)}px)`; });
        const since = lt - (k === 2 ? t2 : k === 1 ? t1 : -1.2);
        S.fill.style.width = (326 * clamp(.04 + since / 60)).toFixed(1) + 'px';
        S.nx.style.transform = `scale(${(T.press(lt, t1, .12) * T.press(lt, t2, .12)).toFixed(4)})`;
      },
    });
  })();

  /* =================================== s8 · OFFLINE (B28 → B32) =================================== */
  (function () {
    const T0 = B(28), DUR = B(32) - T0;
    let S = {};
    FILM.scene({
      id: 's8', t0: T0, t1: B(32), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [['#FF9F0A', .22, 560], [C.pink, .24, 520], [C.purp, .36, 600], [C.cyan, .14, 420]], '#2E2030');
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.head = T.rise(S.cam, 'Works offline', { y: 330, size: 124 });
        S.tg = T.at(S.cam, 540, 690);
        const card = el('div', `position:absolute;left:-420px;top:-84px;width:840px;height:168px;${T.GLASS2(48)}`, S.tg);
        el('div', 'position:absolute;left:34px;top:34px;width:100px;height:100px;border-radius:28px;background:#FF9F0A;padding:22px;box-sizing:border-box;color:#fff;box-shadow:0 0 30px rgba(255,159,10,.5)', card, T.svg('plane'));
        el('div', `position:absolute;left:164px;top:0;font:800 48px/168px Inter;letter-spacing:-.02em;color:${C.text}`, card, 'Airplane mode');
        S.track = el('div', 'position:absolute;left:676px;top:44px;width:136px;height:80px;border-radius:40px;background:#3A3446', card);
        S.knob = el('div', 'position:absolute;left:6px;top:6px;width:68px;height:68px;border-radius:34px;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.3)', S.track);
        S.wf = T.at(S.cam, 540, 900);
        const w2 = el('div', `position:absolute;left:-250px;top:-58px;width:500px;height:116px;${T.GLASS2(58)}`, S.wf);
        T.ico(w2, 'wifi', 84, 58, 64, '#7d7590');
        S.slash = el('div', `position:absolute;left:50px;top:20px;width:0;height:9px;border-radius:5px;background:${C.pink};transform:rotate(45deg);transform-origin:0 50%;box-shadow:0 0 0 3px #1d1827,0 0 14px rgba(254,44,85,.7)`, w2);
        el('div', `position:absolute;left:150px;top:0;font:800 40px/116px Inter;color:${C.muted}`, w2, 'No internet');
        S.pa = T.at(S.cam, 540, 1130); S.pill = T.soundPill(S.pa, { title: 'Gym motivation mix', sub: 'DJ Nova', w: 760, h: 140 });
        S.c1 = T.at(S.cam, 540, 1290);
        const c1 = el('div', `position:absolute;left:-210px;top:-42px;width:420px;height:84px;border-radius:42px;background:${C.green};display:flex;align-items:center;justify-content:center;gap:10px;font:800 34px Inter;color:#05290f;box-shadow:0 0 30px rgba(30,215,96,.45)`, S.c1);
        el('div', 'width:34px;height:34px', c1, T.svg('play')); c1.appendChild(document.createTextNode('Still playing'));
        S.c2 = T.at(S.cam, 540, 1400);
        const c2 = el('div', `position:absolute;left:-270px;top:-38px;width:540px;height:76px;${T.GLASS2(38)};display:flex;align-items:center;justify-content:center;gap:10px;font:700 30px Inter;color:#fff`, S.c2);
        el('div', 'width:32px;height:32px', c2, T.svg('download')); c2.appendChild(document.createTextNode('Saved on your phone'));
        S.tap = T.tap(S.cam);
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR);
        S.bg(t);
        S.head.update(lt, .02);
        S.cam.style.transform = about(540, 900, zoom(lt, -.2, DUR, 1, 1.04, E.glide));
        T.blurIn(S.tg, lt, -.05, .6, 50, .95, 12);
        const tt = .2; S.tap(lt, tt, 864, 690);
        const on = E.smooth(p(lt, tt, tt + .32));
        S.knob.style.transform = `translateX(${(56 * on).toFixed(1)}px)`;
        S.track.style.background = T.mix('#3A3446', C.green, on);
        S.track.style.boxShadow = `0 0 ${(24 * on).toFixed(1)}px rgba(30,215,96,${(.5 * on).toFixed(3)})`;
        T.blurIn(S.wf, lt, .12, .6, 46, .95, 12);
        S.slash.style.width = (98 * E.smooth(p(lt, B(29) - T0 - .06, B(29) - T0 + .3))).toFixed(1) + 'px';
        T.blurIn(S.pa, lt, .26, .65, 56, .94, 12);
        S.pill.update(t);
        T.blurIn(S.c1, lt, B(30) - T0 - .06, .6, 44, .94, 10);
        T.blurIn(S.c2, lt, B(31) - T0 - .06, .6, 44, .94, 10);
      },
    });
  })();

  /* =================================== s9 · FREE (B32 → B36) =================================== */
  (function () {
    const T0 = B(32), DUR = B(36) - T0, ROWS = ['No account', 'Unlimited playlists', 'Plays in the background'];
    let S = {};
    FILM.scene({
      id: 's9', t0: T0, t1: B(36), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.pink, .36, 640], [C.purp, .44, 640], [C.cyan, .18, 480], ['#FF9A3D', .12, 420]], '#3A1838');
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.free = T.text(S.cam, 'FREE.', { y: 560, size: 300, color: 'transparent', cls: 'U', css: `background:${T.GRADW};-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 36px rgba(254,44,85,.55))` });
        S.rows = ROWS.map((s, i) => {
          const a = T.at(S.cam, 540, 860 + i * 150);
          const r = el('div', `position:absolute;top:-60px;height:120px;padding:0 44px 0 24px;${T.GLASS(60, .8)};display:flex;align-items:center;gap:20px;font:800 46px Inter;letter-spacing:-.02em;color:${C.text};white-space:nowrap`, a);
          el('div', `width:76px;height:76px;border-radius:50%;background:${C.green};padding:16px;box-sizing:border-box;color:#05290f;box-shadow:0 0 20px rgba(30,215,96,.5)`, r, T.svg('check'));
          r.appendChild(document.createTextNode(s));
          r.style.left = -r.offsetWidth / 2 + 'px';
          return a;
        });
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR);
        S.bg(t);
        S.cam.style.transform = about(540, 900, zoom(lt, -.2, DUR, 1, 1.035, E.glide));
        T.blurIn(S.free.wrap, lt, -.1, .7, 60, 1.12, 22);
        S.rows.forEach((a, i) => { const tb = B(33 + i) - T0 - .06; a.style.display = lt >= tb ? 'block' : 'none'; T.blurIn(a, lt, tb, .6, 56, .92, 12); });
      },
    });
  })();

  /* =================================== s10 · HOME SCREEN (B36 → B40) =================================== */
  (function () {
    const T0 = B(36), DUR = B(40) - T0, SZ = 172, GX = 224, GY = 250, X0 = 540 - 1.5 * GX, Y0 = 760, SLOT = [2, 1];
    const TINT = ['#FFB13D', '#3DA9FF', '#4CC96B', '#FF5C8A', '#8E6BFF', '#FFC23D', '#2EC5B5', '#FF7A4D', '#6B8CFF', '#C85CFF', '#3DCB7A', '#FF5C8A'];
    const LAND = B(37) - T0, TAPT = B(38) - T0;
    let S = {};
    FILM.scene({
      id: 's10', t0: T0, t1: B(40), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.cyan, .2, 560], [C.pink, .24, 520], [C.purp, .4, 620], [C.purp, .2, 420]]);
        S.needle = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.needle);
        S.head = T.rise(S.cam, 'Add to Home Screen', { y: 330, size: 116 });
        const r = FILM.rand(77);
        for (let i = 0, k = 0; i < 16; i++) {
          const cx = i % 4, cy = Math.floor(i / 4);
          if (cx === SLOT[0] && cy === SLOT[1]) continue;
          const tint = TINT[k++ % TINT.length];
          const a = T.at(S.cam, X0 + cx * GX, Y0 + cy * GY);
          const d = el('div', `position:absolute;left:${-SZ / 2}px;top:${-SZ / 2}px;width:${SZ}px;height:${SZ}px;border-radius:${SZ * .225}px;background:linear-gradient(150deg,#2A2336,#16121F);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.08),0 0 30px ${T.hexA(tint, .12)}`, a);
          const g = Math.floor(r() * 4), gc = T.hexA(tint, .95);
          if (g === 0) el('div', `position:absolute;left:30%;top:30%;width:40%;height:40%;border-radius:50%;background:${gc}`, d);
          if (g === 1) el('div', `position:absolute;left:28%;top:28%;width:44%;height:44%;border-radius:22%;border:9px solid ${gc};box-sizing:border-box`, d);
          if (g === 2) [0, 1, 2].forEach((j) => el('div', `position:absolute;left:26%;top:${30 + j * 15}%;width:${48 - j * 10}%;height:9%;border-radius:6px;background:${gc}`, d));
          if (g === 3) el('div', `position:absolute;left:30%;top:26%;width:40%;height:48%;background:${gc};clip-path:polygon(50% 0,100% 100%,0 100%)`, d);
        }
        S.slot = [X0 + SLOT[0] * GX, Y0 + SLOT[1] * GY];
        S.halo = el('div', `position:absolute;left:${S.slot[0] - 260}px;top:${S.slot[1] - 260}px;width:520px;height:520px;border-radius:50%;background:radial-gradient(closest-side,rgba(254,44,85,.5),rgba(123,44,191,.25) 50%,rgba(123,44,191,0))`, S.cam);
        S.ta = T.at(S.cam, 0, 0); S.ti = T.appIcon(S.ta, SZ);
        S.lab = el('div', `position:absolute;left:${S.slot[0] - 100}px;top:${S.slot[1] + SZ / 2 + 10}px;width:200px;text-align:center;font:800 34px Inter;color:${C.text}`, S.cam, 'Tikify');
        S.tap = T.tap(S.cam);
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { outS: 1, outBlur: 20 });
        S.bg(t);
        S.head.update(lt, .02);
        const cs = zoom(lt, -.2, 1.1, 1, 1.03, E.glide);
        S.cam.style.transform = about(540, 960, cs);
        S.needle.style.transform = about(540 + cs * (S.slot[0] - 540), 960 + cs * (S.slot[1] - 960), zoom(lt, TAPT + .14, DUR + H2, 1, 3.4, E.in(3)));
        // the icon glides down into its slot (lands on B37) — no bounce
        const q = E.smooth(p(lt, -.15, LAND + .12));
        const x = 360 + (S.slot[0] - 360) * q, y = -160 + (S.slot[1] + 160) * q;
        S.ta.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(-12 * (1 - q)).toFixed(2)}deg) scale(${(1.5 - .5 * q).toFixed(4)})`;
        S.ti.style.transform = `scale(${T.press(lt, TAPT, .05).toFixed(4)})`;
        const hq = E.soft(p(lt, LAND - .1, LAND + .5)); S.halo.style.opacity = (hq * (.75 + .25 * T.breath(t))).toFixed(3); S.halo.style.transform = `scale(${(.6 + .4 * hq).toFixed(3)})`;
        T.blurIn(S.lab, lt, LAND, .5, 20, 1, 8);
        S.tap(lt, TAPT, S.slot[0], S.slot[1]);
      },
    });
  })();

  /* =================================== s11 · RECAP — SAVE. SORT. PLAY. REPEAT. (B40 → B44) =================================== */
  (function () {
    const T0 = B(40), DUR = B(44) - T0, CY = 640, GAP = 30;
    const WORDS = [[-.1, 'SAVE.', C.pink, 'download'], [BT, 'SORT.', C.cyan, 'playlist'], [2 * BT, 'PLAY.', '#C77DFF', 'play'], [3 * BT, 'REPEAT.', C.pink, 'repeat']];
    let S = {};
    FILM.scene({
      id: 's11', t0: T0, t1: B(44), pre: H2, post: H2,
      build(root) {
        S.bg = T.bg(root, [[C.pink, .3, 600], [C.purp, .42, 640], [C.cyan, .18, 500], [C.pink, .18, 440]]);
        S.glow = el('div', 'position:absolute;left:-60px;top:500px;width:1200px;height:1300px;border-radius:50%', root);
        S.stack = el('div', 'position:absolute;left:0;top:0;width:1080px', root);
        let top = 0; S.lines = WORDS.map(([, s]) => {
          const d = el('div', `position:absolute;left:0;top:${top}px;width:1080px;text-align:center`, S.stack);
          const sp = el('span', 'display:inline-block;font-size:230px;line-height:.95;white-space:nowrap;color:#fff', d, s); sp.className = 'U';
          const w = sp.offsetWidth; if (w > 930) sp.style.fontSize = (230 * 930 / w).toFixed(1) + 'px';
          const h = sp.offsetHeight; const o = { d, sp, top, h }; top += h + GAP; return o;
        });
        S.offs = S.lines.map((l) => CY - (l.top + l.h / 2));
        S.icons = WORDS.map((w) => { const a = T.at(root, 540, 1150); T.ico(a, w[3], 0, 0, 300, '#fff', `filter:drop-shadow(0 0 30px ${T.hexA(w[2], .8)})`); return a; });
      },
      update(lt, t, root) {
        T.trans(root, lt, DUR, { inS: .7, inBlur: 22 });
        S.bg(t);
        let pos = 0; for (let k = 1; k < WORDS.length; k++) pos += E.smooth(p(lt, WORDS[k][0] - .04, WORDS[k][0] + .32));
        const i0 = Math.min(3, Math.floor(pos)), fr = pos - i0, off = S.offs[i0] + ((S.offs[Math.min(i0 + 1, 3)] - S.offs[i0]) * fr);
        S.stack.style.transform = `translateY(${off.toFixed(2)}px)`;
        S.lines.forEach((l, i) => {
          const d = pos - i, fade = d < 0 ? 1 : d < 1 ? 1 - .74 * E.sine(d) : d < 2 ? .26 - .2 * E.sine(d - 1) : Math.max(0, .06 - .06 * (d - 2));
          const q = T.blurIn(l.d, lt, WORDS[i][0] - .04, .5, 70, 1.06, 18);
          l.d.style.opacity = (Math.min(1, q * 1.7) * fade).toFixed(3);
          l.sp.style.filter = `drop-shadow(0 0 ${(34 * Math.max(0, 1 - Math.abs(d))).toFixed(1)}px ${T.hexA(WORDS[i][2], .75)})`;
        });
        S.icons.forEach((a, i) => {                // each icon takes over from the last with a soft scale + blur exchange
          const qi = E.soft(p(lt, WORDS[i][0] - .04, WORDS[i][0] + .42)), qo = i < 3 ? E.in(2)(p(lt, WORDS[i + 1][0] - .04, WORDS[i + 1][0] + .2)) : 0;
          a.style.display = qi > 0 && qo < 1 ? 'block' : 'none';
          a.style.opacity = (Math.min(1, qi * 1.6) * (1 - qo)).toFixed(3);
          a.style.transform = `translateY(${((1 - qi) * 50 - qo * 40).toFixed(1)}px) scale(${(1.12 - .12 * qi - .12 * qo).toFixed(4)})`;
          a.style.filter = (1 - qi) + qo > .02 ? `blur(${(((1 - qi) + qo) * 14).toFixed(2)}px)` : 'none';
        });
        const ci = Math.min(3, Math.floor(pos)), col = T.mix(WORDS[ci][2], WORDS[Math.min(3, ci + 1)][2], pos - ci);
        S.glow.style.background = `radial-gradient(closest-side, ${T.hexA(col, .42)} 0%, ${T.hexA(col, .14)} 50%, ${T.hexA(col, 0)} 100%)`;
      },
    });
  })();

  /* =================================== s12 · END CARD (B44 → end) =================================== */
  (function () {
    const T0 = B(44), IY = 660;
    let S = {};
    FILM.scene({
      id: 's12', t0: T0, t1: 99, pre: H2,
      build(root) {
        S.bg = T.bg(root, [[C.pink, .3, 620], [C.purp, .46, 680], [C.cyan, .2, 520], [C.purp, .2, 460]], '#2E1C42');
        S.bloom = el('div', `position:absolute;left:${540 - 700}px;top:${IY - 700}px;width:1400px;height:1400px;border-radius:50%;background:radial-gradient(closest-side, rgba(254,44,85,.38) 0%, rgba(123,44,191,.22) 45%, rgba(123,44,191,0) 100%)`, root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.ia = T.at(S.cam, 540, IY); S.icon = T.appIcon(S.ia, 300, 1.3);
        S.word = T.rise(S.cam, 'Tikify', { y: 960, size: 240, cls: 'Iw', glow: 'rgba(254,44,85,.4)' });
        S.l1 = T.rise(S.cam, 'Save TikTok sounds.', { y: 1135, size: 64, color: '#CFC5E2', cls: 'Is', glow: 'rgba(0,0,0,0)' });
        S.l2 = T.rise(S.cam, 'Play them like music.', { y: 1215, size: 64, color: '#CFC5E2', cls: 'Is', glow: 'rgba(0,0,0,0)' });
        S.ca = T.at(S.cam, 540, 1385);
        S.cta = el('div', `position:absolute;left:-380px;top:-72px;width:760px;height:144px;border-radius:72px;background:linear-gradient(100deg,#FE2C55 0%,#B02A9A 55%,#7B2CBF 100%);box-shadow:0 0 40px rgba(254,44,85,.5),0 0 100px rgba(123,44,191,.45),inset 0 0 0 1.5px rgba(255,255,255,.25);overflow:hidden`, S.ca);
        el('div', 'position:absolute;left:0;right:0;top:0;text-align:center;font:800 56px/144px Inter;letter-spacing:-.01em;color:#fff', S.cta, 'Get it free · tikify.no');
        S.shine = el('div', 'position:absolute;top:-20px;left:0;width:170px;height:184px;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.45),rgba(255,255,255,0));transform:skewX(-20deg)', S.cta);
      },
      update(lt, t, root) {
        T.trans(root, lt, 99, { noOut: true });
        S.bg(t);
        S.bloom.style.transform = `scale(${(.9 + .1 * E.out(3)(p(lt, -.2, .8)) + .04 * T.breath(t)).toFixed(4)})`;
        S.cam.style.transform = about(540, 960, zoom(lt, .4, 2.4, 1, 1.03, E.glide));
        const z = zoom(lt, -.2, .7, .55, 1, E.out(3)), br = 1 + .02 * T.breath(t) * p(lt, .7, 1);
        S.ia.style.transform = `rotate(${(-8 * (1 - E.out(3)(p(lt, -.2, .7)))).toFixed(2)}deg) scale(${(z * br).toFixed(4)})`;
        S.word.update(lt, .04, .035, .6);
        S.l1.update(lt, .22, .012, .5); S.l2.update(lt, .3, .012, .5);
        T.blurIn(S.ca, lt, B(45) - T0 - .02, .6, 40, .9, 12);
        const sh = (tb) => p(lt, tb, tb + .7);
        const s1 = sh(.7), s2 = sh(B(48) - T0);
        const s = s2 > 0 ? s2 : s1;
        S.shine.style.transform = `translateX(${(-200 + 1080 * E.glide(s)).toFixed(1)}px) skewX(-20deg)`;
        S.shine.style.opacity = s > 0 && s < 1 ? 1 : 0;
      },
    });
  })();
})();
