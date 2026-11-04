/* s1 HOOK (0 → CUT1): the frustrated scroll (generated clip) and the two messages, on the breakdown's vocals:
   "You're my addiction" (0.28) → message 1 is sent; "I believe" (2.28) → the friend's reply lands;
   "I promise you" (3.8–4.9) → needle zoom INTO the word "tikify", speed peak on the drop. */
(function () {
  const { el, E, p, lerp, clamp, tw } = FILM;
  const M1 = 'why cant i find this tiktok sound anywhere??';
  const NEEDLE0 = 4.22;
  FILM.scene({ id: 's1', t0: 0, t1: CUT1,
    build(root) {
      root.style.zIndex = 10; root.style.overflow = 'hidden'; root.style.background = '#08070B';
      this.bgw = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:560px 760px', root);
      this.img = el('img', 'position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;filter:brightness(.66) saturate(.95) contrast(1.06)', this.bgw);
      el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,7,11,.38) 0%,rgba(8,7,11,0) 20%,rgba(8,7,11,0) 34%,rgba(8,7,11,.5) 52%,rgba(8,7,11,.72) 78%,rgba(8,7,11,.8) 100%)', this.bgw);
      this.chat = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0', root);
      const C = this.chat;
      this.stamp = el('div', 'position:absolute;left:0;top:832px;width:1080px;text-align:center;font:500 26px Inter;letter-spacing:.01em;color:rgba(246,243,248,.6)', C, '<b style="font-weight:700">Today</b> 11:47 PM');
      // message 1 — sent (right)
      const b1 = this.b1 = el('div', 'position:absolute;top:892px;border-radius:46px 46px 14px 46px;background:rgba(70,64,78,.62);backdrop-filter:blur(22px) saturate(1.2);-webkit-backdrop-filter:blur(22px);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.12),0 18px 50px rgba(0,0,0,.35);transform-origin:100% 100%', C);
      const t1 = el('div', 'padding:28px 38px 30px;max-width:680px;font:500 56px/1.2 Inter,"Noto Color Emoji";letter-spacing:-.012em;color:#fff', b1, M1);
      const w1 = b1.offsetWidth; b1.style.left = (928 - w1) + 'px';
      this.read = el('div', 'position:absolute;font:600 23px Inter;color:rgba(246,243,248,.55);letter-spacing:.01em', C, 'Read 11:47 PM');
      this.read.style.top = (892 + b1.offsetHeight + 12) + 'px'; this.read.style.left = (928 - this.read.offsetWidth - 10) + 'px';
      // message 2 — the reply (left): typing dots that grow into the bubble
      const top2 = 892 + b1.offsetHeight + 74;
      const b2 = this.b2 = el('div', `position:absolute;left:90px;top:${top2}px;overflow:hidden;border-radius:46px 46px 46px 14px;box-shadow:0 22px 60px rgba(255,45,122,.28),0 10px 30px rgba(0,0,0,.3)`, C);
      this.b2grey = el('div', 'position:absolute;inset:0;background:rgba(70,64,78,.7)', b2);
      this.b2grad = el('div', `position:absolute;inset:0;background:${BRAND}`, b2);
      const t2 = this.t2 = el('div', 'position:absolute;left:0;top:0;white-space:nowrap;padding:28px 40px 30px;font:600 56px/1.2 Inter,"Noto Color Emoji";letter-spacing:-.012em;color:#fff', b2,
        'just use <span id="tk">tikify</span> bruh🥀');
      this.W2 = t2.offsetWidth; this.H2 = t2.offsetHeight;
      const tk = t2.querySelector('#tk');
      this.pivot = [90 + tk.offsetLeft + tk.offsetWidth * .5, top2 + tk.offsetTop + tk.offsetHeight * .56];
      this.dots = el('div', 'position:absolute;left:0;top:0;width:132px;height:90px', b2);
      this.dot = [0, 1, 2].map((i) => el('div', `position:absolute;top:38px;left:${35 + i * 25}px;width:14px;height:14px;border-radius:50%;background:rgba(246,243,248,.75)`, this.dots));
      this.lastSrc = '';
    },
    update(lt, t) {
      // background clip (24 fps) with a slow push; it zooms (less) with the needle: parallax
      const fi = clamp(Math.floor(t * 24) + 1, 1, 121), src = `assets/hook/${String(fi).padStart(3, '0')}.jpg`;
      const nq = E.in(4.6)(p(t, NEEDLE0, CUT1));
      const push = 1 + .06 * E.glide(p(t, 0, NEEDLE0));
      this.bgw.style.transform = `scale(${push * Math.exp(Math.log(1.9) * nq)})`;
      this.bgw.style.filter = nq > .02 ? `blur(${(nq * 10).toFixed(1)}px)` : 'none';
      // chat: lean in on the reply, then the needle into "tikify"
      const [px, py] = this.pivot;
      const lean = 1 + .05 * E.glide(p(t, 2.7, NEEDLE0));
      const s = lean * Math.exp(Math.log(11) * nq);
      this.chat.style.transform = FILM.about(px, py, s, 0, lerp(0, 960 - py, E.smooth(p(t, 2.9, CUT1))) * .35);
      // timestamp + message 1 is sent on "You're" (0.28)
      const a = p(t, .16, .62), q = E.soft(a);
      this.stamp.style.opacity = E.soft(p(t, .02, .4)).toFixed(3);
      this.b1.style.opacity = clamp(a * 6).toFixed(3);
      this.b1.style.transform = `translateY(${(1 - q) * 110}px) scale(${lerp(.82, 1, q)})`;
      this.b1.style.filter = a < .5 ? `blur(${((1 - a / .5) * 6).toFixed(1)}px)` : 'none';
      const r = E.soft(p(t, 1.25, 1.7));
      this.read.style.opacity = r.toFixed(3); this.read.style.transform = `translateY(${(1 - r) * 12}px)`;
      // the friend is typing (1.84) … and the reply lands on "believe" (2.38)
      const tin = FILM.pop(t, 1.8, .42), m = E.morph2(p(t, 2.36, 2.72));
      const vis = t >= 1.8;
      this.b2.style.display = vis ? 'block' : 'none';
      if (!vis) return this.frame(src);
      const w = lerp(132, this.W2, m), h = lerp(90, this.H2, m);
      this.b2.style.width = w + 'px'; this.b2.style.height = h + 'px';
      this.b2.style.transform = `scale(${t < 2.36 ? lerp(.4, 1, tin) : 1})`; this.b2.style.transformOrigin = '0 100%';
      this.b2grad.style.opacity = E.smooth(p(t, 2.36, 2.62)).toFixed(3);
      const dz = 1 - p(t, 2.36, 2.46);
      this.dots.style.opacity = dz.toFixed(3);
      this.dot.forEach((d, i) => { const b = Math.max(0, Math.sin((t - 1.8) * 2 * Math.PI * 1.6 - i * .9)); d.style.transform = `translateY(${(-9 * b).toFixed(1)}px)`; d.style.opacity = (.45 + .55 * b).toFixed(3); });
      const tx = E.soft(p(t, 2.44, 2.9));
      this.t2.style.opacity = clamp((t - 2.42) / .14).toFixed(3);
      this.t2.style.transform = `translateY(${((1 - tx) * 18).toFixed(1)}px)`;
      this.t2.style.filter = tx < .6 ? `blur(${((1 - tx / .6) * 7).toFixed(1)}px)` : 'none';
      return this.frame(src);
    },
    async frame(src) { if (src !== this.lastSrc) { this.lastSrc = src; this.img.src = src; } if (!this.img.complete || !this.img.naturalWidth) await this.img.decode().catch(() => {}); },
    zoom(lt) { return Math.exp(Math.log(11) * E.in(4.6)(p(lt, NEEDLE0, CUT1))); },
  });
})();
