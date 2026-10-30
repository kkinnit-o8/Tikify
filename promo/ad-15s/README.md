# Tikify — 15 s launch ad

A 15-second, 1920×1080, 30 fps ad for Tikify. Everything is drawn in code: HTML/CSS/canvas scenes, captured frame by
frame in headless Chromium, with sub-frame motion blur, a light lens pass and H.264. No stock footage and no AI generations.
The sound is the supplied track (*nuts* instrumental, slowed, no drums) from **4.044 s**. That leaves one beat of
intro before the drop, which lands 0.566 s into the ad. Quiet UI foley is synthesised from the picture's own cues.

The motion grammar follows the reference ad (instagram.com/p/Dd66aLqCbO6). It takes the reference's grammar but none of
its brand:
- a decoding tag born from a chip on a pastel field, with beads arcing in and a dive into the icon
- the app's UI on pink diagonal plates, with a glowing cursor
- a result card born with a glow
- big-to-small kinetic "chat" lines on dark
- status pills, and a clean end card

The colours, icon, copy and screens are Tikify's own, from `styles.css`, `app.js` and `index.html`.

## The cut (106 BPM, b = 0.566 s)

| Time | Beat | Shot |
|---|---|---|
| 0.00 | intro | A pastel field. A cyan chip grows out of a ring, text scrambling. |
| 0.57 | **drop** | The chip snaps cyan → pink → black. **♪ Tikify** decodes, then *» TikTok sounds, on repeat «*. |
| 1.42 | b2.5 | Five sound covers arc in and are swallowed by the ♪ icon. The camera dives into the icon (×62, speed peak on the cut). |
| 2.26 | b4 | The real **Add sound** screen keeps flying in. Paste (b5), then **Find sound** (b6) shows "Finding the sound…". |
| 3.68 | b6.5 | The result card is born from the button: *night drive (slowed)*, *mira.wav*, Add to ✓ Road trip. |
| 4.25 | b7.5 | **Save to library**, then "Downloading… 0–100 %" over the track's quiet breath. A needle zooms into the button. |
| 5.09 | **hit** | Out of the ✓ chip: **Saved to Road trip.**, then a pull-back and **Downloaded. Works offline.** Needle into "offline". |
| 6.79 | b12 | Your Library. The saved cover lands in Road trip's collage (b13), and the counts tick 4 → 5 and 8 → 9. |
| 7.92 | b14 | Tap Road trip, which pushes into the playlist. The cursor presses ▶ on b16.5 and holds it… |
| 9.62 | **re-drop** | …and lets go on the drop. The player grows out of ▶ while violet floods from it. |
| 10.47 | b18.5 | Airplane mode switches on. **No signal. Still playing.** |
| 11.32 | b20 | The phone locks: the player morphs into the lock-screen widget. ⏭ on b21 rolls to the next sound. **Screen locked? It keeps going.** |
| 12.45 | b22 | The cover becomes the Tikify icon while pastel floods back. The wordmark lands on b23 and the pills on b24. |
| 14.15 | **hit** | The note bounces and a shine crosses **tikify.no**. Clean hold to 15.0, with the line *Tikify is not affiliated with TikTok.* |

Every on-screen state is something the app really does. The strings come from the app: "Add sound", "Find sound",
"Finding the sound…", "Save to library", "Downloading… N%", "Your Library", "New playlist", "Playing from Road trip".
Sound names and artists are made up.

## 9:16 (TikTok / Reels / Shorts)

`film/index_9x16.html` is the same film at 1080×1920. It has the same beats, the same cues and so the same soundtrack.
It isn't a crop: every scene in `film/scenes916/` is re-laid out for a phone.
- The Add sound and Library screens use the app's own vertical layout, with its tab bar.
- The playlist uses the app's big centred cover.
- The text messages stack.
- The player and lock screen are true phone layouts.
- The end card is a stacked lockup.

Key text stays in TikTok's safe area: below the top tabs, left of the right-hand buttons and above the caption area.

Render it with the same command as the 16:9 master, swapping in `film/index_9x16.html`.

## Files

- `film/index.html` is the film page. It loads `engine.js`, the deterministic timeline engine from the
  higgsfield-motion-saas skill (plus flat "plates" in the background), `common.js` (palette, icons, cover art, cursor)
  and one scene module per shot in `scenes/`.
- `fonts/` holds local copies of Inter Tight, Inter and Geist Mono from Google Fonts, so capture never waits on the network.
- `tools/` holds `capture.mjs` (CDP frame capture), `render.sh` (workers → blur → lens → ffmpeg), `stills.sh`,
  `blend.py`, `lens.py`, `sheet.py`, `sound.py` and `sound_kit.py`.

## Render

You need Node 22+, a Chromium build (`HFT_BROWSER`, default `/opt/pw-browsers/chromium`), ffmpeg, and Python 3 with numpy and Pillow.

Preview a frame in a browser:

```bash
open "film/index.html?t=5.3"
```

Render stills and a contact sheet:

```bash
tools/stills.sh film/index.html stills 0.6,2.2,5.3,9.9
```

Render a draft without motion blur (about 1 min):

```bash
tools/render.sh film/index.html draft.mp4 1 4
```

Render the master, with 6 sub-frames everywhere and 16 in the fast windows, plus the lens pass:

```bash
LENS=1 LENS_ARGS="--k .03 --ca 1.2 --bloom .3 --vig .22 --grain .015" tools/render.sh film/index.html ad_nosound.mp4 6 4 16 "1.85-2.45,4.8-5.45,6.45-7.1,7.95-8.5,9.55-10.05,12.45-12.9"
```

Build the soundtrack. The cues come from the picture, so re-run this after any retime:

```bash
node tools/capture.mjs film/index.html /tmp --cues cues.json
```

```bash
python3 tools/sound.py track.mp3 cues.json audio/
```

Mux the picture and the mix:

```bash
ffmpeg -i ad_nosound.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -t 15 ad.mp4
```
