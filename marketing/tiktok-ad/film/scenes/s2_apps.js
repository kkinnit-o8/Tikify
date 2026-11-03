/* s2 · 1.47–4.42 · "here, there, and everywhere… just to find that one TikTok audio."
   The search capsule never moves: music-app windows swap AROUND it (mirrored whips on "here," / "there,"), then the camera
   pulls back and the window becomes one tile in a wall of players all showing the same search ("everywhere").
   The wall dims (exposure, no plates) and one TikTok sound card grows out of the centre; the camera dives into its
   waveform on the cut to s3. Other brands appear as plain-text labels on generic windows (no logos, no copied UI). */
(function () {
  const { E, p, el, clamp, about } = FILM;
  const T = K.T, T0 = T.here, T1 = T.audioEnd;
  const CAP = K.CAP, CW = 940, CH = 700, CX = 70, CY = 850;          // window rect at scale 1 (wraps the capsule)
  const PIV = [540, CY + CH / 2];                                       // pull-back pivot = window centre
  // only the big, recognisable players (review: brief-2 / honesty-5); the ring around the centre is fixed
  const NAMES = ['Spotify', 'SoundCloud', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal', 'Pandora'];
  const RING = { '1,0': 'Apple Music', '0,-1': 'YouTube Music', '0,1': 'Amazon Music', '-1,-1': 'Deezer', '1,-1': 'Tidal', '-1,1': 'Pandora', '1,1': 'Spotify', '-2,0': 'Apple Music', '2,0': 'YouTube Music' };
  const THEMES = [
    { bg: '#17171B', ink: '#FFFFFF', sub: '#9A98A3', cap: '#2A2A31', row: '#26262C' },
    { bg: '#FFFFFF', ink: '#141217', sub: '#77727F', cap: '#F0EEF4', row: '#F4F2F7' },
    { bg: '#EFE8FF', ink: '#1D1530', sub: '#6E6390', cap: '#FFFFFF', row: '#E3DAFB' },
    { bg: '#FFE9EF', ink: '#2A1018', sub: '#8F6470', cap: '#FFFFFF', row: '#FBDCE5' },
    { bg: '#E3F7F6', ink: '#0F2A2A', sub: '#5E8584', cap: '#FFFFFF', row: '#D2EFEE' },
    { bg: '#101014', ink: '#FFFFFF', sub: '#8E8C98', cap: '#23232A', row: '#1E1E24' },
  ];
  const RESULTS = [['that one song (Sped Up)', 'Various Artists'], ['that one song – slowed + reverb', 'lofi edits'], ['that one song (Bass Boosted)', 'DJ Remix']];
  K.WAVE0 = [660, 1339, 540, 86];                                      // card waveform centre + size (s3 grows out of it)
  const COLS = 11, ROWS = 19, C0 = 5, R0 = 9, PX = CW + 70, PY = CH + 70;   // overscanned: the wall's edge never enters the frame
  let S = {};

  // one music-app window at (x, y): header with the app's name in plain text, the shared search capsule, three results
  function win(parent, x, y, name, th, live) {
    const w = el('div', `position:absolute;left:${x}px;top:${y}px;width:${CW}px;height:${CH}px;border-radius:44px;background:${th.bg};` +
      'box-shadow:0 30px 80px rgba(40,20,70,.18);overflow:hidden', parent);
    if (name === 'Spotify') {                                         // the client asked for the real logos on "here," / "there,"
      const lg = el('img', 'position:absolute;left:40px;top:34px;height:92px', w); lg.src = 'assets/spotify_logo.svg';
    } else if (name === 'SoundCloud') {
      el('div', 'position:absolute;left:0;top:0;right:0;height:150px;background:linear-gradient(100deg,#FF4E00,#FF7A00 55%,#FF9A1F)', w);
      const mk = el('img', 'position:absolute;left:30px;top:9px;width:132px;height:132px', w); mk.src = 'assets/soundcloud_mark_white.svg';
      el('div', 'position:absolute;left:170px;top:44px;font:800 54px "Inter Display";letter-spacing:.04em;color:#fff', w, 'SOUNDCLOUD');
    } else {
      el('div', `position:absolute;left:44px;top:44px;font:800 56px "Inter Display";letter-spacing:-.03em;color:${th.ink}`, w, name);
    }
    el('div', `position:absolute;right:48px;top:58px;font:600 34px Inter;color:${name === 'SoundCloud' ? 'rgba(255,255,255,.9)' : th.sub}`, w, 'Search');
    if (!live) {                                                       // static copy of the capsule (the live one is a separate layer)
      const c = el('div', `position:absolute;left:${CAP.x - CX}px;top:${CAP.y - CY}px;width:${CAP.w}px;height:${CAP.h}px;border-radius:${CAP.h / 2}px;background:${th.cap}`, w);
      el('div', `position:absolute;left:45px;top:37px;color:${th.ink};opacity:.55`, c, K.svg('search', 58));
      el('div', `position:absolute;left:125px;top:0;font:500 45px/${CAP.h}px Inter;color:${th.ink};white-space:pre`, c, K.QUERY);
    }
    RESULTS.forEach(([a, b], i) => {
      const ry = CAP.y - CY + CAP.h + 36 + i * 118;
      el('div', `position:absolute;left:44px;top:${ry}px;width:96px;height:96px;border-radius:14px;background:${K.cover(i * 3 + name.length)}`, w);
      el('div', `position:absolute;left:166px;top:${ry + 10}px;right:44px;font:600 36px Inter;color:${th.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`, w, a);
      el('div', `position:absolute;left:166px;top:${ry + 56}px;font:500 29px Inter;color:${th.sub}`, w, b);
    });
    return w;
  }

  FILM.scene({
    id: 's2', t0: T0, t1: T1,
    zoom: (lt) => (lt < T.and - T0 ? 1 : FILM.zoom(lt, T.and - T0, T1 - T0, 1, .17, E.out(2.2))) * (lt > T1 - T0 - .26 ? FILM.zoom(lt, T1 - T0 - .26, T1 - T0, 1, 1.6, E.in(3)) : 1),
    build(root) {
      S.dive = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);   // the dive into the sound card (end of scene)
      S.bk = el('div', 'position:absolute;left:-400px;top:-400px;right:-400px;bottom:-400px;background:#0F0E13;opacity:0', S.dive);   // screen-space dark behind the wall
      S.wall = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.dive);   // the pull-back (the "null")
      S.tiles = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const dc = c - C0, dr = r - R0;
        if (dr === 0 && (dc === 0 || dc === -1)) continue;                  // SoundCloud (centre) and Spotify (left of it) are the hero windows
        const k = r * COLS + c, name = RING[dc + ',' + dr] || NAMES[(k * 5 + 2) % NAMES.length];
        const th = name === 'Spotify' ? THEMES[0] : name === 'SoundCloud' ? THEMES[1] : THEMES[(k * 5 + r) % THEMES.length];
        const tl = win(S.wall, CX + dc * PX, CY + dr * PY, name, th, false);
        tl.__d = Math.max(Math.abs(dc), Math.abs(dr)); tl.__dx = -dc * PX; tl.__dy = -dr * PY;
        S.tiles.push(tl);
      }
      // hero windows + the live capsule: same transform as the wall, kept lit (no exposure drop) so the two logos stay readable
      S.hero = el('div', 'position:absolute;inset:0;transform-origin:0 0', S.dive);
      S.winA = win(S.hero, CX, CY, 'Spotify', THEMES[0], true);          // "here," → ends as the tile left of centre
      S.winB = win(S.hero, CX, CY, 'SoundCloud', THEMES[1], true);       // "there," → the wall's centre tile
      // the live capsule, carried from s1 (same rect); it shrinks with the pull-back
      S.cap = K.capsule(S.hero, CAP.x, CAP.y, CAP.w, CAP.h, { shadow: false });
      S.cap.set(K.QUERY, false);
      // words + the sound card live in a front layer that shares the dive transform
      S.front = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      root = S.front;
      S.here = el('div', 'position:absolute;left:0;right:0;top:560px;text-align:center;font-size:200px;color:' + K.C.ink, root, 'here,'); S.here.className = 'disp';
      S.there = el('div', 'position:absolute;left:0;right:0;top:560px;text-align:center;font-size:200px;color:' + K.C.ink, root, 'there,'); S.there.className = 'disp';
      S.every = el('div', 'position:absolute;left:0;right:0;top:600px;text-align:center;font-size:150px;color:#fff;text-shadow:0 10px 60px rgba(0,0,0,.55)', root, 'everywhere'); S.every.className = 'disp';
      S.just = el('div', 'position:absolute;left:0;right:0;top:470px;text-align:center;font-size:80px;font-weight:600;color:rgba(255,255,255,.86);text-shadow:0 8px 40px rgba(0,0,0,.4)', root); S.just.className = 'disp';
      S.wJust = K.words(S.just, 'just to find');
      S.one = el('div', 'position:absolute;left:0;right:0;top:586px;text-align:center;font-size:136px;color:#fff;text-shadow:0 10px 50px rgba(0,0,0,.4);line-height:1.04', root); S.one.className = 'disp';
      S.wOne = K.words(S.one, 'that one');
      el('br', '', S.one);
      S.wTik = K.words(S.one, 'TikTok audio.', 'background:linear-gradient(100deg,#FF6B88,#C98BFF 55%,#66F4EF);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;padding-bottom:.06em;filter:drop-shadow(0 6px 30px rgba(0,0,0,.7))');
      // the TikTok sound card (grows out of the wall's centre)
      S.card = el('div', 'position:absolute;left:90px;top:1100px;width:900px;height:330px;border-radius:44px;background:#fff;box-shadow:0 40px 120px rgba(0,0,0,.45);transform-origin:450px 165px;overflow:hidden', root);
      S.disc = el('div', `position:absolute;left:46px;top:56px;width:218px;height:218px;border-radius:50%;background:${K.NIGHT};box-shadow:inset 0 0 0 14px #141217`, S.card);
      el('div', 'position:absolute;left:84px;top:84px;width:50px;height:50px;border-radius:50%;background:#141217;box-shadow:0 0 0 6px rgba(255,255,255,.16)', S.disc);
      el('div', `position:absolute;left:300px;top:62px;font:800 52px "Inter Display";letter-spacing:-.02em;color:${K.C.ink};display:flex;align-items:center;gap:12px`, S.card, K.svg('note', 46, K.C.ink) + '<span>original sound</span>');
      el('div', `position:absolute;left:302px;top:128px;font:500 36px Inter;color:${K.C.inkSoft}`, S.card, 'tikify.demo');
      S.wc = el('canvas', 'position:absolute;left:300px;top:196px;width:540px;height:86px', S.card); S.wc.width = 1080; S.wc.height = 172;
      S.wx = S.wc.getContext('2d');
    },
    update(lt, t) {
      const C = K.C;
      // --- window swaps: mirrored whips around the fixed capsule ---
      // Spotify whips in on "here," and is pushed into the slot left of centre on "there," (it stays part of the wall);
      // SoundCloud enters from the right with the same speed, overlapping so no frame is empty
      const aIn = E.out(3)(p(t, T.here - .02, T.here + .2)), aOut = E.in(2)(p(t, T.there - .08, T.there + .06));
      const bIn = E.out(2.2)(p(t, T.there - .06, T.there + .2));
      S.winA.style.transform = `translateX(${(1 - aIn) * 1100 - aOut * PX}px)`;
      S.winB.style.display = t >= T.there - .06 ? 'block' : 'none';
      S.winB.style.transform = `translateX(${(1 - bIn) * 1100}px)`;
      // the capsule's fill follows the window it sits in (a state change, frame-quantised)
      S.cap.box.style.top = (CAP.y + K.capDY(t)) + 'px';
      const thA = FILM.TQ(t) >= T.here + .1 && FILM.TQ(t) < T.there + .1, thB = FILM.TQ(t) >= T.there + .1;   // the capsule takes its window's colours once that window is under it
      S.cap.box.style.background = thA ? THEMES[0].cap : thB ? THEMES[1].cap : '#fff';
      S.cap.txt.style.color = S.cap.ico.style.color = thA ? '#fff' : C.ink;
      // tiles exist only once we pull back (before that they are off-frame anyway)
      // the wall assembles outward from the SoundCloud window (ring by ring), as the camera pulls back
      const pb = t >= T.and - .05;
      S.tiles.forEach((e) => {
        e.style.display = pb ? 'block' : 'none'; if (!pb) return;
        const q = E.out(3)(p(t, T.and - .04 + .03 * e.__d, T.and + .3 + .03 * e.__d));
        e.style.transform = q >= 1 ? 'none' : `translate(${(1 - q) * e.__dx}px,${(1 - q) * e.__dy}px) scale(${.6 + .4 * q})`;
      });
      S.bk.style.opacity = E.smooth(p(t, T.and - .02, T.and + .3)).toFixed(3);
      // --- pull back: log-space zoom about the window centre, fast at the start, settling ---
      const z = t < T.and ? 1 : FILM.zoom(t, T.and, T1, 1, .17, E.out(2.2));
      S.wall.style.transform = S.hero.style.transform = about(PIV[0], PIV[1], z);
      const dim = E.smooth(p(t, T.and + .02, T.and + .4)), dim2 = E.smooth(p(t, T.just + .3, T.that + .2));
      const br = 1 - .40 * dim - .18 * dim2;                                // floored ≥ .42: the tiles stay tinted, not grey
      S.wall.style.filter = dim > 0 ? `brightness(${br.toFixed(3)}) blur(${(dim2 * 9).toFixed(2)}px)` : 'none';
      S.hero.style.filter = dim2 > 0 ? `brightness(${(1 - .5 * dim2).toFixed(3)}) blur(${(dim2 * 9).toFixed(2)}px)` : 'none';
      // --- words ---
      const hq = K.wordIn(S.here, t, T.here - .04, .3, 0, 16);
      S.here.style.display = t < T.there + .07 ? 'block' : 'none';
      S.here.style.transform = `translateX(${(1 - aIn) * 520 - aOut * 1100}px)`;
      S.there.style.display = t >= T.there - .001 && t < T.and + .2 ? 'block' : 'none';
      K.wordIn(S.there, t, T.there - .02, .3, 0, 16);
      const thOut = E.in(3)(p(t, T.and - .06, T.and + .12));                // pushed up and out by the wall (not faded in place)
      S.there.style.transform = `translateX(${(1 - bIn) * 520}px) translateY(${-300 * thOut}px)`; S.there.style.opacity = 1 - clamp((thOut - .5) * 2);
      S.there.style.filter = thOut > .02 ? `blur(${thOut * 14}px)` : S.there.style.filter;
      // "everywhere": lands as the wall opens, exits upward on "just"
      S.every.style.display = t >= T.every - .1 && t < T.just + .2 ? 'block' : 'none';
      K.wordIn(S.every, t, T.every - .06, .4, 40, 18);
      const eo = K.wordOut(S.every, t, T.just - .02, .18, -90, 14);
      // "just to find" / "that one TikTok audio."
      [T.just, T.to, T.find].forEach((t0, i) => K.wordIn(S.wJust[i], t, t0 - .05, .4, 26));
      [T.that, T.one].forEach((t0, i) => K.wordIn(S.wOne[i], t, t0 - .05, .4, 30));
      [T.tiktok, T.audio].forEach((t0, i) => K.wordIn(S.wTik[i], t, t0 - .05, .4, 30));
      // --- the sound card grows out of the wall's centre (grow from a point) ---
      const g = p(t, T.find - .02, T.find + .55), gs = E.soft(g), gp = E.out(3)(g);
      S.card.style.display = t >= T.find - .02 ? 'block' : 'none';
      S.card.style.opacity = clamp(g * 6);
      S.card.style.transform = `translateY(${(1 - gp) * 120}px) scale(${.08 + .92 * gs})`;
      S.disc.style.transform = `rotate(${t * 140}deg)`;
      K.wave(S.wx, 1080, 172, t, { n: 46, color: C.ink, amp: .95 });
      // --- dive into the card's waveform on the cut (the speed peak sits on the cut) ---
      const dz = FILM.zoom(t, T1 - .26, T1, 1, 1.6, E.in(3));
      S.dive.style.transform = S.front.style.transform = about(K.WAVE0[0], K.WAVE0[1], dz);
    },
  });
  FILM.cue('whoosh', T.there - .08, 'whoosh'); FILM.cue('swell', T.and, 'swell');
})();
