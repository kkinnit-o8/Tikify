// Tiny IndexedDB wrapper. Everything lives on the device.
// Stores:
//   sounds    { id, title, artist, coverBlob?, coverUrl?, sourceUrl, tiktokId, duration, addedAt }
//   audio     { id, blob }            (kept separate so listing sounds stays fast)
//   playlists { id, name, soundIds[], createdAt }
const DB = (() => {
  const NAME = 'tikify';
  const VERSION = 1;
  let dbPromise;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('sounds')) db.createObjectStore('sounds', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('playlists')) db.createObjectStore('playlists', { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function wrap(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function store(name, mode = 'readonly') {
    const db = await open();
    return db.transaction(name, mode).objectStore(name);
  }

  const get = async (name, key) => wrap((await store(name)).get(key));
  const getAll = async (name) => wrap((await store(name)).getAll());
  const put = async (name, value) => wrap((await store(name, 'readwrite')).put(value));
  const del = async (name, key) => wrap((await store(name, 'readwrite')).delete(key));
  const clear = async (name) => wrap((await store(name, 'readwrite')).clear());

  return { get, getAll, put, del, clear };
})();

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
