# Tikify 🎵

Spotify, but for TikTok sounds. Copy a TikTok link, save the song, and play it from your own playlists — even offline.

## Features
- **Add sounds from TikTok links**: paste a link (or use the paste button), preview, rename, and save.
- **Playlists**: create, rename, delete, reorder, and add sounds to as many playlists as you like.
- **Spotify-style player**: mini player, full-screen player, shuffle, repeat (all / one), seek, lock-screen controls.
- **Works offline**: sounds are downloaded and stored on your device (IndexedDB).
- **Installable PWA**: add it to your home screen. On Android you can share a TikTok straight to Tikify.
- **Backup**: export/import your whole library as a file (menu ⋮ on the Library page).

## Put it on GitHub Pages
1. Go to the repo's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick `master` and folder `/ (root)`, then **Save**.
3. After a minute the app is live at `https://<your-username>.github.io/Tikify/`.

## Install as an app
- **iPhone (Safari)**: Share → *Add to Home Screen*.
- **Android (Chrome)**: menu ⋮ → *Install app*.

## Notes
- No server or build step: it's plain HTML, CSS and JavaScript.
- Sound lookups use the free public [tikwm.com](https://www.tikwm.com) API. If it's down or rate-limited, try again in a moment.
- Your library is stored only in your browser on that device. Use **Export backup** to move it to another device.

## Run locally
```sh
python3 -m http.server 8000
# open http://localhost:8000
```
