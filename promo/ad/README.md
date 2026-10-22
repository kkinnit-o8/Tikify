# Tikify ad (9:16)

A 16-second vertical ad built from the real app screens: hook → paste a link → save to a playlist →
playlists → player (airplane mode) → end card. Every cut sits on a 120 BPM grid (one beat = 0.5 s),
so it can be re-timed to any track by changing the speed.

Not part of the app: nothing here is in `sw.js`'s `SHELL`.

## Files
- `ad.html`: the whole ad as one page. `seek(t)` draws the frame at `t` seconds, so rendering is
  deterministic. Timings, captions and tap positions are at the top of its script.
- `assets/`: real app screenshots. `add_*.png` come from `scripts/capture.js` (the app with the
  lookup service mocked); `player_clean.png` is `screenshots/player.jpg` with the seek bar and clock
  painted out so the ad can animate them.
- `scripts/render.js`: renders the page to MP4 with Playwright and ffmpeg.
- `scripts/beats.py`: finds a track's tempo, beat grid and drop, to sync the ad to it.

## Render
Needs Node with Playwright (Chromium), ffmpeg, and the Inter font installed.
```sh
cd promo/ad
node scripts/render.js ad.html tikify_ad.mp4 60                   # 16 s, silent audio track
node scripts/render.js ad.html stills --stills 1,4,8,12,15        # PNG stills to check a change
node scripts/render.js ad.html part.mp4 60 1.283697 14.2667       # video only, sped up to 154 BPM
```
For a track at `B` BPM, speed = `B / 120`. Start the ad `2.5 / speed` seconds before the drop so
the phone lands on it, then mux the track over the result with ffmpeg.

## Re-capture the app screens
Serve the folder above the repo (`python3 -m http.server 8765`), then:
```sh
node scripts/capture.js http://localhost:8765/Tikify/ assets assets/cover_night.jpg
```
