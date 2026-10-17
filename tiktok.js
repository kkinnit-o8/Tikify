// Looks up the sound behind a TikTok video link.
// Uses the public tikwm.com API (CORS enabled), so no server is needed.
const TikTok = (() => {
  const API = 'https://www.tikwm.com/api/';

  // Pull the first TikTok link out of whatever was pasted/shared
  // (TikTok's share text includes extra words around the link).
  function extractUrl(text) {
    if (!text) return null;
    const m = String(text).match(/https?:\/\/(?:[\w-]+\.)*tiktok\.com\/[^\s"'<>]+/i);
    return m ? m[0] : null;
  }

  async function lookup(url) {
    const res = await fetch(API + '?hd=0&url=' + encodeURIComponent(url));
    if (!res.ok) throw new Error('Lookup failed (' + res.status + ')');
    const json = await res.json();
    if (json.code !== 0 || !json.data) {
      throw new Error(json.msg && json.msg !== 'success' ? json.msg : 'Could not find that TikTok');
    }
    const d = json.data;
    const m = d.music_info || {};
    const audioUrl = m.play || d.music;
    if (!audioUrl) throw new Error('This TikTok has no downloadable sound');
    const author = d.author || {};
    return {
      tiktokId: d.id,
      title: m.title || 'TikTok sound',
      artist: m.author || author.nickname || author.unique_id || 'Unknown',
      // Real songs have album art; "original sound" only has the creator's avatar, so use the video thumbnail.
      coverUrl: (m.original === false && m.cover) || d.cover || d.origin_cover || m.cover,
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

  async function downloadBlob(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed (' + res.status + ')');
    return res.blob();
  }

  return { extractUrl, lookup, downloadBlob };
})();
