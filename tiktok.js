// Looks up the sound behind a TikTok video link.
// Uses the public tikwm.com API (CORS enabled), so no server is needed.
// Its errors carry a `problem` ('offline', 'timeout', 'notfound'…) and a message that can be
// shown to the user as-is.
const TikTok = (() => {
  const API = 'https://www.tikwm.com/api/';

  // Pull the first TikTok link out of whatever was pasted/shared
  // (TikTok's share text includes extra words around the link; some apps drop the https://).
  function extractUrl(text) {
    if (!text) return null;
    const m = /(?:^|[^\w.@/-])((?:https?:\/\/)?(?:[\w-]+\.)*tiktok\.com\/[^\s"'<>]+)/i.exec(String(text));
    if (!m) return null;
    // "(see https://vm.tiktok.com/ZMabc)," — the punctuation around it isn't part of the link.
    const url = m[1].replace(/[)\]}>.,!?;:'"”’»…。，！？、]+$/, '');
    return /^https?:\/\//i.test(url) ? url : 'https://' + url;
  }

  const fail = (message, problem) => Object.assign(new Error(message), { problem });
  const OFFLINE = 'You’re offline. Connect to the internet and try again.';
  const NOT_A_VIDEO = 'That’s a sound, hashtag or profile page. Open a video that uses the sound, tap Share → Copy link, and paste that.';

  // Abandons a request after `ms` without progress (kick() restarts the clock) or when the
  // caller's signal aborts. AbortSignal.timeout() and AbortSignal.any() are missing on iOS 15.
  function watchdog(ms, outer) {
    const ctl = new AbortController();
    const onAbort = () => ctl.abort();
    let timer;
    const w = {
      signal: ctl.signal,
      timedOut: false,
      kick() { clearTimeout(timer); timer = setTimeout(() => { w.timedOut = true; ctl.abort(); }, ms); },
      done() { clearTimeout(timer); if (outer) outer.removeEventListener('abort', onAbort); },
    };
    if (outer) { if (outer.aborted) ctl.abort(); else outer.addEventListener('abort', onAbort); }
    w.kick();
    return w;
  }

  // Turns a failed fetch into something the user can act on. A caller's own abort passes through.
  function netError(err, w, what) {
    if (err && err.problem) return err;
    if (w.timedOut) return fail(`The ${what} is taking too long. Check your connection and try again.`, 'timeout');
    if (err && err.name === 'AbortError') return err;
    if (!navigator.onLine) return fail(OFFLINE, 'offline');
    return fail(`Couldn’t reach the ${what === 'lookup' ? 'lookup service' : 'TikTok server'}. Check your connection and try again.`, 'network');
  }

  const sleep = (ms, signal) => new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });

  // tikwm's free tier answers about one request a second, so every call (lookups and the
  // player's re-downloads alike) takes the next free slot.
  let nextSlot = 0;
  function slot(signal) {
    const now = Date.now();
    const wait = Math.max(0, nextSlot - now);
    nextSlot = Math.max(now, nextSlot) + 1100;
    return wait ? sleep(wait, signal) : Promise.resolve();
  }

  async function request(url, signal) {
    const w = watchdog(15000, signal);
    try {
      const res = await fetch(API + '?hd=0&url=' + encodeURIComponent(url), { signal: w.signal });
      if (res.status === 429) return { code: -1, msg: 'limit' };
      let json = null;
      try { json = JSON.parse(await res.text()); } catch (err) { if (err.name !== 'SyntaxError') throw err; }
      // An HTML page (Cloudflare check, captive portal) or a server error.
      if (!res.ok || !json || typeof json !== 'object') throw fail('The lookup service isn’t answering right now. Try again in a minute.', 'service');
      return json;
    } catch (err) {
      throw netError(err, w, 'lookup');
    } finally {
      w.done();
    }
  }

  async function lookup(url, { signal } = {}) {
    let path = '';
    try { path = new URL(url).pathname; } catch { /* left to the API */ }
    // Sound, hashtag and profile pages have no single video (and so no sound) for tikwm to read.
    if (/^\/(?:music|tag|discover|search|explore|live)(?:\/|$)|^\/@[^/]+\/?(?:live\/?)?$/i.test(path)) throw fail(NOT_A_VIDEO, 'page');
    for (let attempt = 1; ; attempt++) {
      await slot(signal);
      const json = await request(url, signal);
      if (json.code === 0 && json.data) return parse(json.data, url);
      const msg = String(json.msg || '');
      if (/limit/i.test(msg)) {
        if (attempt < 3) continue; // over the free tier's rate: the next slot is a second away
        throw fail('Too many lookups right now. Wait a few seconds and try again.', 'limit');
      }
      throw fail('Couldn’t find a video at that link. It may be private or deleted. Make sure it’s a TikTok video link (Share → Copy link).', 'notfound');
    }
  }

  function parse(d, url) {
    const m = d.music_info || {};
    const audioUrl = m.play || d.music;
    if (!audioUrl) throw fail('This TikTok has no sound that can be downloaded.', 'nosound');
    const author = d.author || {};
    // Real songs have album art; "original sound" only has the creator's avatar, so use the video thumbnail.
    const covers = [m.original === false && m.cover, d.cover, d.origin_cover, m.cover].filter(Boolean);
    return {
      tiktokId: d.id ? String(d.id) : null,
      // The same sound is used by many videos: this is what tells that it's already saved.
      musicId: m.id && m.id !== '0' ? String(m.id) : null,
      title: m.title || 'TikTok sound',
      artist: m.author || author.nickname || author.unique_id || 'Unknown',
      isOriginal: m.original === true || /^original sound/i.test(m.title || ''),
      coverUrl: covers[0] || null,
      coverUrls: [...new Set(covers)], // to try in turn: signed CDN links fail now and then
      videoCoverUrl: d.cover || d.origin_cover,
      audioUrl,
      duration: m.duration || d.duration || 0,
      videoTitle: d.title || '',
      videoAuthor: author.unique_id ? '@' + author.unique_id : '',
      sourceUrl: author.unique_id && d.id
        ? `https://www.tiktok.com/@${author.unique_id}/video/${d.id}`
        : url,
    };
  }

  // Downloads a sound (kind 'audio') or a cover ('image'). A captive portal or CDN error page
  // can arrive as "200 OK", so the type and size are checked: that must never be kept as the
  // offline copy. Slow is fine; 20 seconds without a byte is not.
  async function downloadBlob(url, { kind = 'audio', signal, onProgress } = {}) {
    const w = watchdog(20000, signal);
    try {
      const res = await fetch(url, { signal: w.signal });
      if (!res.ok) throw fail(`The download failed (error ${res.status}).`, 'http');
      const type = (res.headers.get('content-type') || '').trim().toLowerCase();
      const ok = kind === 'image' ? /^image\//.test(type) : /^(audio|video)\/|octet-stream/.test(type);
      if (type && !ok) throw fail(`The download wasn’t ${kind === 'image' ? 'an image' : 'a sound file'}.`, 'type');
      const total = Number(res.headers.get('content-length')) || 0;
      let blob;
      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        const parts = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value);
          got += value.length;
          w.kick();
          if (onProgress && total) onProgress(Math.min(1, got / total));
        }
        blob = new Blob(parts, { type });
      } else {
        blob = await res.blob();
      }
      if (blob.size < (kind === 'image' ? 100 : 1000)) throw fail('The download was empty.', 'empty');
      return blob;
    } catch (err) {
      throw netError(err, w, 'download');
    } finally {
      w.done();
    }
  }

  return { extractUrl, lookup, downloadBlob };
})();
