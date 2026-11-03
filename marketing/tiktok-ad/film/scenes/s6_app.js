/* s6 · 9.53–16.94 · the app, one persistent phone (v2, after review). The icon opens up into a big phone (820 px: app
   copy at ~2× its logical size, readable at phone size) whose bottom runs off the frame; the camera travels down the
   screen to whatever the finger is working on and punches in on the kicks. The flow is the REAL Tikify flow
   (app.js renderAdd → lookupAndPreview → save → "✓ saved" panel → Play now → mini player → full-screen player
   "Playing from Just added"). Big word-by-word captions sit in the top band, clear of TikTok's overlays. Then the phone
   steps back while three true feature pills land on the track's hits, and closes back into the icon (carried into s7). */
(function () {
  const { E, p, el, clamp, lerp, kf } = FILM;
  const T = K.T, T0 = 9.53, T1 = K.bar(4);                          // 16.94
  const C = K.C;
  const BZ = 22, PW = 820, SC = (PW - 2 * BZ) / 390, PH = Math.round(844 * SC + 2 * BZ), PR = 96;
  const PCX = 540, PCY = 470 + PH / 2;                                // phone rect in WORLD px (camera at identity)
  const IC = K.ICONPOS, END = { x: 540, y: 680, s: 300 };
  K.END_ICON = END;
  const HANDLE = 'tikify.demo';                                       // invented: checked to not exist on TikTok / Spotify / SoundCloud
  const LINK = `https://www.tiktok.com/@${HANDLE}/video/7438…`;
  const TM = {
    paste: 10.02, find: 10.31, born: 10.47, play: 10.84, scroll0: 10.98, scroll1: 11.40, chip: 11.30, save: 11.66, toast: 11.76,
    saved: 11.82, playNow: 12.18, mini: 12.22, miniTap: 13.24, player0: 13.26, player1: 13.62, feat: K.bar(3), close0: 16.52,
  };
  const PILLS = [14.82, 15.09, 15.61];                                // on the track's hits (review sync-3)
  const CAPS = [
    { a: 9.60, b: 10.95, l1: 'Paste any', l2: 'TikTok link', w: [9.62, 9.79, 9.96, 10.13] },
    { a: 11.0, b: 12.62, l1: 'Get the', l2: 'exact sound', w: [11.0, 11.14, 11.31, 11.47] },
    { a: 12.71, b: 14.76, l1: 'Play it', l2: 'like music.', w: [12.71, 12.88, 13.06, 13.24] },
  ];
  // camera keys [t, dy (world px), scale about the frame centre] — each move follows what the finger works on
  const CAM = [[T0, 0, 1], [10.0, 0, 1], [10.42, 0, 1.06], [10.95, -250, 1.06], [11.45, -560, 1.06], [13.30, -560, 1.06],
    [13.72, -290, .92], [14.76, -290, 1.0], [15.30, 229, .55], [TM.close0, 229, .55]];
  const KICKS = []; for (let k = 0; k < 14; k++) KICKS.push(8.47 + k * 2 * K.BEAT);
  let S = {};

  const btn = (parent, x, y, w, label, primary = true) => el('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:48px;border-radius:999px;box-sizing:border-box;` +
    `background:${primary ? '#fff' : 'transparent'};color:${primary ? '#000' : '#fff'};${primary ? '' : 'border:1px solid #727272;'}font:700 15px Inter;display:flex;align-items:center;justify-content:center;gap:8px`, parent, label);

  function buildScreen(scr) {
    el('div', `position:absolute;inset:0;background:${C.bg}`, scr);
    el('div', 'position:absolute;left:28px;top:15px;font:600 15px Inter;color:#fff;letter-spacing:-.01em', scr, '9:41');
    el('div', 'position:absolute;right:24px;top:17px;display:flex;gap:6px;align-items:center', scr,
      '<div style="display:flex;gap:2px;align-items:flex-end;height:11px">' + [4, 6, 8, 11].map((h) => `<div style="width:3px;height:${h}px;background:#fff;border-radius:1px"></div>`).join('') + '</div>' +
      '<div style="width:22px;height:11px;border:1.5px solid rgba(255,255,255,.5);border-radius:3px;padding:1px;box-sizing:border-box"><div style="width:75%;height:100%;background:#fff;border-radius:1px"></div></div>');
    // ---- Add sound view (app.js renderAdd) ----
    S.addScroll = el('div', 'position:absolute;left:0;top:0;width:390px;height:1000px', scr);
    el('div', 'position:absolute;left:16px;top:62px;font:800 24px Inter;letter-spacing:-.3px;color:#fff', S.addScroll, 'Add sound');
    el('div', `position:absolute;left:16px;right:16px;top:111px;font:400 15px/1.5 Inter;color:${C.muted}`, S.addScroll, 'Copy the link of a TikTok video (Share → Copy link) and paste it here.');
    S.input = el('div', `position:absolute;left:16px;width:358px;top:170px;height:48px;border-radius:6px;border:1px solid #7a7a7a;background:${C.bg3};box-sizing:border-box;overflow:hidden`, S.addScroll);
    S.inTxt = el('div', `position:absolute;left:14px;right:52px;top:0;font:400 16px/46px Inter;color:${C.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`, S.input, 'https://www.tiktok.com/@user/video/…');
    S.pasteBtn = el('div', 'position:absolute;right:2px;top:1px;width:44px;height:44px;display:grid;place-items:center;border-radius:50%', S.input, K.svg('paste', 24, '#fff'));
    S.findBtn = btn(S.addScroll, 16, 230, 358, 'Find sound');
    // preview card (app.js lookupAndPreview)
    S.prev = el('div', `position:absolute;left:16px;width:358px;top:298px;height:592px;border-radius:12px;background:${C.bg2};transform-origin:179px 0`, S.addScroll);
    S.pcover = el('div', `position:absolute;left:79px;top:16px;width:200px;height:200px;border-radius:6px;background:${K.NIGHT};box-shadow:0 8px 24px rgba(0,0,0,.4)`, S.prev);
    S.playBtn = el('div', `position:absolute;left:251px;top:172px;width:56px;height:56px;border-radius:50%;background:${C.green};display:grid;place-items:center;box-shadow:0 4px 16px rgba(0,0,0,.5)`, S.prev);
    S.playIco = el('div', '', S.playBtn, K.svg('play', 28, '#000')); S.pauseIco = el('div', 'display:none', S.playBtn, K.svg('pause', 28, '#000'));
    const lbl = (y, s) => el('div', `position:absolute;left:16px;top:${y}px;font:700 12px Inter;letter-spacing:.6px;color:${C.muted}`, S.prev, s);
    const inp = (y, s) => el('div', `position:absolute;left:16px;right:16px;top:${y}px;height:48px;border-radius:6px;border:1px solid #7a7a7a;background:${C.bg3};box-sizing:border-box;padding:0 14px;font:400 16px/46px Inter;color:#fff`, S.prev, s);
    lbl(240, 'TITLE'); inp(260, 'original sound'); lbl(324, 'ARTIST'); inp(344, HANDLE); lbl(408, 'ADD TO PLAYLISTS');
    const chip = (x, y, s) => el('div', `position:absolute;left:${x}px;top:${y}px;height:40px;padding:0 14px;border-radius:999px;background:${C.bg3};font:600 14px Inter;color:#fff;display:flex;align-items:center;box-sizing:border-box;border:1px solid transparent;white-space:nowrap`, S.prev, s);
    chip(16, 428, 'Gym'); chip(80, 428, 'Late night'); S.edits = chip(180, 428, 'Edits');
    el('div', `position:absolute;left:16px;top:476px;height:40px;padding:0 14px 0 10px;border-radius:999px;background:${C.bg3};font:600 14px Inter;color:#fff;display:flex;align-items:center;gap:6px`, S.prev, K.svg('plus', 18, '#fff') + 'New playlist');
    S.saveBtn = btn(S.prev, 16, 528, 326, 'Save to library');
    // "✓ saved" panel that replaces the card after saving (app.js save → result.innerHTML = .saved)
    S.saved = el('div', 'position:absolute;left:16px;width:358px;top:298px;height:240px', S.addScroll);
    el('div', `position:absolute;left:143px;top:28px;width:72px;height:72px;border-radius:50%;background:${C.green};display:grid;place-items:center;font:800 34px Inter;color:#000`, S.saved, '✓');
    el('div', 'position:absolute;left:0;right:0;top:114px;text-align:center;font:400 15px Inter;color:#fff', S.saved, '<b>original sound</b> saved');
    btn(S.saved, 44, 168, 140, 'Add another', false); S.playNow = btn(S.saved, 194, 168, 120, 'Play now');
    // ---- mini player (global, above the tab bar) ----
    S.mini = el('div', 'position:absolute;left:8px;right:8px;top:708px;height:56px;border-radius:8px;background:#4A2348;overflow:hidden', scr);
    el('div', `position:absolute;left:8px;top:8px;width:40px;height:40px;border-radius:4px;background:${K.NIGHT}`, S.mini);
    el('div', 'position:absolute;left:58px;top:10px;font:700 14px Inter;color:#fff', S.mini, 'original sound');
    el('div', 'position:absolute;left:58px;top:29px;font:400 13px Inter;color:rgba(255,255,255,.72)', S.mini, HANDLE);
    el('div', 'position:absolute;right:56px;top:10px;width:36px;height:36px;display:grid;place-items:center', S.mini, K.svg('pause', 24, '#fff'));
    el('div', 'position:absolute;right:12px;top:10px;width:36px;height:36px;display:grid;place-items:center', S.mini, K.svg('next', 24, '#fff'));
    el('div', 'position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(255,255,255,.2)', S.mini);
    S.miniBar = el('div', 'position:absolute;left:0;bottom:0;height:2px;background:#fff', S.mini);
    // ---- tab bar ----
    el('div', 'position:absolute;left:0;right:0;top:756px;height:88px;background:linear-gradient(to top,#000 64px,#0000)', scr);
    const tab = (x, ico, label, act) => el('div', `position:absolute;left:${x - 50}px;top:786px;width:100px;display:flex;flex-direction:column;align-items:center;gap:4px;font:${act ? 700 : 400} 11px Inter;color:${act ? '#fff' : C.muted}`, scr, ico + `<span>${label}</span>`);
    tab(65, K.svg('lib', 24, 'currentColor'), 'Library');
    tab(195, `<div style="width:40px;height:24px;border-radius:8px;background:${K.BRAND};display:grid;place-items:center">${K.svg('plus', 22, '#fff')}</div>`, 'Add sound', true);
    tab(325, K.svg('search', 24, 'currentColor'), 'Search');
    // ---- toast (app.js toast, above the tab bar) ----
    S.toast = el('div', 'position:absolute;left:50%;top:654px;transform:translateX(-50%);background:#fff;color:#000;padding:10px 16px;border-radius:8px;font:600 14px Inter;box-shadow:0 6px 20px rgba(0,0,0,.4);white-space:nowrap', scr, 'Saved to Edits');
    // ---- full-screen player ----
    S.player = el('div', `position:absolute;left:0;top:0;width:390px;height:844px;background:${C.bg};overflow:hidden`, scr);
    el('div', `position:absolute;inset:-60px;background:${K.NIGHT};filter:blur(50px) saturate(1.4) brightness(.45);transform:scale(1.2)`, S.player);
    el('div', `position:absolute;inset:0;background:linear-gradient(to bottom,transparent,${C.bg} 85%)`, S.player);
    el('div', 'position:absolute;left:12px;top:52px;width:44px;height:44px;display:grid;place-items:center', S.player, K.svg('down', 28, '#fff'));
    el('div', 'position:absolute;left:60px;right:60px;top:66px;text-align:center;font:700 12px Inter;color:#fff', S.player, 'Playing from Just added');
    el('div', 'position:absolute;right:12px;top:52px;width:44px;height:44px;display:grid;place-items:center', S.player, K.svg('dots', 24, '#fff'));
    S.pc = el('div', `position:absolute;left:24px;top:124px;width:342px;height:342px;border-radius:8px;background:${K.NIGHT};box-shadow:0 16px 60px rgba(0,0,0,.6)`, S.player);
    el('div', 'position:absolute;left:24px;top:494px;font:800 22px Inter;color:#fff', S.player, 'original sound');
    el('div', `position:absolute;left:24px;top:524px;font:400 15px Inter;color:${C.muted}`, S.player, HANDLE);
    el('div', 'position:absolute;left:24px;right:24px;top:576px;height:4px;border-radius:2px;background:rgba(255,255,255,.27)', S.player);
    S.seek = el('div', 'position:absolute;left:24px;top:576px;height:4px;border-radius:2px;background:#fff', S.player);
    S.knob = el('div', 'position:absolute;top:571px;width:14px;height:14px;border-radius:50%;background:#fff;margin-left:-7px', S.player);
    S.tNow = el('div', `position:absolute;left:24px;top:590px;font:400 12px Inter;color:${C.muted};font-variant-numeric:tabular-nums`, S.player, '0:01');
    el('div', `position:absolute;right:24px;top:590px;font:400 12px Inter;color:${C.muted}`, S.player, '0:58');
    const ctl = (x, ico, s = 28) => el('div', `position:absolute;left:${x - 22}px;top:636px;width:44px;height:44px;display:grid;place-items:center`, S.player, K.svg(ico, s, '#fff'));
    ctl(46, 'shuffle'); ctl(118, 'prev', 32); ctl(272, 'next', 32); ctl(344, 'repeat');
    S.bigPlay = el('div', 'position:absolute;left:162px;top:625px;width:66px;height:66px;border-radius:50%;background:#fff;display:grid;place-items:center', S.player, K.svg('pause', 32, '#000'));
    el('div', `position:absolute;left:0;right:0;top:722px;text-align:center;font:400 13px Inter;color:${C.muted}`, S.player, 'Open original TikTok');
    // ---- finger ----
    S.tl = el('div', 'position:absolute;left:0;top:0;width:0;height:0;z-index:60', scr);
    S.ring = el('div', 'position:absolute;left:-28px;top:-28px;width:56px;height:56px;border-radius:50%;border:2.5px solid rgba(255,255,255,.9);box-sizing:border-box', S.tl);
    S.dot = el('div', 'position:absolute;left:-21px;top:-21px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.45);box-shadow:0 4px 18px rgba(0,0,0,.45)', S.tl);
  }

  FILM.scene({
    id: 's6', t0: T0, t1: T1,
    zoom: (lt) => 1,
    build(root) {
      S.mwrap = el('div', 'position:absolute;inset:0', root);              // screen-space wrapper: carries the caption-band falloff mask
      S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.mwrap);
      S.bloom = el('div', `position:absolute;left:${540 - 560}px;top:${IC.y - 560}px;width:1120px;height:1120px;border-radius:50%;` +
        `background:radial-gradient(circle, rgba(254,44,85,.55) 0, rgba(123,44,191,.45) 34%, rgba(37,244,238,.14) 56%, transparent 70%);filter:blur(30px)`, S.cam);
      // carried from s5: the wordmark, under the phone (the growing phone covers it as it sinks)
      S.word = el('div', 'position:absolute;left:0;right:0;top:1120px;text-align:center;font-size:210px;font-weight:800;color:#fff;letter-spacing:-.04em', S.cam, 'Tikify');
      S.word.className = 'disp';
      S.phone = el('div', 'position:absolute;left:0;top:0;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.08)', S.cam);
      S.body = el('div', 'position:absolute;inset:0;background:#08080A', S.phone);
      S.grad = el('div', `position:absolute;inset:0;background:${K.BRAND}`, S.phone);
      S.scrWrap = el('div', 'position:absolute;overflow:hidden', S.phone);
      S.scr = el('div', 'position:absolute;left:0;top:0;width:390px;height:844px;transform-origin:0 0', S.scrWrap);
      buildScreen(S.scr);
      S.img = K.icon(S.phone, IC.s, 'left:50%;top:50%;margin-left:' + (-IC.s / 2) + 'px;margin-top:' + (-IC.s / 2) + 'px');
      // captions: two lines, word by word; line 2 in the light brand gradient
      const grad = 'background:linear-gradient(100deg,#FF6B88,#C98BFF 55%,#66F4EF);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.06em';
      S.caps = CAPS.map((c) => {
        const d = el('div', 'position:absolute;left:40px;right:40px;top:168px;text-align:center;font-size:108px;color:#fff;line-height:1.02;white-space:nowrap', root);
        d.className = 'disp';
        const w1 = K.words(d, c.l1); el('br', '', d); const w2 = K.words(d, c.l2, grad);
        return { d, w: w1.concat(w2) };
      });
      S.pills = [['list', 'Playlists'], ['offline', 'Works offline'], ['heart', 'Free · no account']].map(([ico, s], i) => el('div',
        `position:absolute;left:50%;top:${236 + i * 156}px;height:132px;padding:0 56px 0 42px;border-radius:999px;background:rgba(32,30,38,.88);` +
        `border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:22px;font:700 64px Inter;letter-spacing:-.015em;color:#fff;white-space:nowrap;box-sizing:border-box`,
        root, `<div style="width:76px;height:76px;border-radius:22px;background:${K.BRAND};display:grid;place-items:center">${K.svg(ico, 42, '#fff')}</div>${s}`));
    },
    update(lt, t) {
      const cl = E.smooth(p(t, TM.close0, T1));
      // ---------- camera: keyed travel + kick punches; returns to identity for the close ----------
      const dy = kf(t, CAM.map(([a, d]) => [a, d, E.smooth])), cs = kf(t, CAM.map(([a, , s]) => [a, s, E.smooth]));
      let punch = 0; for (const k of KICKS) if (t >= k && t < 14.82) punch = Math.max(punch, Math.exp(-(t - k) * 10));
      const s = lerp(cs * (1 + .022 * punch), 1, cl), d = lerp(dy, 0, cl);
      S.cam.style.transform = `translate(540px,960px) scale(${s.toFixed(5)}) translate(-540px,${(d - 960).toFixed(2)}px)`;
      // when the camera travels down the screen, the phone fades out under the caption band (a soft falloff, not a plate)
      const mk = clamp(-d / 220);
      const ma = (1 - mk).toFixed(3);
      S.mwrap.style.webkitMaskImage = S.mwrap.style.maskImage = mk > .005 ? `linear-gradient(to bottom, rgba(0,0,0,${ma}) 0px, rgba(0,0,0,${ma}) 410px, #000 600px)` : 'none';
      // ---------- phone rect (world): icon → phone (size morph), phone → end icon ----------
      const m = E.smooth(p(t, T0, T0 + .5));
      let w = lerp(IC.s, PW, m), h = lerp(IC.s, PH, m), cy = lerp(IC.y, PCY, m), r = lerp(IC.s * .225, PR, m);
      w = lerp(w, END.s, cl); h = lerp(h, END.s, cl); cy = lerp(cy, END.y, cl); r = lerp(r, END.s * .225, cl);
      const ph = S.phone.style;
      ph.left = (PCX - w / 2) + 'px'; ph.top = (cy - h / 2) + 'px'; ph.width = w + 'px'; ph.height = h + 'px'; ph.borderRadius = r + 'px';
      S.grad.style.opacity = Math.max(1 - E.smooth(p(t, T0 + .05, T0 + .36)), E.smooth(p(t, TM.close0 + .06, T1 - .1)));
      // screen content is revealed by an iris from the icon's centre (and closes the same way): no dissolve
      const k = w / PW, bz = BZ * k, sw = w - 2 * bz, sh = h - 2 * bz;
      const icy = IC.y - (cy - h / 2) - bz;                               // iris centre (the icon's centre) inside the screen
      const irMax = Math.hypot(sw / 2, Math.max(icy, sh - icy)) + 4;      // reaches the farthest corner
      const ir = irMax * Math.min(E.smooth(p(t, T0 + .1, T0 + .46)), 1 - E.smooth(p(t, TM.close0, TM.close0 + .22)));
      S.scrWrap.style.cssText = `position:absolute;left:${bz}px;top:${bz}px;width:${sw}px;height:${sh}px;border-radius:${Math.max(0, r - bz)}px;overflow:hidden;` +
        (ir >= irMax - 1 ? '' : `clip-path:circle(${ir.toFixed(1)}px at 50% ${(icy / sh * 100).toFixed(2)}%)`);
      S.scr.style.transform = `scale(${SC * k})`;
      const io = 1 - clamp(p(t, T0 + .02, T0 + .2)), ic = E.smooth(p(t, T1 - .18, T1));
      S.img.style.opacity = Math.max(io, ic);
      S.img.style.transform = `scale(${(t < TM.close0 ? 1 + .5 * E.in(2)(p(t, T0, T0 + .2)) : END.s / IC.s).toFixed(4)})`;
      // bloom: carried from s5, fades as the icon opens; returns for the close
      const bo = (1 - E.smooth(p(t, T0, T0 + .4))) * .8, bc = E.smooth(p(t, TM.close0 + .1, T1)) * .92;
      S.bloom.style.opacity = Math.max(bo, bc).toFixed(3);
      S.bloom.style.top = (lerp(IC.y, END.y, cl) - 560) + 'px';
      S.bloom.style.transform = `scale(${lerp(1, 1040 / 1120, cl).toFixed(4)})`;
      // wordmark sinks under the growing phone (covered, not faded)
      const wq = E.in(3)(p(t, T0, T0 + .26));
      S.word.style.display = t < T0 + .3 ? 'block' : 'none';
      S.word.style.transform = `translateY(${420 * wq}px) scale(${1 - .3 * wq})`;
      // ---------- captions ----------
      CAPS.forEach((c, i) => {
        const o = S.caps[i], on = t >= c.a - .1 && t < c.b + .2;
        o.d.style.display = on ? 'block' : 'none'; if (!on) return;
        o.w.forEach((e, j) => K.wordIn(e, t, c.w[j] - .05, .4, 40, 14));
        const out = E.in(3)(p(t, c.b - .12, c.b + .04));
        o.d.style.transform = `translateY(${-170 * out}px)`; o.d.style.opacity = 1 - clamp((out - .4) / .6); o.d.style.filter = out > .02 ? `blur(${out * 14}px)` : 'none';
      });
      // ---------- the app ----------
      const pasted = FILM.TQ(t) >= TM.paste + .04;
      S.inTxt.textContent = pasted ? LINK : 'https://www.tiktok.com/@user/video/…';
      S.inTxt.style.color = pasted ? '#fff' : C.muted; S.input.style.borderColor = pasted ? '#fff' : '#7a7a7a';
      const press = (tp, dd = .22) => 1 - .05 * Math.sin(Math.PI * clamp(p(t, tp - .04, tp - .04 + dd)));
      S.pasteBtn.style.background = Math.abs(t - TM.paste) < .14 ? C.bg4 : 'transparent';
      S.findBtn.style.transform = `scale(${press(TM.find)})`;
      S.findBtn.textContent = t >= TM.find && t < TM.born ? 'Finding…' : 'Find sound';
      const isSaved = FILM.TQ(t) >= TM.saved;
      const b = p(t, TM.born, TM.born + .5), bq = E.soft(b);
      S.prev.style.display = t >= TM.born && !isSaved ? 'block' : 'none';
      S.prev.style.opacity = clamp(b * 5);
      S.prev.style.transform = `translateY(${(1 - bq) * -36}px) scale(${.92 + .08 * bq})`;
      S.prev.style.clipPath = `inset(0 0 ${(1 - E.out(3)(b)) * 100}% 0 round 12px)`;
      const playing = FILM.TQ(t) >= TM.play + .03;
      S.playIco.style.display = playing ? 'none' : 'block'; S.pauseIco.style.display = playing ? 'block' : 'none';
      const bp = Math.max(0, Math.cos((t - K.beatAt(0)) / K.BEAT * Math.PI * 2)) ** 6;
      S.playBtn.style.transform = `scale(${press(TM.play) * (playing ? 1 + .06 * bp : 1)})`;
      S.pcover.style.transform = `scale(${playing ? 1 + .018 * bp : 1})`;
      const ch = FILM.TQ(t) >= TM.chip + .03;
      S.edits.style.background = ch ? '#1ED76026' : C.bg3; S.edits.style.borderColor = ch ? C.green : 'transparent'; S.edits.style.color = ch ? C.green : '#fff';
      S.saveBtn.style.transform = `scale(${press(TM.save)})`;
      // the saved panel replaces the card (page height shrinks → the scroll comes back up)
      S.saved.style.display = isSaved ? 'block' : 'none';
      const sv = E.soft(p(t, TM.saved, TM.saved + .4));
      S.saved.style.transform = `translateY(${(1 - sv) * 24}px)`; S.saved.style.opacity = clamp(p(t, TM.saved, TM.saved + .12));
      S.playNow.style.transform = `scale(${press(TM.playNow)})`;
      const scr = 236 * E.smooth(p(t, TM.scroll0, TM.scroll1)) * (1 - E.smooth(p(t, TM.saved, TM.saved + .3)));
      S.addScroll.style.transform = `translateY(${-scr}px)`;
      const tq = p(t, TM.toast, TM.toast + .25), tx = p(t, 12.9, 13.05);
      S.toast.style.display = t >= TM.toast && t < 13.05 ? 'block' : 'none';
      S.toast.style.opacity = clamp(tq * 2) * (1 - clamp(tx));
      S.toast.style.transform = `translateX(-50%) translateY(${(1 - E.soft(tq)) * 14}px)`;
      // mini player rises in once "Play now" starts the sound
      const mq = E.soft(p(t, TM.mini, TM.mini + .4));
      S.mini.style.display = t >= TM.mini ? 'block' : 'none';
      S.mini.style.transform = `translateY(${(1 - mq) * 70}px) scale(${press(TM.miniTap)})`; S.mini.style.opacity = clamp(p(t, TM.mini, TM.mini + .12));
      S.miniBar.style.width = (2 + 3 * clamp(p(t, TM.mini, TM.player1))) + '%';
      // full-screen player slides up from the mini player
      const pl = E.smooth(p(t, TM.player0, TM.player1));
      S.player.style.display = pl > 0 ? 'block' : 'none';
      S.player.style.transform = `translateY(${844 * (1 - pl)}px)`;
      const el2 = Math.max(0, t - TM.mini);
      const prog = clamp(el2 / 58);
      S.seek.style.width = (342 * prog) + 'px'; S.knob.style.left = (24 + 342 * prog) + 'px';
      S.tNow.textContent = '0:' + String(Math.floor(FILM.TQ(el2))).padStart(2, '0');
      const beatPulse = Math.max(0, Math.cos((t - K.beatAt(0)) / K.BEAT * Math.PI * 2)) ** 4;
      S.bigPlay.style.transform = `scale(${1 + .09 * beatPulse})`;
      S.pc.style.transform = `scale(${1 + .015 * beatPulse})`;
      // finger (logical px, viewport coords)
      const path = [[9.80, 330, 980], [9.98, 352, 194], [10.24, 196, 256], [10.72, 295, 498], [10.96, 295, 498], [11.22, 228, 510], [11.55, 195, 614],
        [11.95, 230, 560], [12.10, 270, 488], [12.40, 270, 488], [13.10, 195, 736], [13.30, 195, 736], [13.62, 330, 1000]];
      const vis = t >= 9.80 && t <= 13.62;
      S.tl.style.display = vis ? 'block' : 'none';
      if (vis) {
        const fx = kf(t, path.map(([a, x]) => [a, x, E.smooth])), fy = kf(t, path.map(([a, , y]) => [a, y, E.smooth]));
        S.tl.style.transform = `translate(${fx}px,${fy}px)`;
        let sq = 1, rq = 0;
        for (const tp of [TM.paste, TM.find, TM.play, TM.chip, TM.save, TM.playNow, TM.miniTap]) {
          const dd = t - tp;
          if (dd > -.1 && dd < .2) sq = Math.min(sq, 1 - .2 * Math.sin(Math.PI * clamp((dd + .1) / .3)));
          if (dd > 0 && dd < .4) rq = Math.max(rq, dd / .4);
        }
        const fo = Math.min(E.soft(p(t, 9.80, 10.0)), 1 - E.in(2)(p(t, 13.42, 13.62)));
        S.dot.style.opacity = fo; S.dot.style.transform = `scale(${sq})`;
        S.ring.style.opacity = rq > 0 ? (1 - rq) * fo : 0; S.ring.style.transform = `scale(${.7 + rq * 1.3})`;
      }
      // ---------- feature pills land on the track's hits, leave upward before the close ----------
      S.pills.forEach((e, i) => {
        const a = PILLS[i], on = t >= a - .05 && t < TM.close0 + .3;
        e.style.display = on ? 'flex' : 'none'; if (!on) return;
        const q = E.back(1.1)(p(t, a, a + .34)), o = clamp(p(t, a, a + .1));
        const out = E.in(2)(p(t, TM.close0 - .1 + i * .04, TM.close0 + .1 + i * .04));
        e.style.opacity = o * (1 - out);
        e.style.transform = `translateX(-50%) translateY(${(1 - q) * 50 - 180 * out}px) scale(${.9 + .1 * q})`;
        e.style.filter = out > .02 ? `blur(${out * 12}px)` : 'none';
      });
    },
  });
  [[TM.paste, 'tap'], [TM.find, 'tap'], [TM.play, 'tap'], [TM.chip, 'tap'], [TM.save, 'tap'], [TM.toast, 'pop'], [TM.playNow, 'tap'], [TM.miniTap, 'tap'],
    ...PILLS.map((t) => [t, 'pop']), [TM.close0, 'whoosh']].forEach(([t, k]) => FILM.cue(k, t, k));
  K.HANDLE = HANDLE; K.TM6 = TM; K.PILLS = PILLS;
})();
