/* 5.95–17.7  ONE PHONE running Tikify's real UI (styles.css + DOM snapshots in Shadow DOM).
   Ref beats → Tikify: "Lyrics, synced word by word" (dive into the window) → "Paste a link. Get the sound." (dive into the link box)
   "The cover becomes the background." → the same line: Tikify's player really blurs the cover into its background
   "Paste a link. Bring your playlist." / "Make it yours." → "Make playlists." (Library → Gym)
   + Tikify's own promise: "Plays with your screen locked." (lock-screen controls skip to the next sound). */
(function () {
  const { p, tw, kf, E, el, clamp, lerp, TQ } = FILM;
  const PS = 1.75, PX = 540 - 195 * PS, PY = 452, PH = L.PHONE_H;          // phone screen 390×760 CSS px → 682×1330 film px
  const CX = 540, CYP = PY + PH * PS / 2;
  const LINK = 'https://www.tiktok.com/@nova/video/7400000000000000001';
  const T = {
    enter: 5.95, paste: 6.95, link: 7.0, prev: 7.75, scroll0: 8.18, scroll1: 8.6, gym: 8.82, save: 9.2, saved: 9.25,
    play: 9.66, playerUp: 9.7, close: 12.36, lib: 12.8, gymRow: 13.74, lock: 14.96, lockOn: 15.1, next: 16.46, exit: 17.28,
  };
  L.GLOW.push([6.05, '#6c5ce7', .5, 540, CYP, 600, 820], [9.7, '#6c5ce7', .5, 540, CYP, 600, 820],
    [10.25, '#e0457f', .78, 540, CYP - 60, 700, 960], [12.3, '#d0408a', .74, 540, CYP - 40, 680, 940], [12.75, '#6c5ce7', .48, 540, CYP, 600, 820],
    [14.9, '#6c5ce7', .48, 540, CYP, 600, 820], [15.35, '#9b3a8f', .55, 540, CYP, 620, 860], [17.3, '#8a3a9a', .5, 540, CYP, 600, 820],
    [17.75, '#6c5ce7', .5, 540, 900, 560, 520]);

  const lockHTML = `
    <div style="position:absolute;inset:0;background:
      radial-gradient(90% 55% at 18% 12%, rgba(254,44,85,.55), transparent 70%),
      radial-gradient(85% 60% at 88% 70%, rgba(123,44,191,.75), transparent 72%),
      radial-gradient(70% 45% at 35% 102%, rgba(37,244,238,.28), transparent 70%), #0d0a14"></div>
    <div style="position:absolute;left:0;right:0;top:70px;text-align:center;font:600 17px/1 Inter;color:rgba(255,255,255,.86)">Tuesday, November 3</div>
    <div style="position:absolute;left:0;right:0;top:92px;text-align:center;font:700 98px/1 Inter;letter-spacing:-.02em;color:rgba(255,255,255,.95);font-variant-numeric:tabular-nums">9:41</div>
    <div class="np" style="position:absolute;left:12px;right:12px;top:448px;height:176px;border-radius:26px;background:rgba(30,22,40,.66);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.08), 0 20px 50px rgba(0,0,0,.35);overflow:hidden">
      <img src="../../icons/icon-192.png" style="position:absolute;right:16px;top:16px;width:24px;height:24px;border-radius:6px">
      <div class="np-a" style="position:absolute;left:0;top:0;width:100%;height:80px">
        <img class="np-cover" src="covers/c1.jpg" style="position:absolute;left:16px;top:16px;width:58px;height:58px;border-radius:10px;object-fit:cover">
        <div class="np-t" style="position:absolute;left:88px;top:24px;font:700 16px/1.2 Inter;color:#fff;white-space:nowrap">summer nights (sped up)</div>
        <div class="np-s" style="position:absolute;left:88px;top:47px;font:500 14px/1.2 Inter;color:rgba(255,255,255,.62)">nova</div>
      </div>
      <div style="position:absolute;left:16px;right:16px;top:96px;height:4px;border-radius:2px;background:rgba(255,255,255,.25)"><div class="np-f" style="height:100%;border-radius:2px;background:#fff;width:10%"></div></div>
      <div style="position:absolute;left:16px;right:16px;top:106px;display:flex;justify-content:space-between;font:500 11px/1 Inter;color:rgba(255,255,255,.55);font-variant-numeric:tabular-nums"><span class="np-c">0:05</span><span class="np-d">0:48</span></div>
      <div style="position:absolute;left:0;right:0;top:122px;display:flex;justify-content:center;gap:58px;color:#fff">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
        <svg class="np-next" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </div>
    </div>
    <div style="position:absolute;left:50%;bottom:8px;width:134px;height:5px;margin-left:-67px;border-radius:3px;background:rgba(255,255,255,.72)"></div>`;

  const camAt = (t, R) => kf(t, [
    [5.95, [CX, CYP, 1]], [6.72, [CX, CYP, 1]], [7.16, [R.inX, R.inY, 1.34], E.smooth], [7.66, [R.inX, R.inY, 1.37], E.lin],
    [8.2, [CX, CYP, 1.0], E.smooth], [9.62, [CX, CYP, 1.025], E.glide], [10.1, [CX, R.coverY, 1.03], E.smooth], [12.3, [CX, R.coverY, 1.1], E.glide],
    [12.72, [CX, CYP, 1.0], E.smooth], [14.9, [CX, CYP - 120, 1.045], E.glide], [15.12, [CX, CYP, 1.0], E.smooth], [17.3, [CX, R.npY, 1.06], E.glide]]);

  FILM.scene({ id: 's2', t0: 5.95, t1: 17.7, pre: 0, post: .05,
    build(root) {
      const ST = window.APP_STATES;
      this.caps = [
        [L.caption(root, 'Paste a link. Get the sound.', { y: 300 }), 6.15, 9.74],
        [L.caption(root, 'The cover becomes the background.', { y: 300 }), 10.02, 12.38],
        [L.caption(root, 'Make playlists.', { y: 300 }), 12.62, 14.92],
        [L.caption(root, 'Plays with your screen locked.', { y: 300 }), 15.12, 17.32],
      ];
      this.cam = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      this.ent = el('div', `position:absolute;inset:0;transform-origin:${CX}px ${CYP}px`, this.cam);
      this.wrap = el('div', `position:absolute;left:${PX}px;top:${PY}px;width:390px;height:${PH}px;transform-origin:0 0;transform:translateZ(0);
        border-radius:30px;overflow:hidden;background:#121212;box-shadow:0 40px 120px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.06)`, this.ent);
      // A: Add sound → found → saved, with the full-screen player and toast on top
      const A = this.A = L.screen(this.wrap, ST.add_empty.app + ST.player.player + ST.add_empty.toast);
      A.$('#result').innerHTML = '<div class="loading" id="fLoad"><div class="spinner"></div>Finding the sound…</div>' +
        L.frag(ST.add_preview.app, '.preview') + L.frag(ST.add_saved.app, '.saved');
      A.$('#miniPlayer').outerHTML = L.frag(ST.library.app, '#miniPlayer');
      const B = this.B = L.screen(this.wrap, ST.library.app, 'has-mini');
      const C = this.C = L.screen(this.wrap, ST.playlist.app, 'has-mini');
      for (const S of [A, B, C]) S.$$('[data-cover]').forEach((e) => { if (e.tagName === 'IMG') e.src = `covers/${e.dataset.cover}.jpg`; else e.style.backgroundImage = `url(covers/${e.dataset.cover}.jpg)`; });
      this.D = el('div', `position:absolute;left:0;top:0;width:390px;height:${PH}px;overflow:hidden`, this.wrap, lockHTML);
      this.dark = el('div', 'position:absolute;inset:0;background:#000;opacity:0;z-index:40', this.wrap);
      el('div', 'position:absolute;inset:0;border-radius:30px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);background:linear-gradient(170deg,rgba(255,255,255,.05),rgba(255,255,255,0) 30%);z-index:45;pointer-events:none', this.wrap);
      this.taps = L.tapLayer(this.wrap);

      // ---- A elements + measurements (no transforms applied yet, so rects are CSS px of the screen)
      const a = this.a = { input: A.$('#linkInput'), load: A.$('#fLoad'), spin: A.$('.spinner'), prev: A.$('.preview'), saved: A.$('.saved'),
        view: A.$('#view'), player: A.$('#player'), toast: A.$('#toast'), mini: A.$('#miniPlayer'), paste: A.$('#pasteBtn'),
        gym: A.$('.pl-check span'), gymIn: A.$('.pl-check input'), save: A.$('#saveBtn'), playNow: A.$('#playNow'), close: A.$('#playerClose'),
        libTab: A.$('button[data-tab="library"]'), seek: A.$('#seek'), cur: A.$('#curTime'), dur: A.$('#durTime'), ctx: A.$('#playerContext') };
      a.player.removeAttribute('hidden'); a.player.classList.add('open'); a.ctx.textContent = 'Playing from Just added'; a.dur.textContent = '0:48';
      a.toast.textContent = 'Saved to Gym'; a.toast.classList.add('show');
      a.prevKids = [...a.prev.children].filter((e) => !e.classList.contains('sr-only'));
      a.savedKids = [...a.saved.children];
      const R = this.R = {};
      const show = (e, on) => { e.style.display = on ? '' : 'none'; };
      a.player.style.display = 'none'; a.mini.setAttribute('hidden', ''); show(a.load, false); show(a.saved, false); show(a.prev, true);
      const rin = L.rect(A, a.input), rp = L.rect(A, a.paste);
      R.inX = PX + rin.cx * PS; R.inY = PY + rin.cy * PS; R.paste = [rp.cx, rp.cy];
      const rs = L.rect(A, a.save), rg = L.rect(A, a.gym);
      R.scroll = Math.max(0, Math.round(rs.y + rs.h + 18 - (PH - 64 - 10)));
      R.save = [rs.cx, rs.cy - R.scroll]; R.gym = [rg.cx, rg.cy - R.scroll];
      show(a.prev, false); show(a.saved, true);
      const rpn = L.rect(A, a.playNow); R.playNow = [rpn.cx, rpn.cy];
      R.libTab = (() => { const r = L.rect(A, a.libTab); return [r.cx, r.cy]; })();
      a.player.style.display = '';
      const rc = L.rect(A, a.close); R.close = [rc.cx, rc.cy];
      const rcov = L.rect(A, A.$('#playerCover')); R.coverY = PY + rcov.cy * PS;
      a.player.style.display = 'none';
      // ---- B / C / D
      const b = this.b = { rows: B.$$('.list .row'), chip: B.$('.lib-actions') };
      b.gym = b.rows.find((r) => /Gym/.test(r.textContent));
      const rgr = L.rect(B, b.gym); R.gymRow = [rgr.cx - 60, rgr.cy];
      this.c = { view: C.$('#view'), top: C.$('.topbar') };
      const d = this.d = { a: this.D.querySelector('.np-a'), cover: this.D.querySelector('.np-cover'), t: this.D.querySelector('.np-t'), s: this.D.querySelector('.np-s'),
        f: this.D.querySelector('.np-f'), c: this.D.querySelector('.np-c'), next: this.D.querySelector('.np-next'), np: this.D.querySelector('.np') };
      const hr = this.wrap.getBoundingClientRect(), nr = d.next.getBoundingClientRect(), npr = d.np.getBoundingClientRect();
      R.next = [nr.left - hr.left + nr.width / 2, nr.top - hr.top + nr.height / 2]; R.npY = PY + (npr.top - hr.top + npr.height / 2) * PS;
      this.TAPS = [[T.paste, ...R.paste], [T.gym, ...R.gym], [T.save, ...R.save], [T.play, ...R.playNow], [T.close, ...R.close],
        [T.lib, ...R.libTab], [T.gymRow, ...R.gymRow], [T.next, ...R.next]];
      this.TAPS.forEach((k, i) => FILM.cue('tap' + i, k[0], 'tap'));
    },
    update(lt, t) {
      const a = this.a, b = this.b, d = this.d, R = this.R;
      this.caps.forEach(([c, t0, t1]) => L.capUpdate(c, t, t0, t1));
      // camera null + entrance (keeps the intro's forward zoom: scale grows into place) + exit (recedes, and stats keep receding)
      const [px, py, s] = camAt(t, R);
      this.cam.style.transform = FILM.about(px, py, s);
      const eq = E.out(3)(p(t, T.enter, T.enter + .65)), xq = E.in(2)(p(t, T.exit, T.exit + .35));
      const es = FILM.zoom(eq, 0, 1, .8, 1, E.lin) * FILM.zoom(xq, 0, 1, 1, .84, E.lin);
      this.ent.style.transform = `perspective(1800px) translateY(${(1 - eq) * 170}px) rotateX(${(1 - eq) * 24}deg) scale(${es})`;
      const bl = (1 - eq) * 14 + xq * 16;
      this.ent.style.filter = bl > .3 ? `blur(${bl}px)` : 'none';
      this.ent.style.opacity = clamp((t - T.enter) / .22) * (1 - E.in(2)(p(t, T.exit + .15, T.exit + .35)));
      this.wrap.style.transform = `scale(${PS})`;
      // which screen is on
      const onA = t < T.lib + .05, onB = t >= T.lib + .05 && t < T.gymRow + .08, onC = t >= T.gymRow + .08 && t < T.lockOn, onD = t >= T.lockOn;
      this.A.h.style.display = onA ? 'block' : 'none'; this.B.h.style.display = onB ? 'block' : 'none';
      this.C.h.style.display = onC ? 'block' : 'none'; this.D.style.display = onD ? 'block' : 'none';
      // ---- A: paste → finding → found → Gym → Save → saved + toast → Play now → player slides up … and down
      if (onA) {
        a.input.value = TQ(t) >= T.link ? LINK : '';
        a.paste.style.transform = `scale(${L.press(t, T.paste, .12)})`;
        const loading = t >= T.link && t < T.prev, found = t >= T.prev && t < T.saved, saved = t >= T.saved;
        a.load.style.display = loading ? '' : 'none'; a.prev.style.display = found ? '' : 'none'; a.saved.style.display = saved ? '' : 'none';
        if (loading) { a.spin.style.transform = `rotate(${(t - T.link) * 450}deg)`; L.apply(a.load, L.enter(a.load, t, T.link, .35, { dy: 8, blur: 4 })); }
        if (found) a.prevKids.forEach((e, i) => L.apply(e, L.enter(e, t, T.prev + i * .045, .5, { dy: 18, s0: i === 0 ? .9 : .98, blur: 8 })));
        a.view.scrollTop = found ? Math.round(R.scroll * E.smooth(p(t, T.scroll0, T.scroll1))) : 0;
        a.gymIn.checked = TQ(t) >= T.gym + .03;
        a.gym.style.transform = `scale(${L.press(t, T.gym, .08)})`;
        a.save.style.transform = `scale(${L.press(t, T.save, .04)})`;
        if (saved) a.savedKids.forEach((e, i) => {
          const st = L.enter(e, t, T.saved + i * .06, .5, { dy: 16, s0: i === 0 ? .5 : .97, blur: 8 });
          if (i === 0) st.tf = `scale(${lerp(.5, 1, FILM.pop(t, T.saved, .5))})`;
          L.apply(e, st);
        });
        a.playNow.style.transform = `scale(${L.press(t, T.play, .06)})`;
        const tq = E.soft(p(t, T.saved + .08, T.saved + .45)), tx = E.in(2)(p(t, T.play - .02, T.play + .14));
        a.toast.style.opacity = tq * (1 - tx); a.toast.style.transform = `translateY(${(1 - tq) * 14}px)`;
        if (t >= T.playerUp) a.mini.removeAttribute('hidden'); else a.mini.setAttribute('hidden', '');
        this.A.h.classList.toggle('has-mini', t >= T.playerUp);
        const up = E.out(3)(p(t, T.playerUp, T.playerUp + .38)), down = E.smooth(p(t, T.close + .04, T.close + .34));
        const pv = up * (1 - down);
        a.player.style.display = pv > .001 ? '' : 'none';
        a.player.style.transform = `translateY(${(1 - pv) * 100}%)`;
        const pos = clamp((t - T.playerUp) / 48 * 1.0 + .062, 0, 1);       // seconds into a 0:48 sound (it starts a few seconds in when shown)
        const secs = Math.floor(TQ(t) - T.playerUp + 3);
        a.seek.value = Math.round(pos * 1000); a.seek.style.setProperty('--fill', (pos * 100).toFixed(2) + '%');
        a.cur.textContent = '0:' + String(Math.max(0, secs)).padStart(2, '0');
        a.close.style.transform = `scale(${L.press(t, T.close, .1)})`;
        a.libTab.style.transform = `scale(${L.press(t, T.lib, .08)})`;
      }
      // ---- B: Library — rows rise in, tap Gym
      if (onB) {
        L.apply(b.chip, L.enter(b.chip, t, T.lib + .05, .45, { dy: 14, blur: 6 }));
        b.rows.forEach((r, i) => { const st = L.enter(r, t, T.lib + .1 + i * .065, .5, { dy: 22, blur: 8 }); L.apply(r, st, r === b.gym ? ` scale(${L.press(t, T.gymRow, .03)})` : ''); });
      }
      // ---- C: the Gym playlist slides in
      if (onC) {
        const q = E.soft(p(t, T.gymRow + .08, T.gymRow + .5));
        this.c.view.style.transform = `translateX(${(1 - q) * 26}px)`; this.c.view.style.opacity = clamp(q * 2.2);
      }
      // ---- lock: the screen goes dark, then the lock screen wakes with the sound still playing; Next skips to the next sound
      this.dark.style.opacity = t < T.lock ? 0 : t < T.lockOn ? E.out(2)(p(t, T.lock, T.lock + .1)) : 1 - E.soft(p(t, T.lockOn, T.lockOn + .4));
      if (onD) {
        const sw = p(t, T.next + .03, T.next + .33), nx = TQ(t) >= T.next + .14;
        const o = nx ? E.soft(p(t, T.next + .14, T.next + .5)) : 1 - E.in(2)(p(t, T.next + .03, T.next + .14));
        d.a.style.transform = `translateX(${nx ? (1 - o) * 34 : -(1 - o) * 34}px)`; d.a.style.opacity = o;
        d.t.textContent = nx ? 'gym phonk' : 'summer nights (sped up)'; d.s.textContent = nx ? 'kxng' : 'nova';
        d.cover.src = nx ? 'covers/c5.jpg' : 'covers/c1.jpg';
        const secs = nx ? Math.max(0, TQ(t) - T.next - .14) : 5 + (TQ(t) - T.lockOn);
        d.f.style.width = (secs / 48 * 100 + .4).toFixed(2) + '%'; d.c.textContent = '0:' + String(Math.floor(secs)).padStart(2, '0');
        d.next.style.transform = `scale(${L.press(t, T.next, .12)})`;
        const dq = E.soft(p(t, T.lockOn, T.lockOn + .55));
        d.np.style.transform = `translateY(${(1 - dq) * 24}px) scale(${lerp(.96, 1, dq)})`;
        if (sw > 1) d.f.style.transition = 'none';
      }
      L.tapUpdate(this.taps, this.TAPS, t);
    },
    zoom(lt) { const t = lt + T.enter; return FILM.zoom(E.out(3)(p(t, T.enter, T.enter + .65)), 0, 1, .8, 1, E.lin) * FILM.zoom(E.in(2)(p(t, T.exit, T.exit + .35)), 0, 1, 1, .84, E.lin); },
  });
  FILM.cue('phoneIn', T.enter, 'whoosh'); FILM.cue('found', T.prev, 'pop'); FILM.cue('saved', T.saved, 'success'); FILM.cue('playerUp', T.playerUp, 'swish');
  FILM.cue('lock', T.lock, 'lock'); FILM.cue('wake', T.lockOn, 'chime'); FILM.cue('phoneOut', T.exit, 'whoosh');
})();
