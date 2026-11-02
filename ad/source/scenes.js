/* Tikify TikTok ad — 12 scenes on the track's bar grid (bar = 4 beats = 1.438 s, B(n) = 0.23 + n·0.3595).
   s1 hook 0–B4 · s2 copy link B4–B8 · s3 paste+save B8–B12 (breakdown) · s4 DROP brand B12–B16 · s5 playlists B16–B20
   s6 player B20–B24 · s7 lock screen B24–B28 · s8 offline B28–B32 · s9 free B32–B36 · s10 home screen B36–B40
   s11 recap B40–B44 · s12 end card B44–end. All cuts are hard cuts on bars; continuity is carried by objects. */
(function () {
  const { E, p, el, zoom, about, clamp, TQ, kf } = FILM;
  const { B, C, W, H, BT } = T;
  const tf = (x, y, s = 1, r = 0) => `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;

  /* ---------- shared: the vertical video card (a TikTok-style post; no third-party logo) ---------- */
  const CARD = { x: 280, y: 640, w: 520, h: 920 };
  function videoCard(root) {
    const R = CARD;
    const c = el('div', `position:absolute;left:${R.x}px;top:${R.y}px;width:${R.w}px;height:${R.h}px;border-radius:44px;overflow:hidden;background:#111;box-shadow:0 40px 90px rgba(40,10,60,.35),0 0 0 9px #fff`, root);
    el('div', 'position:absolute;inset:0;background:linear-gradient(170deg,#FFB13D 0%,#FF4D7E 42%,#8A2BE2 100%)', c);
    const beams = [0, 1].map((i) => el('div', `position:absolute;left:${i ? 330 : 40}px;top:-120px;width:150px;height:900px;transform-origin:75px 0;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 80%);clip-path:polygon(42% 0,58% 0,100% 100%,0 100%)`, c));
    el('div', 'position:absolute;left:-40px;right:-40px;top:610px;height:320px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.35),rgba(255,255,255,0))', c);
    const balls = [[150, 80, '#FFE27A'], [260, 104, '#FFFFFF'], [380, 70, '#25F4EE']].map(([x, d, col], i) => {
      const sh = el('div', `position:absolute;left:${x - d * .5}px;top:${640 - 10}px;width:${d}px;height:20px;border-radius:50%;background:rgba(60,0,60,.28)`, c);
      const b = el('div', `position:absolute;left:${x - d / 2}px;top:${640 - d}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0%,${col} 38%,${col} 70%,rgba(0,0,0,.15) 100%);transform-origin:50% 100%`, c);
      return { b, sh, d, ph: i * .33 };
    });
    el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 58%,rgba(20,0,30,.55) 100%)', c);
    // right column
    const col = [['heart', '1.2M', 430], ['comment', '8,214', 545], ['share', 'Share', 660]].map(([ic, n, y]) => {
      const a = T.at(c, R.w - 52, y);
      const i = T.ico(a, ic, 0, 0, 62, '#fff', 'filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))');
      el('div', 'position:absolute;left:-60px;top:38px;width:120px;text-align:center;font:700 21px Inter;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4)', a, n);
      return i;
    });
    el('div', 'position:absolute;left:26px;top:742px;font:800 29px Inter;color:#fff', c, '@djnova');
    el('div', 'position:absolute;left:26px;top:783px;font:500 23px Inter;color:#fff', c, 'this sound is on repeat');
    T.ico(c, 'note', 40, 840, 26, '#fff');
    const tk = el('div', 'position:absolute;left:62px;top:825px;width:290px;height:32px;overflow:hidden', c);
    const tkt = el('div', 'position:absolute;left:0;top:0;font:600 23px/32px Inter;color:#fff;white-space:nowrap', tk, 'original sound - DJ Nova &nbsp;·&nbsp; original sound - DJ Nova &nbsp;·&nbsp; original sound - DJ Nova');
    const disc = el('div', `position:absolute;left:${R.w - 82}px;top:800px;width:60px;height:60px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 8px rgba(30,30,30,.85)`, c, T.cover('gym', 3));
    el('div', 'position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(255,255,255,.3)', c);
    const prog = el('div', 'position:absolute;left:0;bottom:0;height:5px;width:0;background:#fff', c);
    const rp = el('div', 'position:absolute;left:22px;top:22px;height:58px;padding:0 20px 0 14px;border-radius:29px;background:rgba(20,0,30,.38);display:flex;align-items:center;gap:8px;color:#fff;transform-origin:20% 50%', c);
    el('div', 'width:34px;height:34px', rp, T.svg('replay'));
    const rpn = el('div', 'font:800 30px Inter;letter-spacing:-.01em', rp, '×12');
    return {
      c, col,
      update(t, loopStart, loopLen, count, countT) {
        beams.forEach((b, i) => { b.style.transform = `rotate(${(i ? -1 : 1) * (14 + 10 * Math.sin(t * 2.2 + i * 2))}deg)`; });
        balls.forEach(({ b, sh, ph }) => {
          const x = ((t - .23) / BT + ph) % 1, up = Math.sin(Math.PI * (x < 0 ? x + 1 : x)), hgt = 170 * up ** .8;
          const sq = up < .12 ? 1 - (.12 - up) * 1.6 : 1;
          b.style.transform = `translateY(${-hgt}px) scale(${(2 - sq).toFixed(3)},${sq.toFixed(3)})`;
          sh.style.transform = `scaleX(${(1.1 - .5 * up).toFixed(3)})`; sh.style.opacity = (1 - .6 * up).toFixed(3);
        });
        tkt.style.transform = `translateX(${-((t * 60) % 330)}px)`;
        disc.style.transform = `rotate(${t * 140}deg)`;
        prog.style.width = (R.w * clamp((t - loopStart) / loopLen)).toFixed(1) + 'px';
        rpn.textContent = count;
        rp.style.transform = `scale(${(1 + .22 * Math.exp(-Math.max(0, t - countT) / .09) * (t >= countT ? 1 : 0)).toFixed(3)})`;
      },
    };
  }

  /* ---------- shared: the copied link pill (s2 → carried into the input in s3) ---------- */
  const LINK = { x: 540, y: 520, w: 660, h: 104 };
  function linkPill(root) {
    const a = T.at(root, LINK.x, LINK.y, 'z-index:40');
    const box = el('div', `position:absolute;left:${-LINK.w / 2}px;top:${-LINK.h / 2}px;width:${LINK.w}px;height:${LINK.h}px;box-sizing:border-box;border-radius:${LINK.h / 2}px;border:5px solid transparent;background:linear-gradient(#fff,#fff) padding-box, ${T.GRAD} border-box;box-shadow:0 24px 50px rgba(123,44,191,.3);overflow:hidden`, a);
    const ic = el('div', `position:absolute;left:12px;top:12px;width:70px;height:70px;border-radius:50%;background:${C.pink};padding:15px;box-sizing:border-box;color:#fff`, box, T.svg('link'));
    const tx = el('div', `position:absolute;left:100px;top:0;font:700 31px/94px Inter;color:${C.ink};white-space:nowrap`, box, 'tiktok.com/@djnova/video/7302…');
    tx.style.lineHeight = '94px';
    return { a, box, ic, tx };
  }

  /* =================================== s1 · HOOK (0 → B4) =================================== */
  (function () {
    const WORDS = [[-0.12, 'STOP', C.pink, '#fff', 250], [B(1), 'REWATCHING', C.cyan, C.ink, 230], [B(2), 'TIKTOKS', C.purp, '#fff', 230], [B(3), 'FOR THE<br>SOUND', '#FFFFFF', C.pink, 200]];
    const COUNTS = ['×12', '×27', '×48', '×99+'];
    let S = {};
    FILM.scene({
      id: 's1', t0: 0, t1: B(4),
      build(root) {
        S.plates = WORDS.map((w) => el('div', `position:absolute;inset:0;background:${w[2]}`, root));
        el('div', 'position:absolute;inset:0;background:radial-gradient(70% 38% at 50% 22%,rgba(255,255,255,.30),rgba(255,255,255,0)),radial-gradient(60% 40% at 50% 100%,rgba(255,255,255,.18),rgba(255,255,255,0))', root);
        S.words = WORDS.map((w) => T.text(root, w[1], { y: 400, size: w[4], color: w[3], cls: 'U' }));
        S.card = videoCard(root);
        S.tap = T.tap(root);
      },
      update(lt, t) {
        const q = TQ(lt); let k = 0;
        WORDS.forEach((w, i) => { if (q >= TQ(Math.max(0, w[0]))) k = i; });
        S.plates.forEach((pl, i) => { pl.style.display = i === k ? 'block' : 'none'; });
        S.words.forEach((w, i) => {
          w.wrap.style.display = i === k ? 'block' : 'none'; if (i !== k) return;
          const s = T.slam(lt, i ? TQ(WORDS[i][0]) : WORDS[i][0]);
          w.wrap.style.transform = `rotate(${((i % 2 ? 2.6 : -2.6) * (s - 1) / .45).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        });
        const ls = i => (i ? TQ(WORDS[i][0]) : -0.12);
        const punch = 1 + .035 * Math.exp(-Math.max(0, lt - ls(k)) / .1);
        S.card.c.style.transform = `scale(${punch.toFixed(4)})`;
        S.card.update(t, ls(k), 1.2, COUNTS[k], ls(k));
        S.tap(lt, 1.5, CARD.x + CARD.w - 52, CARD.y + 660);
      },
    });
  })();

  /* =================================== s2 · COPY THE LINK (B4 → B8) =================================== */
  (function () {
    const T0 = B(4);
    let S = {};
    FILM.scene({
      id: 's2', t0: T0, t1: B(8),
      build(root) {
        S.bg = T.blobs(root, C.paper, [[C.pink, .38, 520], [C.cyan, .42, 560], [C.purp, .22, 480], ['#FFB13D', .25, 420]]);
        S.head = T.rise(root, 'Copy the link', { y: 330, size: 124, color: C.ink });
        S.card = videoCard(root);
        // share sheet inside the card
        S.sheet = el('div', 'position:absolute;left:0;right:0;top:470px;height:470px;border-radius:34px 34px 0 0;background:#fff;box-shadow:0 -10px 40px rgba(0,0,0,.25)', S.card.c);
        el('div', 'position:absolute;left:50%;top:14px;width:60px;height:6px;margin-left:-30px;border-radius:3px;background:#dcd6e2', S.sheet);
        el('div', `position:absolute;left:0;right:0;top:40px;text-align:center;font:800 27px Inter;color:${C.ink}`, S.sheet, 'Share to');
        S.opts = [['link', 'Copy link', C.pink], ['comment', 'Message', '#22C7C2'], ['download', 'Save video', C.purp], ['dots', 'More', '#B9B2C4']].map(([ic, lab, bg], i) => {
          const a = T.at(S.sheet, 76 + i * 123, 160);
          const d = el('div', `position:absolute;left:-46px;top:-46px;width:92px;height:92px;border-radius:50%;background:${bg};padding:24px;box-sizing:border-box;color:#fff`, a, ic === 'dots' ? T.dots() : T.svg(ic));
          el('div', `position:absolute;left:-70px;top:58px;width:140px;text-align:center;font:600 19px Inter;color:${C.ink}`, a, lab);
          return d;
        });
        S.toast = el('div', `position:absolute;left:50%;top:330px;height:64px;width:300px;margin-left:-150px;border-radius:32px;background:${C.ink};color:#fff;font:700 24px/64px Inter;text-align:center`, S.sheet, 'Link copied');
        S.tap = T.tap(root);
        S.link = linkPill(root);
        S.badge = el('div', `position:absolute;left:${LINK.w / 2 - 128}px;top:${-LINK.h / 2 - 34}px;height:56px;padding:0 22px 0 14px;border-radius:28px;background:${C.green};display:flex;align-items:center;gap:6px;font:800 25px Inter;color:#05290f;box-shadow:0 10px 24px rgba(30,215,96,.35)`, S.link.a);
        el('div', 'width:30px;height:30px', S.badge, T.svg('check'));
        S.badge.appendChild(document.createTextNode('Copied'));
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, -.08);
        S.card.update(t, TQ(B(3)), 1.2, '×99+', -9);
        // the sheet rises from the card bottom (cause: the share tap at the end of s1)
        const sq = E.soft(p(lt, 0, .42)); S.sheet.style.transform = `translateY(${((1 - sq) * 480).toFixed(1)}px)`;
        // tap "Copy link" on B5
        const tp = B(5) - T0;
        S.tap(lt, tp, CARD.x + 76, CARD.y + 470 + 160);
        S.opts[0].style.transform = `scale(${1 - .1 * Math.sin(Math.PI * p(lt, tp, tp + .18))})`;
        const ty = E.soft(p(lt, tp + .05, tp + .4)); S.toast.style.transform = `translateY(${(1 - ty) * 30}px)`; S.toast.style.opacity = (ty * (1 - p(lt, 1.15, 1.35))).toFixed(3);
        // the link pill is born from the Copy-link button on B6 and flies up to its hold pose (LINK)
        const tb = B(6) - T0, fx = CARD.x + 76, fy = CARD.y + 470 + 160;
        const m = E.out(3)(p(lt, tb, tb + .45)), sc = .14 + .86 * E.soft(p(lt, tb, tb + .5));
        const x = fx + (LINK.x - fx) * m, y = fy + (LINK.y - fy) * m - 90 * Math.sin(Math.PI * m) * (1 - m);
        S.link.a.style.display = lt >= TQ(tb) ? 'block' : 'none';
        const bob = lt > tb + .5 ? 6 * Math.sin((lt - tb - .5) * 5) * (1 - p(lt, 1.25, 1.43)) : 0;
        S.link.a.style.transform = `translate(${(x - LINK.x).toFixed(1)}px,${(y - LINK.y + bob).toFixed(1)}px) scale(${sc.toFixed(4)})`;
        const bb = FILM.pop(lt, B(7) - T0, .45); S.badge.style.transform = `scale(${bb.toFixed(3)})`; S.badge.style.opacity = Math.min(1, bb * 3);
      },
    });
  })();

  /* =================================== s3 · PASTE + SAVE (B8 → B12, the breakdown) =================================== */
  (function () {
    const T0 = B(8), PX = 540, PY = 1160;
    let S = {}, P;
    FILM.scene({
      id: 's3', t0: T0, t1: B(12),
      zoom: (lt) => zoom(lt, 1.12, B(12) - T0, 1, 26, E.in(5)),
      build(root) {
        S.bg = T.blobs(root, '#F6F0FF', [[C.purp, .28, 560], [C.cyan, .38, 540], [C.pink, .30, 520], ['#FFFFFF', .7, 420]]);
        S.pan = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.needle = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.pan);
        S.push = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.needle);
        S.head = T.rise(S.pan, 'Paste it in Tikify', { y: 330, size: 116, color: C.ink });
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
        S.save = el('div', 'position:absolute;left:16px;top:652px;width:358px;height:50px;border-radius:25px;background:#fff;color:#000;font:800 16px/50px Inter;text-align:center', S.prev, 'Save to library');
        const tb = el('div', 'position:absolute;left:0;right:0;bottom:0;height:72px;background:#121212;border-top:1px solid #222;display:flex;justify-content:space-around;align-items:flex-start;padding-top:10px;box-sizing:border-box;z-index:12', ui);
        [['library', 'Library'], ['plus', 'Add sound'], ['search', 'Search']].forEach(([ic, n], i) => {
          const it = el('div', `display:flex;flex-direction:column;align-items:center;gap:4px;font:600 11px Inter;color:${i === 1 ? '#fff' : '#a7a7a7'}`, tb);
          el('div', `width:${i === 1 ? 44 : 24}px;height:${i === 1 ? 28 : 24}px;border-radius:${i === 1 ? 8 : 0}px;${i === 1 ? `background:${T.GRAD};padding:3px 9px;box-sizing:border-box;color:#fff` : ''}`, it, T.svg(ic));
          it.appendChild(document.createTextNode(n));
        });
        S.tapF = T.tap(S.push); S.tapS = T.tap(S.push);
        S.link = linkPill(root);
        S.SAVE = [PX + P.X(195), PY + P.Y(677)];
        S.INPUT = [PX + P.X(166), PY + P.Y(176), 300 * P.k, 48 * P.k];
        S.FIND = [PX + P.X(195), PY + P.Y(236)];
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, .02);
        // camera: gentle push, then pan the Save button up to the frame centre, then the needle INTO it (peak on the drop)
        const push = zoom(lt, 0, 1.0, 1.12, 1.26, E.glide);
        S.push.style.transform = about(540, 900, push);
        const sy = 900 + push * (S.SAVE[1] - 900);
        const dy = -(sy - 1080) * E.smooth(p(lt, .62, 1.04));
        S.pan.style.transform = `translate(0px,${dy.toFixed(2)}px)`;
        S.needle.style.transform = about(540, sy, zoom(lt, 1.12, B(12) - T0, 1, 26, E.in(5)));
        // the link pill flies from its s2 hold pose into the input field and becomes the input
        const ix = 540 + push * (S.INPUT[0] - 540), iy = 900 + push * (S.INPUT[1] - 900), iw = S.INPUT[2] * push, ih = S.INPUT[3] * push;
        const m = E.smooth(p(lt, .02, .3));
        const L = S.link;
        L.a.style.display = lt < .3 ? 'block' : 'none';
        if (lt < .3) {
          const w = LINK.w + (iw - LINK.w) * m, h = LINK.h + (ih - LINK.h) * m;
          L.a.style.transform = `translate(${((ix - LINK.x) * m).toFixed(1)}px,${((iy - LINK.y) * m).toFixed(1)}px)`;
          L.box.style.width = w + 'px'; L.box.style.height = h + 'px'; L.box.style.left = -w / 2 + 'px'; L.box.style.top = -h / 2 + 'px';
          L.box.style.borderRadius = (h / 2 * (1 - m) + 8 * m) + 'px';
          const dk = p(lt, .12, .3);
          L.box.style.background = `linear-gradient(rgba(${Math.round(255 - 219 * dk)},${Math.round(255 - 219 * dk)},${Math.round(255 - 219 * dk)},1),rgba(${Math.round(255 - 219 * dk)},${Math.round(255 - 219 * dk)},${Math.round(255 - 219 * dk)},1)) padding-box, ${T.GRAD} border-box`;
          L.tx.style.color = dk > .5 ? '#fff' : C.ink;
          L.tx.style.transform = `scale(${(1 - .3 * m).toFixed(3)})`; L.tx.style.transformOrigin = '0 50%';
          L.tx.style.lineHeight = (h - 10) + 'px'; L.tx.style.left = (100 - 80 * m) + 'px';
          L.ic.style.transform = `scale(${(1 - m).toFixed(3)})`;
        }
        const pasted = lt >= .3;
        S.input.textContent = pasted ? 'https://www.tiktok.com/@djnova/video/7302…' : 'https://www.tiktok.com/@user/video/…';
        S.input.style.color = pasted ? '#fff' : '#a7a7a7';
        S.input.style.borderColor = pasted && lt < .5 ? '#fff' : '#7a7a7a';
        // Find sound on B9 → spinner → preview on B10
        const tf1 = B(9) - T0;
        S.tapF(lt, tf1, S.FIND[0], S.FIND[1]);
        S.find.style.transform = `scale(${1 - .04 * Math.sin(Math.PI * p(lt, tf1, tf1 + .16))})`;
        const loading = lt > tf1 + .06 && lt < B(10) - T0 - .02;
        S.find.style.color = loading ? 'transparent' : '#000';
        S.spin.style.display = loading ? 'block' : 'none'; S.spin.style.transform = `rotate(${lt * 900}deg)`;
        const pv = E.soft(p(lt, B(10) - T0 - .02, B(10) - T0 + .45));
        S.prev.style.opacity = Math.min(1, pv * 2.2).toFixed(3); S.prev.style.transform = `translateY(${((1 - pv) * 40).toFixed(1)}px)`;
        // tap Save on B11
        const ts = B(11) - T0;
        S.tapS(lt, ts, S.SAVE[0], S.SAVE[1]);
        S.save.style.transform = `scale(${1 - .05 * Math.sin(Math.PI * p(lt, ts, ts + .16))})`;
      },
    });
  })();

  /* =================================== s4 · DROP: brand (B12 → B16) =================================== */
  (function () {
    const T0 = B(12), IY = 790;
    let S = {};
    FILM.scene({
      id: 's4', t0: T0, t1: B(16),
      zoom: (lt) => zoom(lt, 0, .6, .35, 1, E.out(3)),
      build(root) {
        el('div', 'position:absolute;inset:0;background:#fff', root);
        S.flood = el('div', `position:absolute;inset:0;background:${T.GRADV}`, root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.rings = [0, 1, 2, 3].map(() => el('div', `position:absolute;left:${540 - 200}px;top:${IY - 200}px;width:400px;height:400px;border-radius:50%;border:8px solid rgba(255,255,255,.6);box-sizing:border-box`, S.cam));
        S.icon = T.at(S.cam, 540, IY); S.ic = T.appIcon(S.icon, 330);
        S.icon.firstChild.style.boxShadow = '0 40px 90px rgba(40,0,60,.45), 0 0 0 10px rgba(255,255,255,.95)';
        S.word = T.rise(S.cam, 'Tikify', { y: 1090, size: 210, color: '#fff', cls: 'Iw' });
        S.l1 = T.rise(S.cam, 'Your TikTok sounds.', { y: 1260, size: 84, color: '#fff', cls: 'Bh' });
        S.l2 = T.rise(S.cam, 'Played like music.', { y: 1360, size: 84, color: '#fff', cls: 'Bh' });
      },
      update(lt, t) {
        const R = 160 + 1500 * E.out(3)(p(lt, 0, .5));
        S.flood.style.clipPath = `circle(${R.toFixed(1)}px at 540px ${IY}px)`;
        S.cam.style.transform = about(540, 960, zoom(lt, .5, 1.44, 1, 1.05, E.glide));
        const z = zoom(lt, 0, .6, .35, 1, E.out(3)), pulse = 1 + .035 * T.env(t) * p(lt, .6, .8);
        S.icon.style.transform = `rotate(${(-14 * (1 - E.out(3)(p(lt, 0, .6)))).toFixed(2)}deg) scale(${(z * pulse).toFixed(4)})`;
        S.rings.forEach((r, i) => {
          const tb = i * BT, q = p(lt, tb, tb + .9), on = lt >= tb;
          r.style.display = on && q < 1 ? 'block' : 'none';
          r.style.transform = `scale(${(.85 + 2.6 * E.out(2)(q)).toFixed(3)})`; r.style.opacity = (1 - q).toFixed(3);
        });
        S.word.update(lt, B(13) - T0 - .06, .03, .5);
        S.l1.update(lt, B(14) - T0 - .05, .018, .45);
        S.l2.update(lt, B(15) - T0 - .05, .018, .45);
      },
    });
  })();

  /* =================================== s5 · PLAYLISTS — one sound splits into three (B16 → B20) =================================== */
  (function () {
    const T0 = B(16), PILL_Y = 690, CY = 1040, XS = [234, 540, 846];
    const PL = [['Gym', 5, ['gym', 'vibe', 'road', 'dance']], ['Chill', 4, ['chill', 'wave', 'night', 'chill']], ['Road trip', 4, ['road', 'vibe', 'gym', 'wave']]];
    let S = {};
    FILM.scene({
      id: 's5', t0: T0, t1: B(20),
      zoom: (lt) => zoom(lt, 1.22, B(20) - T0, 1, 6, E.in(4)),
      build(root) {
        S.bg = T.blobs(root, '#FFFFFF', [[C.pink, .30, 540], [C.cyan, .36, 560], [C.purp, .2, 500], ['#FFB13D', .22, 420]]);
        S.needle = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.needle);
        S.head = T.rise(S.cam, 'Sort into playlists', { y: 330, size: 116, color: C.ink });
        S.pa = T.at(S.cam, 540, PILL_Y); S.pill = T.soundPill(S.pa, { title: 'Gym motivation mix', sub: 'DJ Nova', w: 720, h: 132 });
        const NS = 'http://www.w3.org/2000/svg';
        S.svg = document.createElementNS(NS, 'svg'); S.svg.setAttribute('width', 1080); S.svg.setAttribute('height', 1920); S.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
        S.cam.appendChild(S.svg);
        const r = 26, top = PILL_Y + 66, mid = 836, bot = CY - 150;
        const paths = [`M540 ${top} V${mid}`, `M540 ${mid} H${XS[0] + r} Q${XS[0]} ${mid} ${XS[0]} ${mid + r} V${bot}`, `M540 ${mid} H${XS[2] - r} Q${XS[2]} ${mid} ${XS[2]} ${mid + r} V${bot}`, `M540 ${mid} V${bot}`];
        S.paths = paths.map((d) => { const pa = document.createElementNS(NS, 'path'); pa.setAttribute('d', d); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', C.purp); pa.setAttribute('stroke-width', 7); pa.setAttribute('stroke-linecap', 'round'); S.svg.appendChild(pa); return pa; });
        S.cards = PL.map(([n, cnt, keys], i) => {
          const a = T.at(S.cam, XS[i], CY);
          const cd = el('div', `position:absolute;left:-139px;top:-150px;width:278px;height:300px;box-sizing:border-box;border-radius:44px;border:5px solid transparent;background:linear-gradient(#fff,#fff) padding-box, ${T.GRAD} border-box;box-shadow:0 26px 60px rgba(123,44,191,.25)`, a);
          el('div', 'position:absolute;left:69px;top:26px;width:130px;height:130px;border-radius:14px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.18)', cd, T.mosaic(keys, 10 + i * 4));
          el('div', `position:absolute;left:0;right:0;top:168px;text-align:center;font:800 40px Inter;letter-spacing:-.02em;color:${C.ink}`, cd, n);
          const c = el('div', 'position:absolute;left:0;right:0;top:222px;text-align:center;font:700 27px Inter;color:#7a7385', cd, '0 sounds');
          return { a, cd, c, cnt };
        });
        S.chip = T.at(S.cam, 540, 1300);
        const ch = el('div', `position:absolute;left:-150px;top:-40px;width:300px;height:80px;border-radius:40px;background:${C.ink};color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font:700 30px Inter`, S.chip);
        el('div', 'width:34px;height:34px', ch, T.svg('plus')); ch.appendChild(document.createTextNode('New playlist'));
        S.tap = T.tap(S.cam);
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, -.04);
        const cs = zoom(lt, 0, 1.2, 1, 1.035, E.glide);
        S.cam.style.transform = about(540, 960, cs);
        S.needle.style.transform = about(540 + cs * (XS[0] - 540), 960 + cs * (CY - 960), zoom(lt, 1.22, B(20) - T0, 1, 6, E.in(4)));
        const pe = E.soft(p(lt, 0, .5)); S.pa.style.transform = `translateY(${((1 - pe) * 70).toFixed(1)}px) scale(${(.9 + .1 * pe).toFixed(4)})`; S.pa.style.opacity = Math.min(1, pe * 2.5).toFixed(3);
        S.pill.update(t);
        FILM.drawOn(S.paths[0], E.smooth(p(lt, .26, .42)));
        [1, 3, 2].forEach((k, j) => FILM.drawOn(S.paths[k], E.smooth(p(lt, .36 + j * .02, .6 + j * .02))));
        S.cards.forEach((c, i) => {
          const tb = B(17 + i) - T0, q = E.soft(p(lt, tb - .04, tb + .45));
          c.a.style.display = lt >= tb - .04 ? 'block' : 'none';
          c.a.style.transform = `translateY(${((1 - q) * 60).toFixed(1)}px) scale(${(.86 + .14 * q + .02 * Math.sin(Math.PI * q)).toFixed(4)})`;
          c.a.style.opacity = Math.min(1, q * 2.5).toFixed(3);
          const n = Math.min(c.cnt, Math.floor(c.cnt * p(TQ(lt), tb + .05, tb + .35) + 1e-6));
          c.c.textContent = n + (n === 1 ? ' sound' : ' sounds');
        });
        const cq = E.soft(p(lt, B(19) - T0 + .1, B(19) - T0 + .5)); S.chip.style.transform = `translateY(${((1 - cq) * 50).toFixed(1)}px) scale(${(.9 + .1 * cq).toFixed(3)})`; S.chip.style.opacity = Math.min(1, cq * 2.5).toFixed(3);
        S.tap(lt, 1.16, XS[0], CY);
        S.cards[0].cd.style.transform = `scale(${1 - .05 * Math.sin(Math.PI * p(lt, 1.16, 1.3))})`;
      },
    });
  })();

  /* ---------- shared: player screen + lock screen (same phone rect in s6 and s7 = mockup hand-off) ---------- */
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
    const T0 = B(20);
    let S = {}, P;
    FILM.scene({
      id: 's6', t0: T0, t1: B(24),
      zoom: (lt) => zoom(lt, 0, .62, .42, 1, E.out(3)) * zoom(lt, .6, 1.438, 1, 1.07, E.glide),
      build(root) {
        S.bg = T.blobs(root, C.cyan, [['#FFFFFF', .55, 520], [C.pink, .22, 520], ['#FFFFFF', .4, 480], [C.purp, .14, 460]]);
        S.head = T.rise(root, 'Play them like music', { y: 330, size: 116, color: C.ink });
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        const a = T.at(S.cam, PH.x, PH.y); P = T.phone(a, PH.w); S.o = playerScreen(P);
        S.taps = [T.tap(S.cam), T.tap(S.cam), T.tap(S.cam)];
        S.PLAY = [PH.x + P.X(195), PH.y + P.Y(640)]; S.SH = [PH.x + P.X(40), PH.y + P.Y(640)]; S.RP = [PH.x + P.X(350), PH.y + P.Y(640)];
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, -.04);
        S.cam.style.transform = about(PH.x, 1300, zoom(lt, 0, .62, .42, 1, E.out(3)) * zoom(lt, .6, 1.438, 1, 1.07, E.glide));
        const o = S.o, tp = B(21) - T0, ts = B(22) - T0, tr = B(23) - T0;
        S.taps[0](lt, tp, S.PLAY[0], S.PLAY[1]); S.taps[1](lt, ts, S.SH[0], S.SH[1]); S.taps[2](lt, tr, S.RP[0], S.RP[1]);
        const playing = TQ(lt) >= TQ(tp);
        o.playI.style.display = playing ? 'none' : 'block'; o.pauseI.style.display = playing ? 'block' : 'none';
        o.play.style.transform = `scale(${1 - .08 * Math.sin(Math.PI * p(lt, tp, tp + .16))})`;
        const sec = 48 + Math.max(0, lt - tp); const fr = sec / 154;
        o.fill.style.width = (350 * fr).toFixed(1) + 'px'; o.knob.style.left = (20 + 350 * fr - 7).toFixed(1) + 'px';
        o.t0.textContent = '0:' + String(Math.floor(sec)).padStart(2, '0');
        o.cover.style.transform = `scale(${(playing ? 1 + .018 * T.env(t) : .94 + .06 * E.soft(p(lt, 0, .4))).toFixed(4)})`;
        const shOn = TQ(lt) >= TQ(ts), rpOn = TQ(lt) >= TQ(tr);
        o.shuffle.style.color = shOn ? C.green : '#fff'; o.shDot.style.opacity = shOn ? 1 : 0;
        o.repeat.style.color = rpOn ? C.green : '#fff'; o.rpDot.style.opacity = rpOn ? 1 : 0;
        o.title.style.color = playing ? C.green : '#fff';
      },
    });
  })();

  /* =================================== s7 · LOCK SCREEN (B24 → B28) =================================== */
  (function () {
    const T0 = B(24), TR = [['Gym motivation mix', 'gym', 3], ['Dance challenge', 'dance', 21], ['Summer vibes', 'vibe', 33]];
    let S = {}, P;
    FILM.scene({
      id: 's7', t0: T0, t1: B(28),
      zoom: (lt) => 1.07 * zoom(lt, 0, 1.438, 1, 1.04, E.glide),
      build(root) {
        S.bg = T.blobs(root, C.purp, [[C.pink, .55, 560], [C.cyan, .35, 520], ['#B84DFF', .5, 520], [C.pink, .3, 420]]);
        S.head = T.rise(root, 'Plays with your screen locked', { y: 330, size: 110, color: '#fff' });
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        const a = T.at(S.cam, PH.x, PH.y); P = T.phone(a, PH.w); const ui = P.ui;
        el('div', 'position:absolute;inset:0;background:linear-gradient(165deg,#FFB13D 0%,#FE2C55 38%,#9B2BCF 75%,#5B3BE8 100%)', ui);
        el('div', 'position:absolute;left:-60px;top:420px;width:300px;height:300px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,226,122,.55),rgba(255,226,122,0))', ui);
        el('div', 'position:absolute;left:200px;top:560px;width:320px;height:320px;border-radius:50%;background:radial-gradient(closest-side,rgba(37,244,238,.45),rgba(37,244,238,0))', ui);
        T.status(ui);
        T.ico(ui, 'lock', 195, 62, 22, '#fff');
        el('div', 'position:absolute;left:0;right:0;top:86px;text-align:center;font:600 19px Inter;color:rgba(255,255,255,.92)', ui, 'Monday, November 2');
        el('div', 'position:absolute;left:0;right:0;top:108px;text-align:center;font:700 96px Inter;letter-spacing:-3px;color:#fff', ui, '9:41');
        const wd = el('div', 'position:absolute;left:14px;top:300px;width:362px;height:176px;border-radius:28px;background:rgba(255,255,255,.26);box-shadow:inset 0 0 0 1px rgba(255,255,255,.4),0 10px 30px rgba(40,0,60,.18);overflow:hidden', ui);
        S.covers = TR.map(([, k, s]) => el('div', 'position:absolute;left:16px;top:16px;width:64px;height:64px;border-radius:12px;overflow:hidden', wd, T.cover(k, s)));
        S.tclip = el('div', 'position:absolute;left:94px;top:18px;width:250px;height:30px;overflow:hidden', wd);
        S.titles = TR.map(([n]) => el('div', 'position:absolute;left:0;top:0;font:700 18px/30px Inter;color:#fff;white-space:nowrap', S.tclip, n));
        el('div', 'position:absolute;left:94px;top:50px;font:500 15px Inter;color:rgba(255,255,255,.85)', wd, 'DJ Nova');
        el('div', 'position:absolute;left:18px;top:100px;width:326px;height:5px;border-radius:3px;background:rgba(255,255,255,.35)', wd);
        S.fill = el('div', 'position:absolute;left:18px;top:100px;width:40px;height:5px;border-radius:3px;background:#fff', wd);
        T.ico(wd, 'prev', 110, 142, 34, '#fff'); T.ico(wd, 'pause', 181, 142, 38, '#fff'); S.nx = T.ico(wd, 'next', 252, 142, 34, '#fff');
        el('div', 'position:absolute;left:50%;bottom:10px;width:130px;height:5px;margin-left:-65px;border-radius:3px;background:#fff', ui);
        S.taps = [T.tap(S.cam), T.tap(S.cam)];
        S.NEXT = [PH.x + P.X(14 + 252), PH.y + P.Y(300 + 142)];
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, -.04);
        S.cam.style.transform = about(PH.x, 1300, 1.07 * zoom(lt, 0, 1.438, 1, 1.04, E.glide));
        const t1 = B(25) - T0, t2 = B(26) - T0;
        S.taps[0](lt, t1, S.NEXT[0], S.NEXT[1]); S.taps[1](lt, t2, S.NEXT[0], S.NEXT[1]);
        const q = TQ(lt), k = q >= TQ(t2) ? 2 : q >= TQ(t1) ? 1 : 0;
        S.covers.forEach((c, i) => { c.style.display = i === k ? 'block' : 'none'; });
        const sw = (tb) => E.smooth(p(lt, tb, tb + .22));
        const a1 = sw(t1), a2 = sw(t2);
        const ys = [-34 * a1, 34 * (1 - a1) - 34 * a2, 34 * (1 - a2)];
        S.titles.forEach((ti, i) => { ti.style.transform = `translateY(${ys[i].toFixed(1)}px)`; });
        const since = lt - (k === 2 ? t2 : k === 1 ? t1 : -1.2);
        S.fill.style.width = (326 * clamp(.04 + since / 60)).toFixed(1) + 'px';
        S.nx.style.transform = `scale(${1 - .15 * Math.sin(Math.PI * p(lt, t1, t1 + .16)) - .15 * Math.sin(Math.PI * p(lt, t2, t2 + .16))})`;
      },
    });
  })();

  /* =================================== s8 · OFFLINE (B28 → B32) =================================== */
  (function () {
    const T0 = B(28);
    let S = {};
    FILM.scene({
      id: 's8', t0: T0, t1: B(32),
      build(root) {
        S.bg = T.blobs(root, '#FFF6EE', [['#FFB13D', .35, 540], [C.pink, .28, 520], [C.cyan, .32, 540], ['#FFFFFF', .6, 420]]);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.head = T.rise(S.cam, 'Works offline', { y: 330, size: 124, color: C.ink });
        S.tg = T.at(S.cam, 540, 690);
        const card = el('div', 'position:absolute;left:-420px;top:-84px;width:840px;height:168px;border-radius:48px;background:#fff;box-shadow:0 26px 60px rgba(120,60,20,.18)', S.tg);
        el('div', 'position:absolute;left:34px;top:34px;width:100px;height:100px;border-radius:28px;background:#FF9F0A;padding:22px;box-sizing:border-box;color:#fff', card, T.svg('plane'));
        el('div', `position:absolute;left:164px;top:0;font:800 48px/168px Inter;letter-spacing:-.02em;color:${C.ink}`, card, 'Airplane mode');
        S.track = el('div', 'position:absolute;left:676px;top:44px;width:136px;height:80px;border-radius:40px;background:#E5E1EA', card);
        S.knob = el('div', 'position:absolute;left:6px;top:6px;width:68px;height:68px;border-radius:34px;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.2)', S.track);
        S.wf = T.at(S.cam, 540, 900);
        const w2 = el('div', 'position:absolute;left:-250px;top:-58px;width:500px;height:116px;border-radius:58px;background:rgba(255,255,255,.75);box-shadow:0 14px 34px rgba(120,60,20,.12)', S.wf);
        S.wi = T.ico(w2, 'wifi', 84, 58, 64, '#9a92a6');
        S.slash = el('div', `position:absolute;left:50px;top:20px;width:0;height:9px;border-radius:5px;background:${C.pink};transform:rotate(45deg);transform-origin:0 50%;box-shadow:0 0 0 3px #fff`, w2);
        el('div', 'position:absolute;left:150px;top:0;font:800 40px/116px Inter;color:#6f6680', w2, 'No internet');
        S.pa = T.at(S.cam, 540, 1130); S.pill = T.soundPill(S.pa, { title: 'Gym motivation mix', sub: 'DJ Nova', w: 760, h: 140 });
        S.c1 = T.at(S.cam, 540, 1290);
        const c1 = el('div', `position:absolute;left:-210px;top:-42px;width:420px;height:84px;border-radius:42px;background:${C.green};display:flex;align-items:center;justify-content:center;gap:10px;font:800 34px Inter;color:#05290f`, S.c1);
        el('div', 'width:34px;height:34px', c1, T.svg('play')); c1.appendChild(document.createTextNode('Still playing'));
        S.c2 = T.at(S.cam, 540, 1400);
        const c2 = el('div', `position:absolute;left:-270px;top:-38px;width:540px;height:76px;border-radius:38px;background:${C.ink};display:flex;align-items:center;justify-content:center;gap:10px;font:700 30px Inter;color:#fff`, S.c2);
        el('div', 'width:32px;height:32px', c2, T.svg('download')); c2.appendChild(document.createTextNode('Saved on your phone'));
        S.tap = T.tap(S.cam);
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, -.04);
        S.cam.style.transform = about(540, 900, zoom(lt, 0, 1.44, 1, 1.04, E.glide));
        const te = E.soft(p(lt, 0, .45)); S.tg.style.transform = `translateY(${((1 - te) * 50).toFixed(1)}px) scale(${(.94 + .06 * te).toFixed(4)})`;
        const tt = .14; S.tap(lt, tt, 540 + 420 - 136 / 2 - 28 + 0, 690);
        const on = E.smooth(p(lt, tt, tt + .22));
        S.knob.style.transform = `translateX(${(56 * on).toFixed(1)}px)`;
        S.track.style.background = on > .5 ? C.green : '#E5E1EA';
        const ws = E.soft(p(lt, .1, .5)); S.wf.style.transform = `translateY(${((1 - ws) * 50).toFixed(1)}px)`; S.wf.style.opacity = Math.min(1, ws * 2.5).toFixed(3);
        S.slash.style.width = (98 * E.smooth(p(lt, B(29) - T0 - .05, B(29) - T0 + .2))).toFixed(1) + 'px';
        const pe = E.soft(p(lt, .2, .62)); S.pa.style.transform = `translateY(${((1 - pe) * 60).toFixed(1)}px) scale(${(.92 + .08 * pe).toFixed(4)})`; S.pa.style.opacity = Math.min(1, pe * 2.5).toFixed(3);
        S.pill.update(t);
        [[S.c1, B(30) - T0], [S.c2, B(31) - T0]].forEach(([c, tb]) => { const q = E.soft(p(lt, tb - .04, tb + .42)); c.style.transform = `translateY(${((1 - q) * 46).toFixed(1)}px) scale(${(.9 + .1 * q).toFixed(4)})`; c.style.opacity = Math.min(1, q * 2.5).toFixed(3); });
      },
    });
  })();

  /* =================================== s9 · FREE (B32 → B36) =================================== */
  (function () {
    const T0 = B(32), ROWS = ['No account', 'Unlimited playlists', 'Plays in the background'];
    let S = {};
    FILM.scene({
      id: 's9', t0: T0, t1: B(36),
      build(root) {
        el('div', `position:absolute;inset:0;background:${T.GRADV}`, root);
        S.bg = T.blobs(root, 'transparent', [['#FFFFFF', .16, 520], [C.cyan, .25, 480], ['#FFB13D', .22, 460]]);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.free = T.text(S.cam, 'FREE.', { y: 560, size: 300, color: '#fff', cls: 'U' });
        S.rows = ROWS.map((s, i) => {
          const a = T.at(S.cam, 540, 860 + i * 150);
          const r = el('div', `position:absolute;top:-60px;height:120px;padding:0 44px 0 24px;border-radius:60px;background:#fff;display:flex;align-items:center;gap:20px;font:800 46px Inter;letter-spacing:-.02em;color:${C.ink};white-space:nowrap;box-shadow:0 20px 50px rgba(60,0,80,.28)`, a);
          el('div', `width:76px;height:76px;border-radius:50%;background:${C.green};padding:16px;box-sizing:border-box;color:#05290f`, r, T.svg('check'));
          r.appendChild(document.createTextNode(s));
          r.style.left = -r.offsetWidth / 2 + 'px';
          return a;
        });
      },
      update(lt, t) {
        S.bg(t);
        S.cam.style.transform = about(540, 900, zoom(lt, 0, 1.44, 1, 1.035, E.glide));
        const s = T.slam(lt, 0, 1.5, .32); S.free.wrap.style.transform = `rotate(${(-3 * (s - 1) / .5).toFixed(2)}deg) scale(${(s * (1 + .03 * T.env(t) * p(lt, .4, .5))).toFixed(4)})`;
        S.rows.forEach((a, i) => {
          const tb = B(33 + i) - T0, q = E.soft(p(lt, tb - .04, tb + .45));
          a.style.display = lt >= tb - .04 ? 'block' : 'none';
          a.style.transform = `translateY(${((1 - q) * 60).toFixed(1)}px) scale(${(.86 + .14 * q + .025 * Math.sin(Math.PI * q)).toFixed(4)})`;
          a.style.opacity = Math.min(1, q * 2.5).toFixed(3);
        });
      },
    });
  })();

  /* =================================== s10 · HOME SCREEN (B36 → B40) =================================== */
  (function () {
    const T0 = B(36), SZ = 172, GX = 224, GY = 250, X0 = 540 - 1.5 * GX, Y0 = 760, SLOT = [2, 1];
    const TINT = [['#FFD36B', '#FF9F3D'], ['#7EE0FF', '#3D8BFF'], ['#C8F27A', '#4CC96B'], ['#FFB0C8', '#FF5C8A'], ['#D7C2FF', '#8E6BFF'], ['#FFE59A', '#FFC23D'], null, ['#9FF0E5', '#2EC5B5'], ['#FFC6A8', '#FF7A4D'], ['#BFD4FF', '#6B8CFF'], ['#F8B5FF', '#C85CFF'], ['#B8F5C8', '#3DCB7A']];
    let S = {};
    FILM.scene({
      id: 's10', t0: T0, t1: B(40),
      zoom: (lt) => zoom(lt, 1.06, B(40) - T0, 1, 8, E.in(4)),
      build(root) {
        S.bg = T.blobs(root, '#F4FBFF', [[C.cyan, .42, 560], [C.pink, .3, 520], [C.purp, .2, 480], ['#FFFFFF', .7, 420]]);
        S.needle = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.needle);
        S.head = T.rise(S.cam, 'Add to Home Screen', { y: 330, size: 116, color: C.ink });
        const r = FILM.rand(77);
        S.icons = [];
        for (let i = 0, k = 0; i < 16; i++) {
          const cx = i % 4, cy = Math.floor(i / 4);
          if (cx === SLOT[0] && cy === SLOT[1]) continue;
          const tint = TINT[k % TINT.length] || TINT[0]; k++;
          const a = T.at(S.cam, X0 + cx * GX, Y0 + cy * GY);
          const d = el('div', `position:absolute;left:${-SZ / 2}px;top:${-SZ / 2}px;width:${SZ}px;height:${SZ}px;border-radius:${SZ * .225}px;background:linear-gradient(150deg,${tint[0]},${tint[1]});box-shadow:0 14px 30px rgba(40,40,90,.14)`, a);
          const g = Math.floor(r() * 4);
          if (g === 0) el('div', 'position:absolute;left:30%;top:30%;width:40%;height:40%;border-radius:50%;background:rgba(255,255,255,.9)', d);
          if (g === 1) el('div', 'position:absolute;left:28%;top:28%;width:44%;height:44%;border-radius:22%;border:9px solid rgba(255,255,255,.9);box-sizing:border-box', d);
          if (g === 2) [0, 1, 2].forEach((j) => el('div', `position:absolute;left:26%;top:${30 + j * 15}%;width:${48 - j * 10}%;height:9%;border-radius:6px;background:rgba(255,255,255,.9)`, d));
          if (g === 3) el('div', 'position:absolute;left:30%;top:26%;width:40%;height:48%;background:rgba(255,255,255,.9);clip-path:polygon(50% 0,100% 100%,0 100%)', d);
          S.icons.push({ a, cx, cy });
        }
        S.slot = [X0 + SLOT[0] * GX, Y0 + SLOT[1] * GY];
        S.ta = T.at(S.cam, 0, 0); S.ti = T.appIcon(S.ta, SZ);
        S.lab = el('div', `position:absolute;left:${S.slot[0] - 100}px;top:${S.slot[1] + SZ / 2 + 10}px;width:200px;text-align:center;font:800 34px Inter;color:${C.ink}`, S.cam, 'Tikify');
        S.tap = T.tap(S.cam);
      },
      update(lt, t) {
        S.bg(t);
        S.head.update(lt, -.04);
        const cs = zoom(lt, 0, 1.1, 1, 1.03, E.glide);
        S.cam.style.transform = about(540, 960, cs);
        S.needle.style.transform = about(540 + cs * (S.slot[0] - 540), 960 + cs * (S.slot[1] - 960), zoom(lt, 1.06, B(40) - T0, 1, 8, E.in(4)));
        // the icon drops into its slot, landing on B37
        const tl = B(37) - T0, q = E.in(2)(p(lt, 0, tl));
        const x = 300 + (S.slot[0] - 300) * q, y = -220 + (S.slot[1] + 220) * q;
        const land = Math.max(0, lt - tl), b = lt > tl ? Math.exp(-land * 9) * Math.sin(land * 34) : 0;
        S.ta.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(-16 * (1 - q)).toFixed(2)}deg) scale(${(1.6 - .6 * q).toFixed(4)},${(1.6 - .6 * q).toFixed(4)})`;
        S.ti.style.transform = `scale(${(1 + .1 * b).toFixed(4)},${(1 - .1 * b).toFixed(4)})`;
        S.icons.forEach(({ a, cx, cy }) => {
          const d = Math.hypot(cx - SLOT[0], cy - SLOT[1]), tt = lt - tl - d * .04;
          const w = tt > 0 ? Math.exp(-tt * 6) * Math.sin(tt * 30) : 0;
          a.style.transform = `rotate(${(4 * w).toFixed(2)}deg) scale(${(1 - .04 * Math.abs(w)).toFixed(4)})`;
        });
        const lq = E.soft(p(lt, tl + .05, tl + .45)); S.lab.style.opacity = lq.toFixed(3); S.lab.style.transform = `translateY(${((1 - lq) * 20).toFixed(1)}px)`;
        const tp = B(38) - T0; S.tap(lt, tp, S.slot[0], S.slot[1]);
        if (lt > tp) S.ti.style.transform = `scale(${(1 - .08 * Math.sin(Math.PI * p(lt, tp, tp + .18))).toFixed(4)})`;
      },
    });
  })();

  /* =================================== s11 · RECAP — SAVE. SORT. PLAY. REPEAT. (B40 → B44) =================================== */
  (function () {
    const T0 = B(40);
    const WORDS = [['SAVE.', C.pink, '#fff', 'download'], ['SORT.', C.cyan, C.ink, 'playlist'], ['PLAY.', C.purp, '#fff', 'play'], ['REPEAT.', '#FFFFFF', C.pink, 'repeat']];
    let S = {};
    FILM.scene({
      id: 's11', t0: T0, t1: B(44),
      zoom: (lt) => (lt < BT ? zoom(lt, 0, .3, .5, 1, E.out(3)) : 1),
      build(root) {
        S.plates = WORDS.map((w) => el('div', `position:absolute;inset:0;background:${w[1]}`, root));
        el('div', 'position:absolute;inset:0;background:radial-gradient(70% 38% at 50% 30%,rgba(255,255,255,.30),rgba(255,255,255,0))', root);
        S.words = WORDS.map((w) => T.text(root, w[0], { y: 660, size: 250, color: w[2], cls: 'U' }));
        S.icons = WORDS.map((w) => { const a = T.at(root, 540, 1130); T.ico(a, w[3], 0, 0, 330, w[2]); return a; });
      },
      update(lt, t) {
        const q = TQ(lt); let k = 0;
        WORDS.forEach((w, i) => { if (q >= TQ(i * BT)) k = i; });
        const t0 = TQ(k * BT);
        S.plates.forEach((pl, i) => { pl.style.display = i === k ? 'block' : 'none'; });
        const s = k === 0 ? zoom(lt, 0, .3, .5, 1, E.out(3)) : T.slam(lt, t0, 1.45, .28);
        S.words.forEach((w, i) => { w.wrap.style.display = i === k ? 'block' : 'none'; if (i === k) w.wrap.style.transform = `rotate(${(k === 0 ? 0 : (i % 2 ? 2.4 : -2.4) * (s - 1) / .45).toFixed(2)}deg) scale(${s.toFixed(4)})`; });
        const si = k === 0 ? zoom(lt, 0, .34, .4, 1, E.out(3)) : T.slam(lt, t0 + .03, 1.6, .3);
        S.icons.forEach((a, i) => { a.style.display = i === k ? 'block' : 'none'; if (i === k) a.style.transform = `rotate(${(k === 3 ? 90 * (1 - E.out(3)(p(lt, t0, t0 + .32))) : 0).toFixed(2)}deg) scale(${si.toFixed(4)})`; });
      },
    });
  })();

  /* =================================== s12 · END CARD (B44 → end) =================================== */
  (function () {
    const T0 = B(44), IY = 660;
    let S = {};
    FILM.scene({
      id: 's12', t0: T0, t1: 99,
      zoom: (lt) => zoom(lt, 0, .55, .4, 1, E.out(3)),
      build(root) {
        S.bg = T.blobs(root, '#FFFFFF', [[C.pink, .30, 560], [C.cyan, .36, 560], [C.purp, .2, 520], ['#FFB13D', .18, 440]]);
        S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
        S.ia = T.at(S.cam, 540, IY); S.icon = T.appIcon(S.ia, 300);
        S.word = T.rise(S.cam, 'Tikify', { y: 960, size: 240, color: C.ink, cls: 'Iw' });
        S.l1 = T.rise(S.cam, 'Save TikTok sounds.', { y: 1135, size: 64, color: '#4b4458', cls: 'Is' });
        S.l2 = T.rise(S.cam, 'Play them like music.', { y: 1215, size: 64, color: '#4b4458', cls: 'Is' });
        S.ca = T.at(S.cam, 540, 1385);
        S.cta = el('div', `position:absolute;left:-380px;top:-72px;width:760px;height:144px;border-radius:72px;background:linear-gradient(100deg,#FE2C55 0%,#B02A9A 55%,#7B2CBF 100%);box-shadow:0 28px 60px rgba(176,42,154,.38);overflow:hidden`, S.ca);
        el('div', 'position:absolute;left:0;right:0;top:0;text-align:center;font:800 56px/144px Inter;letter-spacing:-.01em;color:#fff', S.cta, 'Get it free · tikify.no');
        S.shine = el('div', 'position:absolute;top:-20px;left:0;width:170px;height:184px;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:skewX(-20deg)', S.cta);
      },
      update(lt, t) {
        S.bg(t);
        S.cam.style.transform = about(540, 960, zoom(lt, .5, 2.4, 1, 1.03, E.glide));
        const z = zoom(lt, 0, .55, .4, 1, E.out(3)), pulse = 1 + .03 * T.env(t) * p(lt, .7, .8);
        S.ia.style.transform = `rotate(${(-12 * (1 - E.out(3)(p(lt, 0, .55)))).toFixed(2)}deg) scale(${(z * pulse).toFixed(4)})`;
        S.word.update(lt, .06, .03, .5);
        S.l1.update(lt, .22, .012, .45); S.l2.update(lt, .28, .012, .45);
        const cq = FILM.pop(lt, B(45) - T0, .5);
        S.ca.style.transform = `scale(${(.6 + .4 * cq).toFixed(4)})`; S.ca.style.opacity = Math.min(1, cq * 3).toFixed(3);
        const sh = (tb) => p(lt, tb, tb + .55);
        const s1 = sh(.78), s2 = sh(B(48) - T0);
        const s = s2 > 0 ? s2 : s1;
        S.shine.style.transform = `translateX(${(-200 + 1080 * E.glide(s)).toFixed(1)}px) skewX(-20deg)`;
        S.shine.style.opacity = s > 0 && s < 1 ? 1 : 0;
      },
    });
  })();
})();
