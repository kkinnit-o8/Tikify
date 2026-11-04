# Tikify: future look ("Afterglow")

Concept images for a more premium Tikify, and ad creatives built from them. Nothing here is used by
the app; the screens are mockups to decide on before changing `styles.css`.

| File | What it is |
| --- | --- |
| `overview.png` | All five screens, palette and type on one board (2400×1600) |
| `before-after.png` | Today's Library and player next to the concept |
| `screens/*.png` | Library, Playlist, Now playing, Add a sound, Lock screen (1179×2556, iPhone 3×) |
| `ad-story.png` | 9:16 story / Reels / TikTok ad: "Your TikTok sounds. Played like music." |
| `ad-steps.png` | 9:16 how-it-works ad: "Copy. Paste. Play anywhere." |
| `ad-square.png` | 1:1 feed ad: "Screen off. Sound on." |
| `ad-portrait.png` | 4:5 feed ad: "Every sound you love. Finally, a library." |
| `icon.png` | New mark (sound bars that form a play button) at every size |

## What changes
- **Own colour, not Spotify green.** One signature gradient, ember → magenta → violet, on a warmer, deeper black (`#08070B`).
  It also drops TikTok's exact pink and cyan from the brand.
- **Colour comes from the cover.** Player, playlist and lock screen glow with the sound's own artwork.
- **Waveform scrubber** instead of a plain progress bar: it says "sound" at a glance.
- **Floating dock**: mini player and tab bar float above the content with rounded, frosted surfaces.
- **Bigger, rounder artwork** (20–28px corners), heavier titles (Inter Display), and one serif italic
  (Instrument Serif) kept for the emotional line in ads and headers.
- **"Saved offline"** is shown wherever it's true, because it's the reason to use Tikify.

## Rebuild the images
Covers are generated art (`src/covers.html`), screens and ads are HTML/CSS (`src/`), and
`render.js` screenshots them with Playwright:

```bash
node design/future-look/render.js            # everything
node design/future-look/render.js screens    # or one stage: covers | screens | ads
```

Each stage uses the one before (covers → screens → ads). `covers/` isn't committed, so run the full
render once after cloning. Fonts (OFL) are in `fonts/`.
Song names and creators in the mockups are made up.
