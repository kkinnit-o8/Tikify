# Tikify — TikTok ad (9:16, 24 s)

A vertical 1080×1920 / 30 fps ad for Tikify, built entirely in code (HTML/CSS/canvas rendered frame by frame in headless
Chromium, sub-frame motion blur, a photographic lens pass, H.264). The concept and the beat structure come from a
music-player ad on TikTok by `@rootlesszen` (2.6M plays): glowing icons one by one → "All in one place." → the icons collapse into a
dot on a line → wordmark → one-line captions over a floating app → rolling stat counters → a "Free. / No account."
list → an end card with a light streak.

| File | What it is |
|---|---|
| `out/tikify_tiktok_ad_9x16.mp4` | the ad with the synthesised placeholder soundtrack |
| `out/tikify_tiktok_ad_9x16_nosound.mp4` | the same picture, silent: use this one if you post it with a trending TikTok sound |
| `out/sound.m4a` | the soundtrack on its own |
| `out/contact_sheet.jpg` | a frame every 0.5 s |
| `film/` | the film source (`index.html` + one file per scene) |
| `tools/` | capture, motion blur, lens, sound and the scripts that captured the real app |

## Beat sheet (what is on screen, and what in the ref it maps to)

| Time | Picture | Caption | Ref beat |
|---|---|---|---|
| 0.0–2.4 | Five TikTok sounds slide through a carousel, each lighting the glow in its own colour: *original sound*, *sped up*, *slowed + reverb*, *that one audio*, *gym phonk* | — | YouTube, YouTube Music, SoundCloud, Apple Music, Spotify icons |
| 2.4–3.5 | The camera pulls back to the row of five | All in one place. | "All in one place." |
| 3.5–4.5 | They collapse into the seek-bar knob, which plays the bar to its end | — | icons → dot on a line |
| 4.5–6.0 | **Beat drop.** Tikify icon + wordmark grow out of the bar | music player for your TikTok sounds | "Riff — music player for your desktop" |
| 6.0–9.7 | Phone flies in. Tap **Paste** → the link fills in, camera dives into the link box → *Finding the sound…* → the sound is found → tap **Gym** → **Save to library** → ✓ saved, toast *Saved to Gym* | Paste a link. Get the sound. | "Lyrics, synced word by word." / "Paste a link. Bring your playlist." |
| 9.7–12.4 | **Play now** → the full-screen player slides up; the glow around the phone turns the cover's pink | The cover becomes the background. | "The cover becomes the background." |
| 12.4–15.0 | Close the player → **Library** → **Gym** playlist, the saved sound playing | Make playlists. | "Make it yours." |
| 15.0–17.3 | The screen locks; the lock screen wakes with the sound still playing; **Next** skips to *gym phonk* | Plays with your screen locked. | — (Tikify's own) |
| 17.6–19.1 | Rolling counters land on **269 KB** *the whole app* and **2 taps** *to save a sound* | — | "10,000+ downloads · 180 MB RAM usage" |
| 19.0–21.1 | Lit one line at a time: **Free. / No account. / No ads. / Works offline.** | — | "Free. / Open source. / No account. / No ads or telemetry." |
| 21.0–24.0 | Brand-gradient light streak; Tikify icon + wordmark, **tikify.no**, *iPhone · Android*, *Free. Add it to your Home Screen.* | — | end card: Riff, riff.hs.vc, platforms, @handle |

## What is real
- **The UI in the phone is Tikify itself**: the app was driven in headless Chromium (`tools/appshots.js`, with the tikwm
  lookup and the TikTok CDN mocked), its DOM was captured in each state, and the film renders those snapshots with the
  app's own `styles.css` inside Shadow DOM (`tools/build_app_states.py` → `film/app_states.js`). Every step shown —
  Paste looks the sound up by itself, the preview's fields, *Save to library*, the *Saved to Gym* toast, *Play now* →
  "Playing from Just added", the blurred-cover player background, Library, the Gym playlist — is what the app does.
- **Stats**: the app shell (`index.html`, `styles.css`, `app.js`, `db.js`, `tiktok.js`, `manifest.webmanifest`,
  `sw.js`, the icons) is 269,316 bytes = 269 KB; saving a sound is Paste → Save (the lookup runs on its own after Paste).
  Update the number in `film/scenes/s3_stats.js` if the app grows.
- **Free, no account, no ads, works offline, plays with the screen locked, lock-screen skip** are from the README.
- Sound names, artists and covers are invented demo data in the style of the repo's own screenshots
  (`tools/covers.py`). The lock screen (time, date, Now Playing card) is drawn generically — no other company's logos
  appear anywhere; "TikTok" is only named in plain text.

## Re-render
Needs Node 22, a Chromium (`/opt/pw-browsers/chromium` or `HFT_BROWSER`), Python 3 with numpy + Pillow, ffmpeg.
```bash
cd ad
tools/stills.sh film/index.html /tmp/stills 1.0,7.2,10.5,22.0                 # check frames (sheet.jpg)
node tools/capture.mjs film/index.html /tmp --cues film/cues.json            # cue times for the sound
tools/render.sh film/index.html out/draft.mp4 1 4                            # draft, no blur (~1.5 min)
LENS=1 LENS_ARGS="--k .025 --ca 1.2 --bloom .32 --vig .32 --grain .015" \
  tools/render.sh film/index.html out/tikify_tiktok_ad_9x16_nosound.mp4 4 4 10 \
  "0.2-0.55,0.7-1.05,1.2-1.55,1.7-2.05,2.4-3.1,3.5-4.75,5.8-6.7,6.7-7.2,7.6-8.2,9.65-10.1,12.35-12.75,17.25-18.9,21.0-21.6"
python3 tools/sound_tikify.py film/cues.json out/sound.wav                   # → sound.wav (convert: ffmpeg -i sound.wav sound.m4a)
ffmpeg -i out/tikify_tiktok_ad_9x16_nosound.mp4 -i out/sound.wav -c:v copy -c:a aac -b:a 256k -shortest out/tikify_tiktok_ad_9x16.mp4
```
To change the app UI after an app update: serve the repo's parent folder on port 8765, run
`node tools/appshots.js <snap_dir> film/covers <audio.mp3>`, copy the `.html` files to `tools/app_snapshots/`, then
`python3 tools/build_app_states.py`.

Copy (captions, stats, list, end card) lives in `film/scenes/s1_intro.js` … `s5_end.js`; timings are the `T` tables at
the top of each scene. Open `film/index.html?t=10.5` in Chrome to preview any moment.
