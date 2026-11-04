# Tikify TikTok ad ("can't find this sound")

A 14.75 s vertical (1080×1920, 30 fps) TikTok ad, cut to a soundtrack the owner supplied. The song and the
rendered video are **not** in this repo (the repo is public and the video contains an excerpt of that song).

## Story, on the music
The cut starts 137.685 s into the song: 8 kicks of bass-less breakdown, then the drop. The kick grid was measured
from the track (one kick every 0.6146 s, drop at 142.602 s), and every cut and UI change sits on a kick
(`film/timing.js`).

| Time | Music | Picture |
| --- | --- | --- |
| 0.0–1.8 | breakdown, "You're my addiction" | Frustrated scroll at night (generated). Message sent: "why cant i find this tiktok sound anywhere??" |
| 1.8–3.7 | "I believe in it" | The friend types… "just use tikify bruh🥀" lands on "believe" |
| 3.7–4.9 | "I promise you" | Needle zoom into the word "tikify", fastest on the drop |
| 4.9 | **drop** | Tikify logo over the reply's gradient; the dark stage floods up and pushes it out |
| 5.5–6.8 | | **paste any tiktok link**: tap Paste → "Finding the sound…" → the found sound |
| 6.8–8.0 | | **save it in one tap**: scroll, pick Late Night Drive, Save → "Saved to Late Night Drive" |
| 8.0–8.6 | | **build your playlists**: the library, tap the playlist |
| 8.6–9.8 | bass gap at 9.56 | **play it on repeat**: tap the new sound, it plays, the full player slides up; needle into the cover |
| 9.8–11.4 | bass returns | **no wifi? screen off? still playing.** Same room, phone face down, the real mini player floats in |
| 11.4–14.75 | "I promise you" | Iris to the end card: logo, "your tiktok sounds. *played like music.*", "Get Tikify. It's free.", tikify.no |

Important text stays clear of TikTok's own UI: nothing that must be read sits above y 200, below y 1480, or right of
x 940.

## What's real
- **Every phone screen is the real app** (this repo, served to Playwright by request interception, no server),
  filled with the made-up demo library from `design/screenshots.js`. `capture.js` drives the real interactions:
  Paste (from the clipboard), the lookup, ticking a playlist, Save, opening the library and playlist, tapping the
  sound, opening the player. The TikTok lookup (tikwm.com) is answered with demo data, so no real TikTok, creator
  or account appears. The tap circles mark where those taps were made.
- **Generated with Higgsfield** (people only, no UI): the two bedroom shots. Stills with Soul 2 / GPT Image 2.5,
  animated with Kling 3.0 (5 s, 9:16, silent). Higgsfield job ids: hook still `adbd5b5f-3548-49dc-ae7d-42955f33aa31`,
  hook clip `d33e18ed-46ef-46ec-9aef-6f24e334d1f2`, payoff still `1379d754-bf3a-4a5d-82cb-e5feaf286f13`,
  payoff clip `4cf06800-ad16-460e-b345-530acd45d176`.

## Rebuild
Needs Node with Playwright (Chromium), Python 3 with numpy + Pillow, ffmpeg.
```bash
node design/future-look/render.js covers                  # the demo covers
node design/tiktok-ad/capture.js                           # real app captures → film/assets/cap/
# the two generated clips → film/assets/hook/%03d.jpg and film/assets/vibe/%03d.jpg (24 fps frames)
ffmpeg -i hook.mp4 -q:v 2 design/tiktok-ad/film/assets/hook/%03d.jpg
ffmpeg -i vibe.mp4 -q:v 2 design/tiktok-ad/film/assets/vibe/%03d.jpg
node design/tiktok-ad/stills.js /tmp/stills 0.5,6.5,9.8,14.7  # check frames
```
Render: `render.js` captures each frame as 4 sub-frames (12 in fast moves) for motion blur and `blend.py` averages
them. Then a gentle bloom pass (higgsfield-motion-saas `lens.py` with `--k 0 --ca .6 --bloom .13 --thr .82 --vig 0
--grain 0`, bloom .07 over the app screens), H.264 at CRF 16, and AAC 320k of the song cut from 137.685 s for
14.767 s (12 ms fade in, 0.35 s fade out). Decode the MP3 to float, not 16-bit: it decodes above 0 dBFS, and clipped
samples make AAC overshoot. One gain of −3.8 dB keeps every sample under 0 dBFS.
```bash
node design/tiktok-ad/render.js work/sub 0 443 4 12 "4.2-5.05,5.2-6.1,6.45-7.1,7.33-7.45,7.93-8.05,8.57-8.7,9.15-9.35,9.5-10.6,11.35-12.1,12.85-13.1"
python3 design/tiktok-ad/blend.py work/sub work/blend 443
```
The film is a pure function of time (`window.__seek(t)`), built on the engine from the higgsfield-motion-saas skill.
