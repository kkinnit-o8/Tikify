// Tiny IndexedDB wrapper. Everything lives on the device.
// Stores:
//   sounds    { id, title, artist, coverBlob?, coverUrl?, sourceUrl, tiktokId, duration, addedAt }
//   audio     { id, blob }            (kept separate so listing sounds stays fast)
//   playlists { id, name, soundIds[], createdAt }
// Every call settles only when its transaction has committed. Errors carry `storage: true`
// (and `opening: true` when the database itself can't be opened), so the app can explain them.
const DB = (() => {
  const NAME = 'tikify';
  const VERSION = 1;
  let dbPromise = null;
  const api = { onblocked: null }; // set by the app: another tab holds an older version open

  function tag(err, opening = false) {
    const e = err && typeof err === 'object' ? err : new Error(String(err || 'Storage error'));
    try { e.storage = true; if (opening) e.opening = true; } catch { /* frozen error object */ }
    return e;
  }

  function open() {
    if (dbPromise) return dbPromise;
    const p = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined' || !indexedDB) throw new DOMException('IndexedDB is not available', 'NotSupportedError');
      const req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('sounds')) db.createObjectStore('sounds', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('playlists')) db.createObjectStore('playlists', { keyPath: 'id' });
      };
      req.onblocked = () => api.onblocked && api.onblocked();
      req.onsuccess = () => {
        const db = req.result;
        const forget = () => { if (dbPromise === p) dbPromise = null; };
        // Step aside when a newer version of the app needs to upgrade the schema, or it waits forever.
        db.onversionchange = () => { db.close(); forget(); };
        // iOS can drop the connection while the app is in the background: reopen on next use.
        db.onclose = forget;
        resolve(db);
      };
      req.onerror = () => reject(req.error);
    }).catch((err) => {
      if (dbPromise === p) dbPromise = null; // let a later call try again
      throw tag(err, true);
    });
    dbPromise = p;
    return p;
  }

  const result = (r) => (r instanceof IDBRequest ? r.result : r);

  // Runs fn(transaction), which queues requests, and resolves once the transaction commits: a
  // write can still fail at commit time (e.g. over quota) and must not look saved. If fn returns
  // a request (or an array of them), the promise resolves to their results.
  async function tx(names, mode, fn, retried = false) {
    const retry = (err) => {
      // A lost or closing connection (Safari reports UnknownError) gets one fresh one.
      if (retried || !err || !['InvalidStateError', 'UnknownError'].includes(err.name) || err.opening) throw tag(err);
      dbPromise = null;
      return tx(names, mode, fn, true);
    };
    let t;
    try {
      t = (await open()).transaction(names, mode);
    } catch (err) {
      return retry(err);
    }
    try {
      return await new Promise((resolve, reject) => {
        let out;
        t.oncomplete = () => resolve(Array.isArray(out) ? out.map(result) : result(out));
        t.onabort = () => reject(t.error || new DOMException('The transaction was aborted', 'AbortError'));
        try { out = fn(t); } catch (err) { reject(err); try { t.abort(); } catch { /* already finished */ } }
      });
    } catch (err) {
      return retry(err);
    }
  }

  const get = (name, key) => tx(name, 'readonly', (t) => t.objectStore(name).get(key));
  const getAll = (name) => tx(name, 'readonly', (t) => t.objectStore(name).getAll());
  const put = (name, value) => tx(name, 'readwrite', (t) => { t.objectStore(name).put(value); });
  const del = (name, key) => tx(name, 'readwrite', (t) => { t.objectStore(name).delete(key); });

  return Object.assign(api, { tx, get, getAll, put, del });
})();

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
