/* s6 · b17 → b22 (9.623 → 12.453): the player. It grows out of the ▶ the cursor just let go of, on the re-drop, while
   the background floods violet from the same point. The cover pulses on the track's hits; time runs 1:1. Airplane mode
   drops in and switches on on b18.5; "No signal. Still playing." On b20 the phone locks: the player MORPHS (sizes, not a
   fade) into the lock-screen widget under a big clock, the airplane pill shrinks into the status bar. ⏭ on b21 rolls in
   the next sound. Post-roll: the lock screen pushes away while the end card takes the cover. */
(function () {
  const { E, p, el, lerp } = FILM;
  const C4 = T.b(17), C5 = T.b(20), C6 = T.b(22), T_AIR = T.b(18.5), T_SKIP = T.b(21);
  const HITS = [T.b(17), T.b(18), T.b(18.5), T.b(19), T.b(20)];
  const S = {};
  // rects: player (A) → lock widget (B)
  const COV = [[180, 250, 540], [470, 590, 236]];
  const TITLE = [[800, 300, 1], [746, 610, 52 / 88]], ART = [[804, 412, 1], [750, 674, 34 / 40]];
  const BAR = [[800, 532, 900], [750, 748, 680]];
  const CTRL = { prev: [[1030, 690], [900, 812]], play: [[1250, 690], [1100, 812]], next: [[1470, 690], [1300, 812]] };
  const CARD = [[150, 210, 1620, 640, 60], [430, 552, 1060, 334, 46]];
  T.COVER_AT_C6 = COV[1];                                    // the end card takes the cover from exactly here

  FILM.scene({
    id: 's6', t0: C4, t1: C6, post: .5,
    zoom: (lt) => { const t = C4 + lt; return lt < .7 ? .1 * Math.exp(Math.log(10) * E.out(3)(p(t, C4, C4 + .62))) : 1; },
    build(root) {
      S.dim = el('div', 'position:absolute;inset:0;background:#07030F;opacity:0', root);
      S.cam = el('div', 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0', root);
      S.grp = el('div', 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0', S.cam);
      S.card = el('div', 'position:absolute;background:rgba(255,255,255,.13);box-shadow:inset 0 0 0 2px rgba(255,255,255,.16)', S.grp);
      S.cov = el('div', 'position:absolute;left:0;top:0;overflow:hidden;transform-origin:0 0;box-shadow:0 40px 90px rgba(10,0,30,.5)', S.grp);
      S.covIn = el('div', 'position:absolute;left:0;top:0;width:100%;height:200%', S.cov);
      T.img(T.COV.night, 'width:100%;height:50%', S.covIn); T.img(T.COV.summer, 'width:100%;height:50%', S.covIn);
      S.ctx = el('div', 'position:absolute;left:800px;top:236px;font:700 30px/1 Inter;letter-spacing:.01em;color:rgba(255,255,255,.78);transform-origin:0 0', S.grp, 'Playing from Road trip');
      const roll = (css, a, b) => { const w = el('div', `position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;${css}`, S.grp); const i = el('div', '', w); el('div', '', i, a); el('div', '', i, b); return [w, i]; };
      [S.tw, S.ti] = roll('font:800 88px/104px "Inter Tight";letter-spacing:-.03em;color:#fff;height:104px;white-space:nowrap', 'night drive (slowed)', 'summer anthem');
      [S.aw, S.ai] = roll('font:500 40px/52px Inter;color:#D9CDEA;height:52px;white-space:nowrap', 'mira.wav', 'The Waves');
      S.bar = el('div', 'position:absolute;height:8px;border-radius:4px;background:rgba(255,255,255,.28)', S.grp);
      S.fill = el('div', 'position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:#fff', S.bar);
      S.knob = el('div', 'position:absolute;top:-9px;width:26px;height:26px;border-radius:13px;background:#fff;margin-left:-13px', S.bar);
      S.times = el('div', 'position:absolute;left:800px;top:560px;width:900px;display:flex;justify-content:space-between;font:500 28px/1 Inter;color:rgba(255,255,255,.7)', S.grp, '<span class="cu">0:21</span><span class="du">0:58</span>');
      S.cu = S.times.querySelector('.cu'); S.du = S.times.querySelector('.du');
      const ic = (name, size, css = '') => el('div', `position:absolute;left:0;top:0;width:0;height:0`, S.grp, `<div style="position:absolute;left:${-size / 2}px;top:${-size / 2}px;${css}">${T.svg(name, size)}</div>`);
      S.shuf = ic('shuffle', 58); S.rep = ic('repeat', 58); S.prev = ic('prev', 76); S.next = ic('next', 76);
      S.play = el('div', 'position:absolute;left:0;top:0;width:0;height:0', S.grp);
      S.pc = el('div', 'position:absolute;border-radius:50%;background:#fff;display:grid;place-items:center', S.play, T.svg('pause', 66, '#000'));
      S.ripple = el('div', 'position:absolute;left:-60px;top:-60px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.35);opacity:0', S.next);
      S.shuf.style.transform = 'translate(840px,690px)'; S.rep.style.transform = 'translate(1660px,690px)';
      // airplane mode pill (system UI, top right)
      S.air = el('div', 'position:absolute;left:1302px;top:60px;width:540px;height:110px;border-radius:55px;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 2px rgba(255,255,255,.18);transform-origin:500px 55px', S.cam);
      S.airIc = el('div', 'position:absolute;left:14px;top:14px;width:82px;height:82px;border-radius:41px;display:grid;place-items:center;background:rgba(255,255,255,.18)', S.air, T.svg('plane', 46));
      S.airTx = el('div', 'position:absolute;left:116px;top:34px;font:600 38px/1.1 Inter;color:#fff;white-space:nowrap', S.air, 'Airplane mode');
      S.tog = el('div', 'position:absolute;left:418px;top:27px;width:100px;height:56px;border-radius:28px;background:rgba(255,255,255,.25)', S.air);
      S.knb = el('div', 'position:absolute;left:4px;top:4px;width:48px;height:48px;border-radius:24px;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.3)', S.tog);
      // captions
      S.cap1 = el('div', 'position:absolute;left:800px;top:808px;font:800 78px/1.1 "Inter Tight";letter-spacing:-.03em;color:#fff;white-space:nowrap', S.cam);
      S.g1 = FILM.glyphs(S.cap1, 'No signal. '); S.g1b = FILM.glyphs(el('span', 'color:#25F4EE', S.cap1), 'Still playing.');
      S.cap2 = el('div', 'position:absolute;left:0;width:1920px;top:930px;text-align:center;font:800 70px/1.1 "Inter Tight";letter-spacing:-.03em;color:#fff;white-space:nowrap', S.cam);
      S.g2 = FILM.glyphs(S.cap2, 'Screen locked? '); S.g2b = FILM.glyphs(el('span', 'color:#FF5C8A', S.cap2), 'It keeps going.');
      // lock screen
      S.lock = el('div', 'position:absolute;left:0;top:0;width:1920px', S.cam);
      S.lki = el('div', 'position:absolute;left:938px;top:52px', S.lock, T.svg('lock', 44));
      S.date = el('div', 'position:absolute;left:0;width:1920px;top:128px;text-align:center;font:600 42px/1 Inter;color:rgba(255,255,255,.85)', S.lock, 'Friday, 30 October');
      S.clock = el('div', 'position:absolute;left:0;width:1920px;top:178px;text-align:center;font:700 300px/1 "Inter Tight";letter-spacing:-.02em;color:#fff', S.lock, '23:47');
      S.status = el('div', 'position:absolute;left:1776px;top:44px;opacity:0', S.cam, T.svg('plane', 40));
      FILM.cue('air', T_AIR, 'tick'); FILM.cue('lock', C5, 'thunk'); FILM.cue('skip', T_SKIP, 'click'); FILM.cue('roll', T_SKIP + .04, 'whoosh');
      HITS.forEach((h) => FILM.cue('pulse', h, 'none'));
    },
    update(lt, t) {
      // grow out of the button on the re-drop (speed max at the cut), then an always-drifting push; neutral again at the lock
      const PS = (() => { const c = T.S5cam(C4); return [c.tx + c.s * T.S5PLAY[0], c.ty + c.s * T.S5PLAY[1]]; })();
      const g = .1 * Math.exp(Math.log(10) * E.out(3)(p(t, C4, C4 + .62)));
      S.grp.style.transform = `translate(${PS[0]}px,${PS[1]}px) scale(${g}) translate(${-PS[0]}px,${-PS[1]}px)`;
      const push = .05 * E.glide(p(t, C4 + .5, C5)) * (1 - E.smooth(p(t, C5, C5 + .5)));
      const out = E.in(2)(p(t, C6, C6 + .5));
      S.cam.style.transform = `translate(0px,${300 * out}px) translate(1110px,520px) scale(${1 + push}) translate(-1110px,-520px)`;
      S.cam.style.opacity = 1 - p(t, C6 + .2, C6 + .5);
      // the morph player → widget (one curve for every rect)
      const m = E.smooth(p(t, C5 - .02, C5 + .46));
      const R = (a, b) => a.map((v, i) => lerp(v, b[i], m));
      const pulse = 1 + .022 * HITS.reduce((a, h) => Math.max(a, T.bump(t, h - .02, .26)), 0) * (1 - m);
      const [cx, cy, cs] = R(COV[0], COV[1]);
      S.cov.style.width = cs + 'px'; S.cov.style.height = cs + 'px'; S.cov.style.borderRadius = lerp(18, 18, m) + 'px';
      S.cov.style.transform = `translate(${cx + cs / 2}px,${cy + cs / 2}px) scale(${pulse}) translate(${-cs / 2}px,${-cs / 2}px)`;
      S.cov.style.visibility = t >= C6 ? 'hidden' : 'visible';
      const [kx, ky, kw, kh, kr] = R(CARD[0], CARD[1]);
      Object.assign(S.card.style, { left: kx + 'px', top: ky + 'px', width: kw + 'px', height: kh + 'px', borderRadius: kr + 'px', opacity: m });
      const tt = R(TITLE[0], TITLE[1]), aa = R(ART[0], ART[1]);
      S.tw.style.transform = `translate(${tt[0]}px,${tt[1]}px) scale(${tt[2]})`; S.aw.style.transform = `translate(${aa[0]}px,${aa[1]}px) scale(${aa[2]})`;
      S.ctx.style.opacity = 1 - p(t, C5, C5 + .25); S.ctx.style.transform = `translateY(${-30 * m}px)`;
      const [bx, by, bw] = R(BAR[0], BAR[1]);
      Object.assign(S.bar.style, { left: bx + 'px', top: by + 'px', width: bw + 'px', height: lerp(8, 6, m) + 'px' });
      S.times.style.opacity = 1 - p(t, C5, C5 + .22);
      // time runs 1:1; ⏭ resets it for the next sound
      const sk = t >= FILM.TQ(T_SKIP + .06);
      const sec = sk ? (t - T_SKIP) : 21 + (t - C4), dur = sk ? 47 : 58;
      const s0 = Math.max(0, Math.floor(FILM.TQ(t) - (sk ? T_SKIP : C4 - 21)));
      S.cu.textContent = `0:${String(s0).padStart(2, '0')}`;
      S.fill.style.width = (100 * sec / dur) + '%'; S.knob.style.left = (100 * sec / dur) + '%';
      S.knob.style.transform = `scale(${1 - m})`;
      ['prev', 'play', 'next'].forEach((k) => { const [x, y] = R(CTRL[k][0], CTRL[k][1]); S[k].style.transform = `translate(${x}px,${y}px)`; });
      const pd = lerp(140, 104, m); Object.assign(S.pc.style, { width: pd + 'px', height: pd + 'px', left: -pd / 2 + 'px', top: -pd / 2 + 'px' });
      S.shuf.style.opacity = S.rep.style.opacity = 1 - p(t, C5, C5 + .2);
      S.shuf.style.transform = `translate(840px,690px) scale(${1 - .6 * m})`; S.rep.style.transform = `translate(1660px,690px) scale(${1 - .6 * m})`;
      // ⏭ on b21: ripple, then cover / title / artist roll to the next sound
      const rq = p(t, T_SKIP - .02, T_SKIP + .42); S.ripple.style.opacity = rq > 0 && rq < 1 ? .9 * (1 - rq) : 0; S.ripple.style.transform = `scale(${.3 + 1.2 * E.out(2)(rq)})`;
      const ro = E.smooth(p(t, T_SKIP + .04, T_SKIP + .4));
      S.covIn.style.transform = `translateY(${-50 * ro}%)`; S.ti.style.transform = `translateY(${-104 * ro}px)`; S.ai.style.transform = `translateY(${-52 * ro}px)`;
      // background: the lock dims the world (exposure ramp, not a plate)
      S.dim.style.opacity = .5 * E.smooth(p(t, C5, C5 + .5));
      // airplane pill: drops in, switches on on b18.5, then shrinks into the status bar when the phone locks
      const aq = p(t, T_AIR - .34, T_AIR - .02), ay = FILM.rise(t - (T_AIR - .34), 200, 640);
      const on = E.smooth(p(t, T_AIR, T_AIR + .2)), lq = E.smooth(p(t, C5, C5 + .5));
      S.air.style.opacity = Math.min(1, aq * 3) * (1 - lq);
      S.air.style.transform = `translate(${300 * lq}px,${-ay - 20 * lq}px) scale(${1 - .65 * lq})`;
      S.knb.style.transform = `translateX(${44 * on}px)`;
      S.tog.style.background = on > .5 ? '#FF9F0A' : 'rgba(255,255,255,.25)'; S.airIc.style.background = on > .5 ? '#FF9F0A' : 'rgba(255,255,255,.18)';
      S.status.style.opacity = p(t, C5 + .3, C5 + .55);
      // captions rise from their baselines; the first is pushed down by the lock
      FILM.riseGlyphs(S.g1.concat(S.g1b), t, T_AIR - .02, .016, .45);
      S.cap1.style.transform = `translateY(${380 * E.in(2)(p(t, C5 + .06, C5 + .32))}px)`;
      FILM.riseGlyphs(S.g2.concat(S.g2b), t, C5 + .3, .018, .48);
      // lock screen: icon + date + clock drop in (soft, no overshoot)
      const kq = E.soft(p(t, C5 + .16, C5 + .78));
      S.lock.style.transform = `translateY(${-420 * (1 - kq)}px)`; S.lock.style.opacity = Math.min(1, kq * 2);
      S.lki.style.transform = `scale(${E.back(1.2)(p(t, C5 + .1, C5 + .45))})`;
    },
  });
})();
