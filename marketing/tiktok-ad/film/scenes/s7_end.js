/* s7 · 16.94–19.07 · end card: a clean centred packshot. The icon is carried in from s6 (same rect); the wordmark lands
   on the bar (bigger than at the drop), then the line and the CTA pill; held still ≥ 1.5 s. */
(function () {
  const { E, p, el, clamp } = FILM;
  const T0 = K.bar(4), T1 = 572 / 30, I = K.END_ICON;
  let S = {};
  FILM.scene({
    id: 's7', t0: T0, t1: T1,
    zoom: (lt) => 1,
    build(root) {
      S.bloom = el('div', `position:absolute;left:${540 - 520}px;top:${I.y - 520}px;width:1040px;height:1040px;border-radius:50%;` +
        'background:radial-gradient(circle, rgba(254,44,85,.5) 0, rgba(123,44,191,.42) 34%, rgba(37,244,238,.12) 56%, transparent 70%);filter:blur(30px)', root);
      S.icon = K.icon(root, I.s, `left:${540 - I.s / 2}px;top:${I.y - I.s / 2}px;filter:drop-shadow(0 30px 60px rgba(0,0,0,.5))`);
      S.word = el('div', 'position:absolute;left:0;right:0;top:872px;text-align:center;font-size:230px;font-weight:800;color:#fff;letter-spacing:-.045em', root);
      S.word.className = 'disp'; S.g = FILM.glyphs(S.word, 'Tikify');
      S.line = el('div', 'position:absolute;left:0;right:0;top:1142px;text-align:center;font:600 54px/1.22 "Inter Display";letter-spacing:-.02em;color:#CFCAD8', root);
      S.l1 = el('div', '', S.line, 'Save TikTok sounds.'); S.l2 = el('div', '', S.line, 'Play them like music.');
      S.cta = el('div', `position:absolute;left:50%;top:1340px;height:116px;border-radius:999px;background:${K.BRAND};box-shadow:0 20px 60px rgba(123,44,191,.45);overflow:hidden`, root);
      S.legal = el('div', 'position:absolute;left:0;right:0;top:1486px;text-align:center;font:500 28px Inter;color:#8E8A99', root, 'Not affiliated with TikTok, Spotify or SoundCloud.');
      S.ctaT = el('div', 'position:absolute;left:0;right:0;top:0;line-height:116px;text-align:center;font:800 58px "Inter Display";letter-spacing:-.02em;color:#fff;white-space:nowrap', S.cta, 'tikify.no');
    },
    update(lt, t) {
      const hit = Math.exp(-Math.max(0, lt) * 2.6);
      S.bloom.style.opacity = (.62 + .3 * hit).toFixed(3);
      S.bloom.style.transform = `scale(${(1 + .05 * hit + .015 * Math.sin(lt * 2.2)).toFixed(4)})`;
      FILM.riseGlyphs(S.g, t, T0 - .08, .035, .55, 115);
      K.wordIn(S.l1, t, T0 + .26, .5, 26, 12); K.wordIn(S.l2, t, T0 + .36, .5, 26, 12);
      // CTA: width grows from a square about its centre, label rises in
      const wq = E.width(p(t, T0 + .5, T0 + 1.0)), W = 116 + (480 - 116) * wq;
      S.cta.style.width = W + 'px'; S.cta.style.marginLeft = -W / 2 + 'px';
      S.cta.style.opacity = clamp(p(t, T0 + .5, T0 + .6));
      S.cta.style.transform = `translateY(${(1 - E.soft(p(t, T0 + .5, T0 + 1.0))) * 30}px)`;
      K.wordIn(S.ctaT, t, T0 + .72, .45, 20, 10);
      K.wordIn(S.legal, t, T0 + .9, .5, 10, 6);
    },
  });
  FILM.cue('end', T0, 'hit');
})();
