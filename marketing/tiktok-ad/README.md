# Tikify TikTok ad: "Let me guess…"

This is a 19.07 s vertical ad (1080×1920, 30 fps), built entirely in code. Each frame is an HTML/CSS page that headless
Chromium captures, followed by sub-frame motion blur, a light lens pass and H.264 encoding. The shot plan is in
[SCENARIO.md](SCENARIO.md).

| Path | What it is |
|---|---|
| `film/index.html` | The film page: fonts (Inter and Inter Display, installed locally), the light-to-dark background, and the scene list. It exposes `window.__seek(t)`. |
| `film/engine.js` | The deterministic timeline engine (from the higgsfield-motion-saas skill; the camera centre is patched for 9:16). |
| `film/kit.js` | Palette, **all timing** (`K.T` holds the voiceover word times and `K.bar()` the post-drop bars), and shared components (search capsule, waveform, icons). |
| `film/scenes/s1…s7` | One module per shot group: hook, apps wall, waveform, search/dive, drop reveal, app demo, end card. |
| `audio/build_vo.py` | Cuts the Higgsfield voice take into phrases, shortens pauses, time-stretches the phrases with rubberband (pitch kept), and places them so "Search no more." ends before the drop. |
| `audio/mix.py` | The song from 16.72 s, the voice with the music ducked under it, quiet picture sounds, and a static gain to −14 LUFS plus a −1.5 dBTP limiter. |
| `render.sh` | Parallel capture, then blend (motion blur), the optional lens pass, and the ffmpeg encode. |
| `out/` | The rendered ads. |

## Voice
Higgsfield **Seed Audio 1.0**, preset voice **Ainsley** (`731b4ffe-e95e-59f4-8c00-81608936091f`), `speech_rate` 40, one take
(`audio/vo_take_ainsley.wav`). It is placed at 1.321×; Whisper transcribes all 34 words correctly from the stretched track.

## Re-render
The scripts need `TOOLS` to point at a folder holding the skill's `capture.mjs`, `blend.py`, `lens.py` and `sound_kit.py`,
and `HFT_BROWSER` at a Chromium binary. On Linux as root, that binary must be a wrapper that adds `--no-sandbox`.

Rebuild the voiceover:

```bash
python3 audio/build_vo.py audio/vo_take_ainsley.wav audio/vo_cuts_ainsley.json audio --end 8.33
```

Rebuild the mix:

```bash
python3 audio/mix.py <track.mp3> audio/vo.wav "$TOOLS" audio
```

Render a fast draft (no motion blur):

```bash
TOOLS=… HFT_BROWSER=… ./render.sh out/draft_nosound.mp4 1 4
```

Render the final, with 4 sub-frames everywhere and 12 in the fast windows, plus the lens pass:

```bash
LENS=1 LENS_ARGS="--sched lens.json" TOOLS=… HFT_BROWSER=… ./render.sh out/final_nosound.mp4 4 4 12 "1.25-1.95,2.15-2.7,8.05-8.8,9.5-10.1,12.4-12.75,13.4-13.9,16.35-17.05"
```

Then mux the mix onto the video:

```bash
ffmpeg -i out/final_nosound.mp4 -i audio/mix.m4a -map 0:v -map 1:a -c copy -movflags +faststart out/final.mp4
```

Open `film/index.html?t=8.5` in Chrome to preview any moment. Add `&only=s5` to show just one scene.

## Notes
- **Third-party logos (the client's request):** the "here," and "there," windows carry the real Spotify logo (`film/assets/spotify_logo.svg`,
  from the Iconify `logos` set) and the SoundCloud cloud mark (`film/assets/soundcloud_mark_white.svg`, from simple-icons) with SOUNDCLOUD set in
  Inter Display. The other services in the wall are plain-text names. Using other companies' logos in a paid ad can trigger TikTok ad
  review (third-party IP) or a trademark complaint. To get a logo-free cut, change the `name === 'Spotify'` / `'SoundCloud'` branches in
  `film/scenes/s2_apps.js` back to plain text. TikTok appears only as a word.
- Every app screen is rebuilt from the real Tikify UI (`app.js` / `styles.css`): Add sound, Find sound, the preview card,
  Save to library, the "Saved to Edits" toast, Your Library, the mini player and the full-screen player.
