# Tikify — TikTok ad (9:16, 18.8 s, cut to “BLAIR (BP edit audio)”)

A vertical 1080×1920 / 30 fps ad for Tikify, built entirely in code (HTML/CSS/canvas rendered frame by frame in headless
Chromium, sub-frame motion blur, a photographic lens pass, H.264). The concept and the beat structure come from a
music-player ad on TikTok by `@rootlesszen` (2.6M plays): glowing icons one by one → "All in one place." → the icons collapse into a
dot on a line → wordmark → one-line captions over a floating app → rolling stat counters → a "Free. / No account."
list → an end card with a light streak.

**v2 (current)** is re-cut to the 18.84 s edit sound *BLAIR (BP edit audio)*: every event sits on the track's beat grid
(96.9 BPM, a beat every 0.619 s from 0.188 s; downbeats 2.045 · 4.521 · 6.997 · 9.473 · 11.949 · 14.425 · 16.901), and the
glow pulses on every beat after the bass drop at 9.473 s, and the frame punches in (2–5 %, settling over ~0.4 s) on the
drop and the downbeats 11.949, 14.425 and 16.901. Moves put their PEAK SPEED on the beat (that is what the eye reads as the
hit), not their landing. `tools/sync_check.py <video>` measures where the picture changes most and the distance to the
grid: the final cut's visual peaks sit a median 32 ms (one frame) from the beat grid. The grid lives in `film/lib.js` (`L.B(k)`), and every scene's
times are written in beats. v1 (24 s, synthesised score) is in the git history (commit `06bd75b`).

| File | What it is |
|---|---|
| `out/tikify_tiktok_ad_9x16_nosound.mp4` | the picture, silent, 18.833 s (565 frames): upload this and pick *BLAIR (BP edit audio)* in TikTok's sound picker, from its start |
| `out/tikify_tiktok_ad_9x16_blair.mp4` | the same picture with the track mixed in — **not committed** (the song isn't ours to publish in a public repo); make it with the `ffmpeg` line below |
| `out/contact_sheet.jpg` | a frame every 0.5 s |
| `film/` | the film source (`index.html` + one file per scene) |
| `tools/` | capture, motion blur, lens, sound and the scripts that captured the real app |

## Beat sheet (what is on screen, and what in the ref it maps to)

| Time (music) | Picture | Caption | Ref beat |
|---|---|---|---|
| 0.0–2.85 (beats 0–4) | Five TikTok sounds slide through a carousel, **one per beat**, each lighting the glow in its own colour: *original sound*, *sped up*, *slowed + reverb*, *that one audio*, *gym phonk* | — | YouTube, YouTube Music, SoundCloud, Apple Music, Spotify icons |
| 2.85–3.9 | The camera pulls back to the row of five | All in one place. | "All in one place." |
| 3.9–4.52 (beat 6 → downbeat) | They collapse into the seek-bar knob (beat 6), which plays the bar to its end on the downbeat | — | icons → dot on a line |
| 4.52–5.76 | Tikify icon + wordmark grow out of the bar on the intro's big accent | music player for your TikTok sounds | "Riff — music player for your desktop" |
| 5.76–8.85 | Phone lands on beat 9. **Paste** (beat 10) → the link fills in, camera dives into the link box → *Finding the sound…* → found (downbeat 6.997) → **Gym** (beat 12) → **Save to library** (beat 13) → ✓ saved, toast *Saved to Gym* | Paste a link. Get the sound. | "Lyrics, synced word by word." / "Paste a link. Bring your playlist." |
| 8.85–10.71 | **Play now** (beat 14) → the player slides up; **on the bass drop (9.473) the cover's pink floods the background** | The cover becomes the background. | "The cover becomes the background." |
| 10.71–12.57 | Close (beat 17) → **Library** (half-beat) → **Gym** playlist (downbeat 11.949) | Make playlists. | "Make it yours." |
| 12.57–13.8 | The screen locks (beat 20); the lock screen wakes with the sound playing; **Next** (beat 21) skips to *gym phonk* | Plays with your screen locked. | — (Tikify's own) |
| 13.8–15.0 | Rolling counters land on the downbeat (14.425): **269 KB** *the whole app*, **2 taps** *to save a sound* | — | "10,000+ downloads · 180 MB RAM usage" |
| 15.04–16.9 | A line lights on each half-beat: **Free. / No account. / No ads. / Works offline.** (last one on beat 26) | — | "Free. / Open source. / No account. / No ads or telemetry." |
| 16.9–18.84 | On the last downbeat: brand-gradient light streak, Tikify icon + wordmark, **tikify.no**, *iPhone · Android*, *Free. Add it to your Home Screen.* — held through the track's fade | — | end card: Riff, riff.hs.vc, platforms, @handle |

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
tools/stills.sh film/index.html /tmp/stills 1.0,7.2,9.6,17.5                  # check frames (sheet.jpg)
tools/render.sh film/index.html out/draft.mp4 1 4                            # draft, no blur (~1.2 min)
LENS=1 LENS_ARGS="--k .025 --ca 1.2 --bloom .32 --vig .32 --grain .015" \
  tools/render.sh film/index.html out/master_nosound.mp4 4 4 10 \
  "0.66-1.0,1.28-1.62,1.9-2.24,2.52-2.86,2.85-3.45,3.44-4.66,5.42-6.4,6.22-6.62,6.97-7.4,8.88-9.32,9.45-9.62,10.7-11.02,11.94-12.08,13.45-14.72,16.89-17.5"
ffmpeg -i out/master_nosound.mp4 -c:v libx264 -preset slow -b:v 12M -maxrate 16M -bufsize 24M -pix_fmt yuv420p \
  -movflags +faststart out/tikify_tiktok_ad_9x16_nosound.mp4                 # ~12 Mbps for upload
ffmpeg -i out/tikify_tiktok_ad_9x16_nosound.mp4 -i BLAIR_BP_edit_Audio.mp3 -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 256k -af apad -t 18.8333 out/tikify_tiktok_ad_9x16_blair.mp4
```
The film is timed to the track from 0.000 s: the audio must start on the video's first frame. A different track means
measuring its grid and changing `L.BEAT0`, `L.P` and the beat numbers in the scenes. `tools/sound_tikify.py` is v1's
synthesised placeholder score (timed to the 24 s cut), kept for reference.

To change the app UI after an app update: serve the repo's parent folder on port 8765, run
`node tools/appshots.js <snap_dir> film/covers <audio.mp3>`, copy the `.html` files to `tools/app_snapshots/`, then
`python3 tools/build_app_states.py`.

Copy (captions, stats, list, end card) lives in `film/scenes/s1_intro.js` … `s5_end.js`; timings are the `T` tables at
the top of each scene. Open `film/index.html?t=10.5` in Chrome to preview any moment.
