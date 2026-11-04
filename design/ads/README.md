# Tikify TikTok ad (9:16)

`tikify-tiktok-ad.mp4` — 1080×1920, 30 fps, ~32 s, H.264 + AAC. Built from **real app captures** (Playwright drives the
app served from this repo with a demo library; the TikTok lookup is mocked with demo data so the Add flow works offline)
and a code-rendered film (`film/`): one HTML page whose `__seek(t)` draws any frame, captured with sub-frame motion blur.

Structure (video time → song time + 2.14 s; the drop of the track lands at 9.15 s, 168.9 BPM grid):
1. **Hook (0–9.15 s)** — bedroom ambient clip (Higgsfield), a phone with a messaging thread typed in sync with the generated
   voice line *"Uhhhh, why can't I find this TikTok sound anywhere?"*, Spotify / SoundCloud "no results" cards, the reply
   *"Just use Tikify bro."*, *"What's Tikify?"* → camera dives into the word.
2. **Drop edit (9.15–31.9 s)** — logo hit → paste the link → found → saved (real Add flow) → playlist → player slide-up →
   feature list on the vocal → fan of screens → end card (tikify.no). Every cut sits on a bar/beat of the track.

Rebuild: see `film/` (scenes), `capture_film.mjs` (frame capture), `blend_encode.py` (blur + encode), `timeline_mix.py`
(timeline + soundtrack mix). Demo sounds, names and the "nightcore.edits" creator are made up.

Notes for a rebuild: the capture scripts serve the app from the folder above the repo (`python3 -m http.server 8000`),
expect the demo covers rendered by `node design/future-look/render.js covers`, and read the demo sound's cover from
`design/future-look/covers/haunted.png` — copy `demo-cover-haunted.png` there (that folder is gitignored). The film page
and scripts use absolute paths into the session's scratchpad (`caps/`, `assets/`); adjust them to your own working folder.
