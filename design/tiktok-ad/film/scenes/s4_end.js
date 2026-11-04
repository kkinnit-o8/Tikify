/* s4 END CARD (from FB19): the reference's dark stage with a soft top glow. Logo focuses in, the brand line rises,
   the CTA grows from a dot and a light sweep crosses it; "I promise you" sings over a clean hold. */
(function () {
  const { el, E, p, lerp, clamp } = FILM;
  const T0 = FB(19), TAG = FB(20), CTA = FB(21);
  FILM.scene({ id: 's4', t0: T0, t1: DUR, pre: .42,
    build(root) {
      root.style.zIndex = 15;
      this.stage = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 940px', root);
      el('div', 'position:absolute;inset:0;background:#08070B', this.stage);
      el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse 760px 620px at 50% -4%,rgba(167,123,255,.26),rgba(0,0,0,0) 72%),radial-gradient(ellipse 700px 520px at 18% 96%,rgba(255,106,61,.12),rgba(0,0,0,0) 70%),radial-gradient(ellipse 700px 560px at 88% 70%,rgba(255,45,122,.10),rgba(0,0,0,0) 70%)', this.stage);
      const lk = this.lk = el('div', 'position:absolute;left:540px;top:760px;display:flex;align-items:center;gap:30px', this.stage);
      this.mk = el('div', 'filter:drop-shadow(0 16px 40px rgba(255,45,122,.28))', lk, markSVG(176, 'mE'));
      el('div', 'font:800 140px Inter;letter-spacing:-.045em;color:#f6f3f8;line-height:1;padding-bottom:10px', lk, 'Tikify');
      this.lkW = lk.offsetWidth; this.lkH = lk.offsetHeight;
      lk.style.left = (540 - this.lkW / 2) + 'px'; lk.style.top = (760 - this.lkH / 2) + 'px'; lk.style.transformOrigin = '50% 50%';
      const mkLine = (top, css, words) => {
        const line = el('div', `position:absolute;left:0;top:${top}px;width:1080px;text-align:center;white-space:nowrap;${css}`, this.stage);
        return words.map((w) => { const m = el('span', 'display:inline-block;clip-path:inset(-40% -20% -0.22em -20%);margin:0 .125em', line);
          return el('span', 'display:inline-block;padding:0 .04em .07em', m, w); });
      };
      this.w1 = mkLine(926, 'font:800 64px Inter;letter-spacing:-.035em;color:#f6f3f8', ['your', 'tiktok', 'sounds.']);
      this.w2 = mkLine(998, 'font:400 100px "Instrument Serif";font-style:italic;letter-spacing:-.01em', ['played', 'like', 'music.']);
      this.w2.forEach((s) => s.classList.add('grad'));
      // CTA pill
      const pill = this.pill = el('div', 'position:absolute;left:540px;top:1214px;height:116px;border-radius:58px;background:#f6f3f8;overflow:hidden;box-shadow:0 22px 70px rgba(255,45,122,.3),0 0 0 1px rgba(255,255,255,.4)', this.stage);
      this.pt = el('div', 'position:absolute;left:0;top:0;height:116px;padding:0 60px;white-space:nowrap;font:700 46px Inter;line-height:116px;letter-spacing:-.02em;color:#0b0a0f', pill, 'Get Tikify. It’s free.');
      this.pw = this.pt.offsetWidth;
      this.sweep = el('div', 'position:absolute;top:-20px;left:0;width:200px;height:156px;background:linear-gradient(100deg,rgba(255,45,122,0),rgba(255,45,122,.55),rgba(139,92,255,.5),rgba(139,92,255,0));mix-blend-mode:multiply;transform:skewX(-18deg)', pill);
      this.url = el('div', 'position:absolute;left:0;top:1358px;width:1080px;text-align:center;font:700 40px Inter;letter-spacing:-.01em;color:#f6f3f8', this.stage, 'tikify.no');
      this.fine = el('div', 'position:absolute;left:0;top:1414px;width:1080px;text-align:center;font:500 24px Inter;color:rgba(246,243,248,.42)', this.stage, 'No account needed · Not affiliated with TikTok');
    },
    update(lt, t) {
      this.stage.style.transform = `scale(${1 + .025 * E.glide(p(t, T0, DUR))})`;
      const a = p(t, T0 - .06, T0 + .7), q = E.soft(a);
      this.lk.style.opacity = clamp(a * 4).toFixed(3);
      this.lk.style.transform = `translateY(${((1 - q) * 46).toFixed(1)}px) scale(${lerp(.86, 1, q).toFixed(4)})`;
      this.lk.style.filter = a < .6 ? `blur(${((1 - a / .6) * 20).toFixed(1)}px)` : 'none';
      pulseBars(this.mk, t, .2);
      const rise = (arr, t0, st, d) => arr.forEach((s, i) => { const r = E.soft(p(t, t0 + i * st, t0 + i * st + d)); s.style.transform = `translateY(${((1 - r) * 112).toFixed(1)}%)`; });
      rise(this.w1, TAG - .02, .05, .55); rise(this.w2, TAG + .1, .06, .6);
      // CTA: a dot that grows sideways into the pill
      const c = p(t, CTA - .02, CTA + .5), w = lerp(116, this.pw, E.width(c)), ps = FILM.pop(t, CTA - .02, .45);
      this.pill.style.display = t >= CTA - .02 ? 'block' : 'none';
      this.pill.style.width = w.toFixed(1) + 'px'; this.pill.style.left = (540 - w / 2).toFixed(1) + 'px';
      this.pill.style.transform = `scale(${lerp(.3, 1, ps).toFixed(4)})`;
      this.pt.style.left = ((w - this.pw) / 2).toFixed(1) + 'px';
      this.pt.style.opacity = clamp((c - .35) / .3).toFixed(3);
      const sw = E.smooth(p(t, 13.45, 14.05));
      this.sweep.style.left = lerp(-260, this.pw + 60, sw).toFixed(1) + 'px';
      this.sweep.style.display = t > 13.45 && t < 14.05 ? 'block' : 'none';
      const u = E.soft(p(t, CTA + .32, CTA + .85)), f = E.soft(p(t, CTA + .45, CTA + 1));
      this.url.style.opacity = u.toFixed(3); this.url.style.transform = `translateY(${((1 - u) * 20).toFixed(1)}px)`;
      this.fine.style.opacity = f.toFixed(3); this.fine.style.transform = `translateY(${((1 - f) * 16).toFixed(1)}px)`;
    },
  });
})();
