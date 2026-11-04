/* s3 PAYOFF (CUT2 → end-card iris): out of the cover's sunset into the same room, now vibing with the phone face down.
   The real mini player (cropped from the playing screenshot) floats in on the next kick. The end card opens from it. */
(function () {
  const { el, E, p, lerp, clamp } = FILM;
  const IRIS0 = 11.40, IRIS1 = 12.02, CX = 540, CY = 1250;
  FILM.scene({ id: 's3', t0: CUT2, t1: FB(19), post: .45,
    build(root) {
      root.style.zIndex = 20;
      this.layer = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden', root);
      this.bgw = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:620px 640px', this.layer);
      this.img = el('img', 'position:absolute;left:0;top:-6px;width:1080px;height:1932px;object-fit:cover;filter:brightness(.86) saturate(1.04) contrast(1.04)', this.bgw);
      el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,7,11,.62) 0%,rgba(8,7,11,.18) 26%,rgba(8,7,11,0) 40%,rgba(8,7,11,0) 55%,rgba(8,7,11,.42) 80%,rgba(8,7,11,.6) 100%)', this.layer);
      // fringe riding the iris edge
      this.fr = el('div', 'position:absolute;inset:0;mix-blend-mode:screen;pointer-events:none', root);
      // the real mini player
      const S2 = this.S2 = 796 / 369;
      this.card = el('div', `position:absolute;left:${540 - 398}px;top:${CY - 30 * S2}px;width:796px;height:${60 * S2}px;border-radius:${18 * S2}px;overflow:hidden;
        background:url(assets/cap/playlist_playing.png) ${-12 * S2}px ${-708 * S2}px / ${393 * S2}px ${852 * S2}px no-repeat;
        box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 1.5px rgba(255,255,255,.1),0 0 90px rgba(255,45,122,.22);transform-origin:50% 50%`, root);
      this.lastSrc = '';
    },
    async update(lt, t) {
      const ct = .35 + (t - CUT2);
      const fi = clamp(Math.floor(ct * 24) + 1, 1, 121), src = `assets/vibe/${String(fi).padStart(3, '0')}.jpg`;
      // continues the forward motion of the needle (scale only grows), decelerating
      const s = 1 + .2 * E.out(4)(p(t, CUT2, CUT2 + .7)) + .05 * E.glide(p(t, CUT2 + .5, IRIS1));
      this.bgw.style.transform = `scale(${s.toFixed(4)})`;
      this.bgw.style.filter = t < CUT2 + .12 ? `blur(${((1 - p(t, CUT2, CUT2 + .12)) * 8).toFixed(1)}px)` : 'none';
      // iris from the mini player's centre
      const iq = E.smooth(p(t, IRIS0, IRIS1)), R = iq * 2300, F = 70 + .3 * R;
      if (t > IRIS0) {
        this.layer.style.webkitMaskImage = this.layer.style.maskImage = `radial-gradient(circle at ${CX}px ${CY}px,rgba(0,0,0,0) ${R.toFixed(0)}px,#000 ${(R + F).toFixed(0)}px)`;
        const a = Math.sin(Math.PI * iq) * .55;
        this.fr.style.display = 'block';
        this.fr.style.background = `radial-gradient(circle at ${CX}px ${CY}px,rgba(255,106,61,0) ${Math.max(0, R - 20).toFixed(0)}px,rgba(255,106,61,${(a * .7).toFixed(3)}) ${(R + F * .35).toFixed(0)}px,rgba(255,45,122,${a.toFixed(3)}) ${(R + F * .6).toFixed(0)}px,rgba(139,92,255,${(a * .6).toFixed(3)}) ${(R + F * .9).toFixed(0)}px,rgba(139,92,255,0) ${(R + F * 1.15).toFixed(0)}px)`;
      } else { this.layer.style.webkitMaskImage = this.layer.style.maskImage = 'none'; this.fr.style.display = 'none'; }
      // card: floats in on the kick after the cut, drifts, then falls back out of focus as the iris opens
      const ci = p(t, FB(17), FB(17) + .62), cq = E.soft(ci), co = E.in(2)(p(t, IRIS0 - .05, IRIS0 + .32));
      const fl = Math.sin((t - FB(17)) * 1.9) * 7;
      this.card.style.display = t >= FB(17) ? 'block' : 'none';
      this.card.style.opacity = (clamp(ci * 5) * (1 - co)).toFixed(3);
      this.card.style.transform = `translateY(${((1 - cq) * 150 + fl + co * 70).toFixed(1)}px) scale(${(lerp(.93, 1, cq) * lerp(1, .84, co)).toFixed(4)})`;
      const bl = (1 - clamp(ci / .55)) * 12 + co * 16;
      this.card.style.filter = bl > .3 ? `blur(${bl.toFixed(1)}px)` : 'none';
      if (src !== this.lastSrc) { this.lastSrc = src; this.img.src = src; }
      if (!this.img.complete || !this.img.naturalWidth) await this.img.decode().catch(() => {});
    },
    zoom(lt) { return 1 + .2 * E.out(4)(p(lt, 0, .7)); },
  });
})();
