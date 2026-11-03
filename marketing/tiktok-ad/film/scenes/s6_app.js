/* s6 · 9.53–16.94 · the app, one persistent phone. The icon opens up into the phone (UI morph by size); inside it the real
   Tikify flow, rebuilt from app.js/styles.css: Add sound → paste a TikTok link → Find sound → the preview card is born
   from the button → play the preview → pick "Edits" → Save to library → toast → Library → mini player → full-screen
   player. Then the phone steps back while three true feature pills land on beats, and closes back into the icon (carried
   into the end card). Captions sit in the top band, clear of TikTok's overlays. */
(function () {
  const { E, p, el, clamp, lerp, kf, about } = FILM;
  const T = K.T, T0 = 9.53, T1 = K.bar(4);                          // 16.94
  const C = K.C;
  const PW = 600, PH = 1252, PR = 70, PCX = 540, PCY = 1046, BZ = 20;  // phone rect (screen px)
  const SC = (PW - 2 * BZ) / 390;                                      // logical (390×844) → screen
  const IC = K.ICONPOS, END = { x: 540, y: 760, s: 300 };
  K.END_ICON = END;
  const LINK = 'https://www.tiktok.com/@nightdrive.edits/video/7438…';
  const TM = {                                                          // interaction times
    morph0: T0, morph1: T0 + .52,
    cap1: 9.72, paste: 10.02, find: 10.31, born: 10.47, cap2: K.bar(1), play: 10.84,
    scroll0: 10.98, scroll1: 11.36, chip: 11.30, save: 11.66, toast: 11.76, tab: 12.40, cap3: K.bar(2),
    mini: 13.42, player0: 13.46, player1: 13.82, feat: K.bar(3), close0: 16.40,
  };
  let S = {};

  // ---------- builders for the app's screens (logical px) ----------
  const row = (parent, y, cover, title, sub, h = 56) => {
    const r = el('div', `position:absolute;left:16px;right:16px;top:${y}px;height:${h}px`, parent);
    const c = el('div', `position:absolute;left:0;top:0;width:${h}px;height:${h}px;border-radius:4px;background:${cover};display:grid;place-items:center;overflow:hidden`, r);
    el('div', `position:absolute;left:${h + 12}px;top:${h / 2 - 20}px;font:600 15px Inter;color:#fff`, r, title);
    el('div', `position:absolute;left:${h + 12}px;top:${h / 2 + 2}px;font:400 13px Inter;color:${C.muted}`, r, sub);
    return { r, c };
  };
  const grid4 = (seed) => `<div style="display:grid;grid-template-columns:1fr 1fr;width:100%;height:100%">${[0, 1, 2, 3].map((i) => `<div style="background:${K.cover(seed + i)}"></div>`).join('')}</div>`;
  const btn = (parent, x, y, w, label, primary = true) => el('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:48px;border-radius:999px;` +
    `background:${primary ? '#fff' : 'transparent'};color:${primary ? '#000' : '#fff'};font:700 15px Inter;display:flex;align-items:center;justify-content:center;gap:8px`, parent, label);

  function buildScreen(scr) {
    el('div', `position:absolute;inset:0;background:${C.bg}`, scr);
    // status bar
    el('div', 'position:absolute;left:28px;top:15px;font:600 15px Inter;color:#fff;letter-spacing:-.01em', scr, '9:41');
    el('div', 'position:absolute;right:24px;top:17px;display:flex;gap:6px;align-items:center', scr,
      '<div style="display:flex;gap:2px;align-items:flex-end;height:11px">' + [4, 6, 8, 11].map((h) => `<div style="width:3px;height:${h}px;background:#fff;border-radius:1px"></div>`).join('') + '</div>' +
      '<div style="width:22px;height:11px;border:1.5px solid rgba(255,255,255,.5);border-radius:3px;padding:1px;box-sizing:border-box"><div style="width:75%;height:100%;background:#fff;border-radius:1px"></div></div>');
    // ---- Add sound view ----
    S.add = el('div', 'position:absolute;left:0;top:0;width:390px;height:844px', scr);
    S.addScroll = el('div', 'position:absolute;left:0;top:0;width:390px;height:1000px', S.add);
    el('div', 'position:absolute;left:16px;top:62px;font:800 24px Inter;letter-spacing:-.3px;color:#fff', S.addScroll, 'Add sound');
    el('div', `position:absolute;left:16px;right:16px;top:111px;font:400 15px/1.5 Inter;color:${C.muted}`, S.addScroll, 'Copy the link of a TikTok video (Share → Copy link) and paste it here.');
    S.input = el('div', `position:absolute;left:16px;width:358px;top:170px;height:48px;border-radius:6px;border:1px solid #7a7a7a;background:${C.bg3};box-sizing:border-box;overflow:hidden`, S.addScroll);
    S.inTxt = el('div', `position:absolute;left:14px;right:52px;top:0;line-height:46px;font:400 16px Inter;color:${C.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`, S.input, 'https://www.tiktok.com/@user/video/…');
    S.pasteBtn = el('div', 'position:absolute;right:2px;top:1px;width:44px;height:44px;display:grid;place-items:center;border-radius:50%', S.input, K.svg('paste', 24, '#fff'));
    S.findBtn = btn(S.addScroll, 16, 230, 358, 'Find sound');
    // preview card
    S.prev = el('div', `position:absolute;left:16px;width:358px;top:298px;height:592px;border-radius:12px;background:${C.bg2};transform-origin:179px 0`, S.addScroll);
    S.pcover = el('div', `position:absolute;left:79px;top:16px;width:200px;height:200px;border-radius:6px;background:${K.NIGHT};box-shadow:0 8px 24px rgba(0,0,0,.4)`, S.prev);
    S.playBtn = el('div', `position:absolute;left:251px;top:172px;width:56px;height:56px;border-radius:50%;background:${C.green};display:grid;place-items:center;box-shadow:0 4px 16px rgba(0,0,0,.5)`, S.prev);
    S.playIco = el('div', '', S.playBtn, K.svg('play', 28, '#000')); S.pauseIco = el('div', 'display:none', S.playBtn, K.svg('pause', 28, '#000'));
    const lbl = (y, s) => el('div', `position:absolute;left:16px;top:${y}px;font:700 12px Inter;letter-spacing:.6px;color:${C.muted}`, S.prev, s);
    const inp = (y, s) => el('div', `position:absolute;left:16px;right:16px;top:${y}px;height:48px;border-radius:6px;border:1px solid #7a7a7a;background:${C.bg3};box-sizing:border-box;padding:0 14px;line-height:46px;font:400 16px Inter;color:#fff`, S.prev, s);
    lbl(240, 'TITLE'); inp(260, 'original sound'); lbl(324, 'ARTIST'); inp(344, 'nightdrive.edits'); lbl(408, 'ADD TO PLAYLISTS');
    const chip = (x, y, s, w) => el('div', `position:absolute;left:${x}px;top:${y}px;height:40px;padding:0 14px;border-radius:999px;background:${C.bg3};font:600 14px Inter;color:#fff;display:flex;align-items:center;box-sizing:border-box;border:1px solid transparent;white-space:nowrap`, S.prev, s);
    chip(16, 428, 'Gym'); chip(80, 428, 'Late night'); S.edits = chip(180, 428, 'Edits');
    el('div', `position:absolute;left:16px;top:476px;height:40px;padding:0 14px 0 10px;border-radius:999px;background:${C.bg3};font:600 14px Inter;color:#fff;display:flex;align-items:center;gap:6px`, S.prev, K.svg('plus', 18, '#fff') + 'New playlist');
    S.saveBtn = btn(S.prev, 16, 528, 326, 'Save to library');
    // ---- Library view ----
    S.lib = el('div', 'position:absolute;left:0;top:0;width:390px;height:844px', scr);
    el('div', 'position:absolute;left:16px;top:62px;font:800 24px Inter;letter-spacing:-.3px;color:#fff', S.lib, 'Your Library');
    el('div', 'position:absolute;right:12px;top:58px;width:44px;height:44px;display:grid;place-items:center', S.lib, K.svg('dots', 24, '#fff'));
    el('div', `position:absolute;left:16px;top:116px;height:40px;padding:0 14px 0 10px;border-radius:999px;background:${C.bg3};font:600 14px Inter;color:#fff;display:flex;align-items:center;gap:6px`, S.lib, K.svg('plus', 18, '#fff') + 'New playlist');
    const r1 = row(S.lib, 172, K.BRAND, 'All sounds', 'Playlist · 9 sounds'); r1.c.innerHTML = K.svg('heart', 26, '#fff');
    const r2 = row(S.lib, 244, '#333', 'Edits', 'Playlist · 6 sounds'); r2.c.innerHTML = grid4(11);
    S.editsRow = r2.r;
    const r3 = row(S.lib, 316, '#333', 'Gym', 'Playlist · 5 sounds'); r3.c.innerHTML = grid4(2);
    const r4 = row(S.lib, 388, '#333', 'Late night', 'Playlist · 4 sounds'); r4.c.innerHTML = grid4(5);
    const r5 = row(S.lib, 460, '#333', 'Road trip', 'Playlist · 4 sounds'); r5.c.innerHTML = grid4(17);
    // mini player
    S.mini = el('div', 'position:absolute;left:8px;right:8px;top:708px;height:56px;border-radius:8px;background:#4A2348;overflow:hidden', S.lib);
    el('div', `position:absolute;left:8px;top:8px;width:40px;height:40px;border-radius:4px;background:${K.NIGHT}`, S.mini);
    el('div', 'position:absolute;left:58px;top:10px;font:700 14px Inter;color:#fff', S.mini, 'original sound');
    el('div', 'position:absolute;left:58px;top:29px;font:400 13px Inter;color:rgba(255,255,255,.72)', S.mini, 'nightdrive.edits');
    el('div', 'position:absolute;right:56px;top:10px;width:36px;height:36px;display:grid;place-items:center', S.mini, K.svg('pause', 24, '#fff'));
    el('div', 'position:absolute;right:12px;top:10px;width:36px;height:36px;display:grid;place-items:center', S.mini, K.svg('next', 24, '#fff'));
    el('div', 'position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(255,255,255,.2)', S.mini);
    S.miniBar = el('div', 'position:absolute;left:0;bottom:0;height:2px;background:#fff', S.mini);
    // ---- tab bar ----
    el('div', 'position:absolute;left:0;right:0;top:756px;height:88px;background:linear-gradient(to top,#000 64px,#0000)', scr);
    const tab = (x, ico, label) => {
      const b = el('div', `position:absolute;left:${x - 50}px;top:786px;width:100px;display:flex;flex-direction:column;align-items:center;gap:4px;font:400 11px Inter;color:${C.muted}`, scr, ico + `<span>${label}</span>`);
      return b;
    };
    S.tLib = tab(65, K.svg('lib', 24, 'currentColor'), 'Library');
    S.tAdd = tab(195, `<div style="width:40px;height:24px;border-radius:8px;background:${K.BRAND};display:grid;place-items:center">${K.svg('plus', 22, '#fff')}</div>`, 'Add sound');
    S.tSearch = tab(325, K.svg('search', 24, 'currentColor'), 'Search');
    // ---- toast ----
    S.toast = el('div', 'position:absolute;left:50%;top:722px;transform:translateX(-50%);background:#fff;color:#000;padding:10px 16px;border-radius:8px;font:600 14px Inter;box-shadow:0 6px 20px rgba(0,0,0,.4);white-space:nowrap', scr, 'Saved to Edits');
    // ---- full-screen player ----
    S.player = el('div', `position:absolute;left:0;top:0;width:390px;height:844px;background:${C.bg};overflow:hidden`, scr);
    el('div', `position:absolute;inset:-60px;background:${K.NIGHT};filter:blur(50px) saturate(1.4) brightness(.45);transform:scale(1.2)`, S.player);
    el('div', `position:absolute;inset:0;background:linear-gradient(to bottom,transparent,${C.bg} 85%)`, S.player);
    el('div', 'position:absolute;left:12px;top:52px;width:44px;height:44px;display:grid;place-items:center', S.player, K.svg('down', 28, '#fff'));
    el('div', 'position:absolute;left:60px;right:60px;top:66px;text-align:center;font:700 12px Inter;color:#fff', S.player, 'Playing from Edits');
    el('div', 'position:absolute;right:12px;top:52px;width:44px;height:44px;display:grid;place-items:center', S.player, K.svg('dots', 24, '#fff'));
    S.pc = el('div', `position:absolute;left:24px;top:124px;width:342px;height:342px;border-radius:8px;background:${K.NIGHT};box-shadow:0 16px 60px rgba(0,0,0,.6)`, S.player);
    el('div', 'position:absolute;left:24px;top:494px;font:800 22px Inter;color:#fff', S.player, 'original sound');
    el('div', `position:absolute;left:24px;top:524px;font:400 15px Inter;color:${C.muted}`, S.player, 'nightdrive.edits');
    el('div', 'position:absolute;left:24px;right:24px;top:576px;height:4px;border-radius:2px;background:rgba(255,255,255,.27)', S.player);
    S.seek = el('div', 'position:absolute;left:24px;top:576px;height:4px;border-radius:2px;background:#fff', S.player);
    S.knob = el('div', 'position:absolute;top:571px;width:14px;height:14px;border-radius:50%;background:#fff;margin-left:-7px', S.player);
    S.tNow = el('div', `position:absolute;left:24px;top:590px;font:400 12px Inter;color:${C.muted};font-variant-numeric:tabular-nums`, S.player, '0:31');
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
      S.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      S.phone = el('div', `position:absolute;left:0;top:0;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.08)`, S.cam);
      S.body = el('div', 'position:absolute;inset:0;background:#08080A', S.phone);
      S.grad = el('div', `position:absolute;inset:0;background:${K.BRAND}`, S.phone);
      S.scrWrap = el('div', 'position:absolute;overflow:hidden', S.phone);
      S.scr = el('div', 'position:absolute;left:0;top:0;width:390px;height:844px;transform-origin:0 0', S.scrWrap);
      buildScreen(S.scr);
      S.bloom = el('div', `position:absolute;left:${540 - 560}px;top:${IC.y - 560}px;width:1120px;height:1120px;border-radius:50%;` +
        `background:radial-gradient(circle, rgba(254,44,85,.55) 0, rgba(123,44,191,.45) 34%, rgba(37,244,238,.14) 56%, transparent 70%);filter:blur(30px)`, S.cam);
      S.cam.insertBefore(S.bloom, S.phone);
      S.img = K.icon(S.phone, IC.s, 'left:50%;top:50%;margin-left:' + (-IC.s / 2) + 'px;margin-top:' + (-IC.s / 2) + 'px');
      // carried from s5: wordmark (exits up) and the bloom
      S.word = el('div', 'position:absolute;left:0;right:0;top:1120px;text-align:center;font-size:210px;font-weight:800;color:#fff;letter-spacing:-.04em', root, 'Tikify');
      S.word.className = 'disp';
      // captions (top band)
      S.caps = ['Paste a TikTok link', 'Get the exact sound', 'Play it like music'].map((s) => K.caption(root, 236, 80));
      S.caps.forEach((c, i) => { c.textContent = ['Paste a TikTok link', 'Get the exact sound', 'Play it like music'][i]; });
      // feature pills
      S.pills = [['list', 'Playlists'], ['offline', 'Works offline'], ['heart', 'Free · no account']].map(([ico, s], i) => el('div',
        `position:absolute;left:50%;top:${236 + i * 140}px;height:116px;padding:0 50px 0 38px;border-radius:999px;background:rgba(32,30,38,.86);` +
        `border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:20px;font:700 54px Inter;letter-spacing:-.01em;color:#fff;white-space:nowrap;box-sizing:border-box`,
        root, `<div style="width:64px;height:64px;border-radius:18px;background:${K.BRAND};display:grid;place-items:center">${K.svg(ico, 34, '#fff')}</div>${s}`));
    },
    update(lt, t) {
      // ---------- phone rect: icon → phone (morph by SIZE), feature step-back, phone → end icon ----------
      const m = E.smooth(p(t, TM.morph0, TM.morph1));
      const back = E.smooth(p(t, TM.feat - .05, TM.feat + .55));
      const cl = E.smooth(p(t, TM.close0, T1));
      let w = lerp(IC.s, PW, m), h = lerp(IC.s, PH, m), cx = PCX, cy = lerp(IC.y, PCY, m), r = lerp(IC.s * .225, PR, m);
      const fs = lerp(1, .74, back); cy = lerp(cy, 1262, back);
      w *= fs; h *= fs; r *= fs;
      w = lerp(w, END.s, cl); h = lerp(h, END.s, cl); cy = lerp(cy, END.y, cl); r = lerp(r, END.s * .225, cl);
      const bo = (1 - E.smooth(p(t, T0, T0 + .4))) * (.35 + .4 + .35 * Math.exp(-(T0 - T.b808) * 3.2)), bc = E.smooth(p(t, TM.close0 + .1, T1)) * .92;
      S.bloom.style.opacity = Math.max(bo, bc).toFixed(3);
      S.bloom.style.top = (lerp(IC.y, END.y, cl) - 560) + 'px';
      S.bloom.style.transform = `scale(${lerp(1, 1040 / 1120, cl).toFixed(4)})`;
      const ph = S.phone.style;
      ph.left = (cx - w / 2) + 'px'; ph.top = (cy - h / 2) + 'px'; ph.width = w + 'px'; ph.height = h + 'px'; ph.borderRadius = r + 'px';
      // inside: gradient → body (colour leads the size), screen content appears once the box is phone-shaped
      S.grad.style.opacity = Math.max(1 - E.smooth(p(t, T0 + .05, T0 + .36)), E.smooth(p(t, TM.close0 + .08, T1 - .12)));
      const sOn = clamp(p(t, T0 + .26, T0 + .5)) * (1 - clamp(p(t, TM.close0, TM.close0 + .16)));
      const k = w / PW, bz = BZ * k;
      S.scrWrap.style.cssText = `position:absolute;left:${bz}px;top:${bz}px;width:${w - 2 * bz}px;height:${h - 2 * bz}px;border-radius:${Math.max(0, r - bz)}px;overflow:hidden;opacity:${sOn}`;
      S.scr.style.transform = `translateY(${(1 - E.soft(p(t, T0 + .26, T0 + .7))) * 26}px) scale(${SC * k})`;
      // icon artwork: opens up (×1→×1.5) and dissolves as the box grows; comes back for the close
      const io = 1 - clamp(p(t, T0 + .02, T0 + .2)), ic = E.smooth(p(t, T1 - .2, T1));
      S.img.style.opacity = Math.max(io, ic);
      S.img.style.transform = `scale(${(t < TM.close0 ? 1 + .5 * E.in(2)(p(t, T0, T0 + .2)) : END.s / IC.s).toFixed(4)})`;
      // ---------- carried wordmark exits upward, captions push in/out ----------
      const wo = E.in(2)(p(t, T0, T0 + .22));
      S.word.style.display = wo < 1 ? 'block' : 'none';
      S.word.style.transform = `translateY(${-760 * wo}px) scale(${1 - .45 * wo})`; S.word.style.filter = wo > .02 ? `blur(${wo * 12}px)` : 'none';
      [[TM.cap1, TM.cap2], [TM.cap2, TM.cap3], [TM.cap3, TM.feat]].forEach(([a, b], i) => {
        const c = S.caps[i], on = t >= a - .1 && t < b + .2;
        c.style.display = on ? 'block' : 'none'; if (!on) return;
        K.wordIn(c, t, a - .06, .42, 40, 14);
        K.wordOut(c, t, b - .1, .14, -130);
      });
      // ---------- inside the app ----------
      // paste → link fills the field (frame-quantised state change)
      const pasted = FILM.TQ(t) >= TM.paste + .04;
      S.inTxt.textContent = pasted ? LINK : 'https://www.tiktok.com/@user/video/…';
      S.inTxt.style.color = pasted ? '#fff' : C.muted;
      S.input.style.borderColor = pasted ? '#fff' : '#7a7a7a';
      const press = (tp, d = .22) => 1 - .05 * Math.sin(Math.PI * clamp(p(t, tp - .04, tp - .04 + d)));
      S.pasteBtn.style.background = Math.abs(t - TM.paste) < .14 ? C.bg4 : 'transparent';
      S.findBtn.style.transform = `scale(${press(TM.find)})`;
      S.findBtn.textContent = t >= TM.find && t < TM.born ? 'Finding…' : 'Find sound';
      // preview card is born from the Find button (grows down from its top edge)
      const b = p(t, TM.born, TM.born + .5), bq = E.soft(b);
      S.prev.style.display = t >= TM.born ? 'block' : 'none';
      S.prev.style.opacity = clamp(b * 5);
      S.prev.style.transform = `translateY(${(1 - bq) * -36}px) scale(${.92 + .08 * bq})`;
      S.prev.style.clipPath = `inset(0 0 ${(1 - E.out(3)(b)) * 100}% 0 round 12px)`;
      const playing = FILM.TQ(t) >= TM.play + .03;
      S.playIco.style.display = playing ? 'none' : 'block'; S.pauseIco.style.display = playing ? 'block' : 'none';
      S.playBtn.style.transform = `scale(${press(TM.play) * (playing ? 1 + .035 * Math.max(0, Math.cos((t - K.beatAt(0)) / K.BEAT * Math.PI * 2)) ** 8 : 1)})`;
      const ch = FILM.TQ(t) >= TM.chip + .03;
      S.edits.style.background = ch ? '#1ED76026' : C.bg3; S.edits.style.borderColor = ch ? C.green : 'transparent'; S.edits.style.color = ch ? C.green : '#fff';
      S.saveBtn.style.transform = `scale(${press(TM.save)})`;
      // scroll follows the new content
      const sc = 236 * E.smooth(p(t, TM.scroll0, TM.scroll1));
      S.addScroll.style.transform = `translateY(${-sc}px)`;
      // toast
      const tq = p(t, TM.toast, TM.toast + .25), tx = p(t, TM.tab - .1, TM.tab + .05);
      S.toast.style.display = t >= TM.toast && t < TM.tab + .05 ? 'block' : 'none';
      S.toast.style.opacity = clamp(tq * 2) * (1 - clamp(tx));
      S.toast.style.transform = `translateX(-50%) translateY(${(1 - E.soft(tq)) * 14}px)`;
      // tab switch: Add → Library (push within the phone)
      const sw = E.smooth(p(t, TM.tab + .02, TM.tab + .3));
      S.add.style.transform = `translateX(${-390 * sw}px)`; S.add.style.display = sw < 1 ? 'block' : 'none';
      S.lib.style.transform = `translateX(${390 * (1 - sw)}px)`; S.lib.style.display = sw > 0 ? 'block' : 'none';
      const onLib = FILM.TQ(t) >= TM.tab + .02;
      [S.tLib, S.tAdd].forEach((e, i) => { const act = i === 0 ? onLib : !onLib; e.style.color = act ? '#fff' : C.muted; e.style.fontWeight = act ? 700 : 400; });
      S.editsRow.style.background = t > TM.tab + .3 && t < TM.mini ? `rgba(255,255,255,${.06 * (1 - p(t, TM.tab + .3, TM.mini))})` : 'transparent';
      S.miniBar.style.width = (38 + 6 * p(t, TM.tab, TM.player1)) + '%';
      S.mini.style.transform = `scale(${press(TM.mini)})`;
      // full-screen player slides up from the mini player
      const pl = E.smooth(p(t, TM.player0, TM.player1));
      S.player.style.display = pl > 0 ? 'block' : 'none';
      S.player.style.transform = `translateY(${844 * (1 - pl)}px)`;
      const prog = .53 + .05 * p(t, TM.player0, T1);
      S.seek.style.width = (342 * prog) + 'px'; S.knob.style.left = (24 + 342 * prog) + 'px';
      S.tNow.textContent = '0:' + String(31 + Math.floor(FILM.TQ(Math.max(0, t - TM.player0)))).padStart(2, '0');
      const beatPulse = Math.max(0, Math.cos((t - K.beatAt(0)) / K.BEAT * Math.PI * 2)) ** 10;
      S.bigPlay.style.transform = `scale(${1 + .05 * beatPulse})`;
      S.pc.style.transform = `scale(${1 + .012 * beatPulse})`;
      // finger: arcs between targets (logical coords, screen-space after the scroll)
      const path = [[9.78, 330, 960], [9.98, 352, 194], [10.24, 196, 256], [10.70, 279, 500], [10.96, 279, 500], [11.24, 242, 492], [11.56, 196, 590], [12.10, 196, 640], [12.34, 65, 800], [12.72, 120, 760], [13.36, 190, 736], [13.70, 300, 980]];
      const vis = t >= 9.78 && t <= 13.70;
      S.tl.style.display = vis ? 'block' : 'none';
      if (vis) {
        const fx = kf(t, path.map(([a, x]) => [a, x, E.smooth])), fy = kf(t, path.map(([a, , y]) => [a, y, E.smooth]));
        S.tl.style.transform = `translate(${fx}px,${fy}px)`;
        let sq = 1, rq = 0;
        for (const tp of [TM.paste, TM.find, TM.play, TM.chip, TM.save, TM.tab, TM.mini]) {
          const d = t - tp;
          if (d > -.1 && d < .2) sq = Math.min(sq, 1 - .2 * Math.sin(Math.PI * clamp((d + .1) / .3)));
          if (d > 0 && d < .4) rq = Math.max(rq, d / .4);
        }
        const fo = Math.min(E.soft(p(t, 9.78, 9.98)), 1 - E.in(2)(p(t, 13.5, 13.7)));
        S.dot.style.opacity = fo; S.dot.style.transform = `scale(${sq})`;
        S.ring.style.opacity = rq > 0 ? (1 - rq) * fo : 0; S.ring.style.transform = `scale(${.7 + rq * 1.3})`;
      }
      // ---------- camera: lean in on the card while it is worked, settle back for the library/player ----------
      const lean = E.smooth(p(t, 10.45, 10.95)) * (1 - E.smooth(p(t, 12.2, 12.75)));
      const drift = FILM.zoom(t, T0 + .5, TM.feat, 1, 1.035, E.glide);
      S.cam.style.transform = about(540, 1180, lerp((1 + .08 * lean) * drift, 1, cl));
      // ---------- feature pills land on beats, exit up before the close ----------
      S.pills.forEach((e, i) => {
        const a = TM.feat + i * K.BEAT, on = t >= a - .05 && t < TM.close0 + .3;
        e.style.display = on ? 'flex' : 'none'; if (!on) return;
        const q = E.back(1.1)(p(t, a, a + .4)), o = clamp(p(t, a, a + .12));
        const out = E.in(2)(p(t, TM.close0 - .02 + i * .04, TM.close0 + .2 + i * .04));
        e.style.opacity = o * (1 - out);
        e.style.transform = `translateX(-50%) translateY(${(1 - q) * 50 - 160 * out}px) scale(${.9 + .1 * q})`;
        e.style.filter = out > .02 ? `blur(${out * 12}px)` : 'none';
      });
    },
  });
  [[TM.paste, 'tap'], [TM.find, 'tap'], [TM.play, 'tap'], [TM.chip, 'tap'], [TM.save, 'tap'], [TM.toast, 'pop'], [TM.tab, 'tap'], [TM.mini, 'tap'],
    [TM.feat, 'pop'], [TM.feat + K.BEAT, 'pop'], [TM.feat + 2 * K.BEAT, 'pop'], [TM.close0, 'whoosh']].forEach(([t, k]) => FILM.cue(k, t, k));
})();
