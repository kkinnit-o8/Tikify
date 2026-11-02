# Tikify: TikTok ad

`tikify-tiktok-ad.mp4` is a vertical ad for TikTok: 1080×1920, 30 fps, 18.37 s, H.264 + AAC. It uses the whole supplied
sound, mastered loud (about −9.7 LUFS, true peak −1.3 dBTP). `tikify-tiktok-ad_nosound.mp4` is the same picture without audio,
for re-cutting to another sound in an editor.

Every cut sits on a bar of the track (≈167 BPM, a bar is 1.438 s), and something new lands on every beat:

| Time | Beat |
|---|---|
| 0.00–1.67 | **Hook.** "STOP / REWATCHING / TIKTOKS / FOR THE SOUND", one word per beat on hard colour cuts, over a looping video whose replay counter climbs |
| 1.67–3.11 | Share → **Copy link**. The link pill flies out of the share sheet |
| 3.11–4.54 | The link drops into Tikify's real **Add sound** screen: Find sound → preview → **Save to library**. The camera dives into Save |
| 4.54–5.98 | **The drop.** The brand gradient floods out of the button; icon, "Tikify", "Your TikTok sounds. Played like music." |
| 5.98–7.42 | One sound splits into the **playlists** Gym · Chill · Road trip (the pill-tree idea from the reference ad) |
| 7.42–8.86 | Full-screen **player**: play, shuffle, repeat |
| 8.86–10.30 | **Lock screen**: skips from the lock screen's buttons |
| 10.30–11.73 | **Airplane mode** on, still playing; saved on your phone |
| 11.73–13.17 | **FREE.** No account · Unlimited playlists · Plays in the background |
| 13.17–14.61 | **Add to Home Screen**: the icon drops into place |
| 14.61–16.05 | SAVE. SORT. PLAY. REPEAT. |
| 16.05–18.37 | End card: icon, wordmark, tagline, **Get it free · tikify.no** |

Every claim matches the README's feature list. No third-party logos are drawn: TikTok appears only as words, and the
"video" in the hook is a generic vertical post.

TikTok safe zones: the key text stays between y ≈ 250 and 1450 and clear of the right-hand button column.

## Re-rendering
`source/` is a code-built film: `index.html` + `scenes.js` (12 scenes) + `lib.js` (look, components) + `engine.js`
(a deterministic timeline: `window.__seek(t)` draws frame *t*). Needs Node 22+, a Chromium browser, Python 3 with numpy and Pillow, and ffmpeg.

```bash
cd ad/source
node tools/capture.mjs index.html stills --stills 0,2.5,5.5,17.5    # check frames
./tools/render.sh index.html frames 5 4 14 "4.15-4.95,7.1-8.0,14.3-14.95"   # 5 sub-frames, 14 in the fast windows
ffmpeg -framerate 30 -i frames/f_%05d.png -i sound.mp3 -map 0:v -map 1:a \
  -af "aresample=48000,volume=7dB,alimiter=limit=0.84:attack=3:release=60:level=disabled" \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest out.mp4
```
Scene times are in `scenes.js` as beats: `B(n) = 0.23 + n × 0.3595` s.
Fonts are local copies of Unbounded, Bricolage Grotesque and Inter (Google Fonts, SIL Open Font License).
