/* HOOK (0 → DROP): bedroom ambient clip (Higgsfield), phone with a messaging thread typed in sync with the voice,
   Spotify / SoundCloud "no results" cards, friend's reply, "What's Tikify?" → dive into the word → DROP. */
(() => {
  const E = FILM.E, el = FILM.el, p = FILM.p, clamp = FILM.clamp;
  const T = TL;
  const DROP = T.DROP, SEND1 = T.send1, SEND2 = T.send2, REPLY = T.reply, TYP_ON = T.typingOn;
  const DIVE0 = T.dive0, PIV0 = T.piv0;
  const PW = 600, PL = 240, PT = 500;                       // phone size / position
  const HEAD_H = 150, KB_H = 360, COMPOSE_H = 96, GAP = 14, RISE = 150;
  const settle = E.bez(.3, .3, .15, 1);
  let bgv, dive, ph, thread, composeText, caret, sendBtn, keys = {}, cards = [], items = [], reply, word, kbEl, bgWrap, vignette;

  // keyboard mock (generic dark), returns {el, keys}
  function keyboard(parent, top, w) {
    const kb = el('div', `position:absolute;left:0;top:${top}px;width:${w}px;height:${KB_H}px;background:#141418;border-top:1px solid #ffffff10`, parent);
    const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    const kw = 50, kh = 70, gx = 7, gy = 11; let y = 14;
    rows.forEach((r, ri) => {
      const total = r.length * kw + (r.length - 1) * gx; let x = (w - total) / 2;
      if (ri === 2) { el('div', `position:absolute;left:${x - 68}px;top:${y}px;width:60px;height:${kh}px;border-radius:10px;background:#2a2a32;color:#ddd;font:500 26px/${kh}px Inter;text-align:center`, kb, '⇧'); }
      for (const ch of r) { keys[ch] = el('div', `position:absolute;left:${x}px;top:${y}px;width:${kw}px;height:${kh}px;border-radius:10px;background:#2e2e36;color:#f2f2f5;font:400 30px/${kh}px Inter;text-align:center;box-shadow:0 1px 0 #000`, kb, ch.toUpperCase()); x += kw + gx; }
      if (ri === 2) { el('div', `position:absolute;left:${x + 8}px;top:${y}px;width:60px;height:${kh}px;border-radius:10px;background:#2a2a32;color:#ddd;font:500 26px/${kh}px Inter;text-align:center`, kb, '⌫'); }
      y += kh + gy;
    });
    keys['123'] = el('div', `position:absolute;left:14px;top:${y}px;width:96px;height:${kh}px;border-radius:10px;background:#2a2a32;color:#ddd;font:500 24px/${kh}px Inter;text-align:center`, kb, '123');
    keys[' '] = el('div', `position:absolute;left:120px;top:${y}px;width:${w - 120 - 14 - 110}px;height:${kh}px;border-radius:10px;background:#2e2e36;color:#aaa;font:400 22px/${kh}px Inter;text-align:center`, kb, 'space');
    keys['ret'] = el('div', `position:absolute;right:14px;top:${y}px;width:100px;height:${kh}px;border-radius:10px;background:#2a2a32;color:#ddd;font:500 24px/${kh}px Inter;text-align:center`, kb, 'return');
    return kb;
  }
  function bubble(parent, html, side) {
    const b = el('div', `position:absolute;${side === 'r' ? 'right:0' : 'left:0'};bottom:0;max-width:80%;padding:20px 28px;border-radius:36px;font:450 33px/1.3 Inter;letter-spacing:-.005em;will-change:transform;transform-origin:${side === 'r' ? '92% 100%' : '8% 100%'};box-sizing:border-box;` +
      (side === 'r' ? 'background:linear-gradient(135deg,#ff6a3d,#ff2d7a 55%,#8b5cff);color:#fff;border-bottom-right-radius:10px;box-shadow:0 10px 30px rgba(255,45,122,.25)' : 'background:#262630;color:#f2f2f5;border-bottom-left-radius:10px'), parent, html);
    return b;
  }

  FILM.scene({
    id: 'hook', t0: 0, t1: DROP,
    build(root) {
      dive = el('div', 'position:absolute;inset:0;transform-origin:0 0;will-change:transform', root);
      // background: Higgsfield ambient clip (all-intra for exact seeks), pushed in slowly
      bgWrap = el('div', 'position:absolute;inset:0;overflow:hidden', dive);
      bgv = el('video', 'position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;will-change:transform', bgWrap);
      bgv.muted = true; bgv.preload = 'auto'; bgv.src = UI.ASSETS + 'bed_intra.mp4';
      UI.pending.push(new Promise((r) => { bgv.addEventListener('loadeddata', r, { once: true }); bgv.load(); }));
      vignette = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 100%)', dive);
      // phone + chat
      ph = UI.phone(dive, PW, PL, PT);
      ph.img.style.display = 'none';
      const S = ph.screen, W = ph.sw, H = ph.sh;
      el('div', 'position:absolute;inset:0;background:#0a0a0e', S);
      const head = el('div', `position:absolute;left:0;top:0;width:${W}px;height:${HEAD_H}px;background:#121217;border-bottom:1px solid #ffffff12;display:flex;align-items:center;padding:34px 24px 0;gap:18px;box-sizing:border-box;font-family:Inter`, S);
      head.innerHTML = `<div style="width:40px;color:#8b8b95;font-size:44px;line-height:40px;font-weight:300">‹</div>
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#55556a,#2a2a33);display:grid;place-items:center;font:600 28px Inter;color:#e6e6ee">J</div>
        <div><div style="font:600 29px/1.1 Inter;color:#f2f2f5">Jess</div><div style="font:400 21px/1.2 Inter;color:#8b8b95;margin-top:3px">Active now</div></div>`;
      el('div', `position:absolute;left:0;top:${HEAD_H + 18}px;width:${W}px;text-align:center;font:500 20px Inter;color:#6f6f7a`, S, 'Today 11:48 PM');
      thread = el('div', `position:absolute;left:22px;top:${HEAD_H + 60}px;width:${W - 44}px;height:${H - KB_H - COMPOSE_H - HEAD_H - 70}px;overflow:visible`, S);
      // compose bar
      const cb = el('div', `position:absolute;left:0;top:${H - KB_H - COMPOSE_H}px;width:${W}px;height:${COMPOSE_H}px;background:#0a0a0e;display:flex;align-items:center;gap:14px;padding:0 20px;box-sizing:border-box`, S);
      const pill = el('div', `flex:1;height:64px;border-radius:32px;background:#1b1b22;border:1px solid #ffffff14;display:flex;align-items:center;padding:0 24px;box-sizing:border-box;font:450 30px Inter;color:#f2f2f5;overflow:hidden;white-space:nowrap`, cb);
      composeText = el('span', 'display:inline-block;color:#f2f2f5', pill, '');
      caret = el('span', 'display:inline-block;width:3px;height:36px;background:#ff2d7a;margin-left:3px;vertical-align:middle', pill);
      sendBtn = el('div', `width:58px;height:58px;border-radius:50%;background:#2a2a33;display:grid;place-items:center;color:#8b8b95;font:800 30px Inter;transition:none`, cb, '↑');
      kbEl = keyboard(S, H - KB_H, W);
      // bubbles (absolute stack, measured once)
      const b1 = bubble(thread, T.text1, 'r');
      reply = bubble(thread, '', 'l');
      const dots = el('div', 'display:flex;gap:10px;align-items:center;height:42px', reply); for (let i = 0; i < 3; i++) el('div', 'width:14px;height:14px;border-radius:50%;background:#8b8b95', dots);
      const txt = el('span', 'position:absolute;left:28px;top:20px;white-space:nowrap;opacity:0', reply, 'Just use Tikify bro.');
      const b3 = bubble(thread, `What&#8217;s <span id="tikword" style="display:inline-block;font-weight:600">Tikify</span>?`, 'r');
      word = b3.querySelector('#tikword');
      // measure
      const hs = [b1, reply, b3].map((b) => b.offsetHeight);
      const replyTxtW = (() => { const m = el('span', 'position:absolute;visibility:hidden;font:450 33px/1.3 Inter;white-space:nowrap', S, 'Just use Tikify bro.'); const w = m.offsetWidth; m.remove(); return w; })();
      items = [
        { el: b1, t: SEND1, h: hs[0], side: 'r' },
        { el: reply, t: TYP_ON, h: hs[1], side: 'l', dots, txt, dotsW: reply.offsetWidth, txtW: replyTxtW + 56 },
        { el: b3, t: SEND2, h: hs[2], side: 'r' },
      ];
      reply.style.width = items[1].dotsW + 'px'; reply.style.height = hs[1] + 'px'; reply.style.boxSizing = 'border-box';
      // logo cards (the user's attached logos), in front of the phone
      cards = [
        UI.card(dive, { x: 258, y: 392, size: 230, logo: UI.ASSETS + 'spotify.png', logoW: 150, label: 'No results' }),
        UI.card(dive, { x: 806, y: 392, size: 230, logo: UI.ASSETS + 'soundcloud.png', logoW: 190, label: '0 results' }),
      ];
      // blur windows (sub-frames)
      UI.blurWin(T.cards[0], T.cards[0] + .6, 6); UI.blurWin(T.cards[1], T.cards[1] + .6, 6); UI.blurWin(T.shake, T.shake + .45, 6); UI.blurWin(SEND1, SEND1 + 0.5, 8); UI.blurWin(SEND1 + .1, SEND1 + .8, 8);
      UI.blurWin(REPLY, REPLY + 0.35, 6); UI.blurWin(SEND2, SEND2 + 0.3, 8); UI.blurWin(DIVE0 - 0.05, DROP, 16);
    },
    update(lt, t, root) {
      // --- background video (seek) + push-in
      const want = clamp(t * 1.6 + 0.3, 0, 9.9);
      if (Math.abs(bgv.currentTime - want) > 0.004 && bgv.readyState >= 1) { bgv.currentTime = want; UI.pending.push(new Promise((r) => { const h = () => r(); bgv.addEventListener('seeked', h, { once: true }); setTimeout(r, 1500); })); }
      bgv.style.transform = `translate(${6 * Math.sin(t * .5)}px,${4 * Math.cos(t * .4)}px) scale(${1.03 + 0.08 * E.glide(p(t, 0, DROP))})`;
      // --- phone pose: tilted → frontal, idle drift, lean-in on the reply
      const q = settle(p(t, 0, 1.1));
      const lean = 1 + 0.035 * E.glide(p(t, REPLY - .1, REPLY + .7));
      const rx = 9 * (1 - q) + 1.6 * Math.sin(t * 0.9 + 1), ry = -8 * (1 - q) + 3.2 * Math.sin(t * 0.75), rz = -1.5 * (1 - q) + 0.5 * Math.sin(t * 0.5);
      const s = (1.05 - 0.05 * q) * lean * (1 + 0.045 * E.glide(p(t, 0, DROP))), dy = 40 * (1 - q) + 8 * Math.sin(t * 1.1);
      ph.wrap.style.transform = `translate(0,${dy}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
      // --- typing in the compose field
      const tq = FILM.TQ(t);
      let text = '', lastChar = null, lastT = -9;
      if (t < SEND1) { const n = T.chars1.filter((c) => c <= tq + 1e-6).length; text = T.text1.slice(0, n); if (n) { lastChar = T.text1[n - 1]; lastT = T.chars1[n - 1]; } }
      else if (t < SEND2) { const n = T.chars2.filter((c) => c <= tq + 1e-6).length; text = T.text2.slice(0, n); if (n) { lastChar = T.text2[n - 1]; lastT = T.chars2[n - 1]; } }
      composeText.textContent = text;
      { const inner = composeText.parentElement.clientWidth - 48 - 8, w = composeText.offsetWidth; composeText.style.transform = `translateX(${-Math.max(0, w - inner)}px)`; }
      const typingNow = (t < SEND1 && t >= T.chars1[0] - .3) || (t >= SEND1 + .2 && t < SEND2);
      caret.style.opacity = typingNow ? (Math.floor(t * 2.2) % 2 === 0 || (lastT > t - .35) ? 1 : 0) : 0;
      sendBtn.style.background = text ? 'linear-gradient(135deg,#ff6a3d,#ff2d7a 55%,#8b5cff)' : '#2a2a33'; sendBtn.style.color = text ? '#fff' : '#8b8b95';
      // keyboard key highlight
      for (const k in keys) keys[k].style.background = (k === '123' || k === 'ret') ? '#2a2a32' : '#2e2e36';
      if (lastChar != null && t - lastT < 0.11) { const k = /[a-z]/i.test(lastChar) ? lastChar.toLowerCase() : lastChar === ' ' ? ' ' : '123'; if (keys[k]) keys[k].style.background = '#56566a'; }
      // --- bubble stack
      const k = items.map((it) => FILM.soft(t, it.t, .34));
      items.forEach((it, i) => {
        let y = 0; for (let j = i + 1; j < items.length; j++) y -= k[j] * (items[j].h + GAP);
        const vis = t >= it.t - 1e-6;
        it.el.style.display = vis ? 'block' : 'none'; if (!vis) return;
        const ki = k[i];
        it.el.style.transform = `translate(0,${y + (1 - ki) * RISE}px) scale(${.9 + .1 * ki})`;
        it.el.style.opacity = clamp(ki * 3);
      });
      // typing indicator → reply morph
      const it = items[1];
      const m = E.morph2(p(t, REPLY, REPLY + .28));
      it.el.style.width = (it.dotsW + (it.txtW - it.dotsW) * m) + 'px';
      it.dots.style.opacity = t < REPLY ? 1 : clamp(1 - p(t, REPLY, REPLY + .08));
      it.txt.style.opacity = clamp(p(t, REPLY + .08, REPLY + .2));
      [...it.dots.children].forEach((d, j) => { const ph2 = t * 2 * Math.PI * 1.5 - j * 1.1; d.style.transform = `translateY(${-5 * Math.max(0, Math.sin(ph2))}px)`; d.style.opacity = .55 + .45 * Math.max(0, Math.sin(ph2)); });
      // --- logo cards: pop in on the words, shake on "anywhere?", fly out after the send
      const cardIn = T.cards, shake0 = T.shake, out0 = SEND1 + .12;
      cards.forEach((c, i) => {
        const ti = cardIn[i], qi = FILM.pop(t, ti, .55), vis = t >= ti && t < out0 + .7;
        c.wrap.style.display = vis ? 'block' : 'none'; if (!vis) return;
        const sh = t >= shake0 ? 14 * Math.sin((t - shake0) * 2 * Math.PI * 7.5) * Math.exp(-(t - shake0) * 5.5) : 0;
        const bob = 6 * Math.sin(t * 1.7 + i * 2);
        const qo = E.in(2)(p(t, out0, out0 + .6)), outY = -900 * qo;
        const sidex = i === 0 ? -1 : 1;
        c.wrap.style.transform = `translate(${sh}px,${(1 - qi) * 140 + bob + outY}px) translateZ(130px) rotateY(${sidex * 14 * (1 - qi) + sidex * 6}deg) scale(${.6 + .4 * qi})`;
        c.wrap.style.opacity = clamp(qi * 2) * (1 - p(t, out0 + .45, out0 + .62));
        const qv = Math.abs(outY - (-900 * E.in(2)(p(t - 1 / FILM.fps, out0, out0 + .6)))) * FILM.fps;
        c.blur(c.wrap, 0, Math.min(44, qv / 900 * 14));
        const chipIn = T.chips[i], qc = FILM.pop(t, chipIn, .45);
        c.chip.style.opacity = clamp(qc * 2); c.chip.style.transform = `translate(-50%,${(1 - qc) * 30}px) scale(${.7 + .3 * qc})`;
      });
      // --- DIVE into the word "Tikify" (pivot moves first, then the zoom accelerates into the cut)
      dive.style.transform = 'none';
      let px = 540, py = 960;
      if (t >= PIV0 - .2 && word.offsetParent) { const r = word.getBoundingClientRect(), f = document.getElementById('film').getBoundingClientRect(); px = r.left - f.left + r.width / 2; py = r.top - f.top + r.height / 2; }
      const kp = E.smooth(p(t, PIV0, DIVE0 + .1));
      const zs = FILM.zoom(t, DIVE0, DROP, 1, 9, E.in(4));
      const dx = (540 - px) * kp, dy2 = (960 - py) * kp;
      dive.style.transform = `translate(${dx}px,${dy2}px) ${FILM.about(px, py, zs)}`;
      root.dataset.zoom = zs;
    },
    zoom(lt) { const t = lt; return FILM.zoom(t, DIVE0, DROP, 1, 9, E.in(4)); },
  });
})();
