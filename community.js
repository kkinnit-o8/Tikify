// Public playlists: anyone can make a playlist public (its TikTok links, titles and artists, never
// audio), and anyone can search them and download one. They live in a Supabase database, set up
// with supabase/setup.sql (see the README). Until PROJECT_URL and KEY are filled in, the feature is
// hidden.
// Its errors carry a message that can be shown to the user as-is.
const Community = (() => {
  // From your Supabase project: its Project URL (https://….supabase.co) and its publishable key
  // (sb_publishable_…, or the legacy anon key). Both are meant to be public: the key only reaches
  // the functions in setup.sql.
  const PROJECT_URL = '';
  const KEY = '';

  const ready = !!(PROJECT_URL && KEY);
  const fail = (message) => Object.assign(new Error(message), { problem: true });

  async function call(fn, args = {}) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15000);
    const headers = { 'Content-Type': 'application/json', apikey: KEY };
    if (KEY.startsWith('eyJ')) headers.Authorization = 'Bearer ' + KEY; // a legacy anon key is a JWT
    let res;
    let body = null;
    try {
      res = await fetch(`${PROJECT_URL.replace(/\/+$/, '')}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args), signal: ctl.signal });
      const text = await res.text();
      try { body = text ? JSON.parse(text) : null; } catch { /* an HTML error page */ }
    } catch {
      if (!navigator.onLine) throw fail('You’re offline. Connect to the internet and try again.');
      throw fail('Couldn’t reach public playlists. Check your connection and try again.');
    } finally {
      clearTimeout(timer);
    }
    if (res.ok) return body;
    // P0001: a message setup.sql wrote for people (a name too long, too many publishes, …).
    if (body && body.code === 'P0001' && body.message) throw fail(body.message);
    throw fail('Public playlists aren’t available right now. Try again later.');
  }

  return {
    ready,
    search: (q) => call('search_playlists', { q, max_results: 30 }),
    get: (id) => call('get_playlist', { pid: id }),
    publish: ({ name, description, sounds }) => call('publish_playlist', { pl_name: name, pl_description: description, pl_sounds: sounds }),
    update: (id, key, { name, description, sounds }) =>
      call('update_playlist', { pid: id, edit_key: key, pl_name: name, pl_description: description, pl_sounds: sounds }),
    unpublish: (id, key) => call('unpublish_playlist', { pid: id, edit_key: key }),
    countDownload: (id) => call('count_download', { pid: id }),
    report: (id, reason) => call('report_playlist', { pid: id, reason }),
  };
})();
