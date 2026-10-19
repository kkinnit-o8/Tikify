# Tikify 🎵

Spotify, but for TikTok sounds. Copy a TikTok link, save the sound, and play it from your own playlists — even offline.

> Tikify is an independent project. It is **not affiliated with, endorsed or sponsored by TikTok, ByteDance or Spotify**. TikTok is a trademark of ByteDance Ltd.; Spotify is a trademark of Spotify AB.

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

The app uses relative paths, so it works under any repo name. Only the link-preview tags in
`index.html` (`og:url`, `og:image`) name the live address, because they must be absolute: edit them
if the site moves. `404.html` sends mistyped or path-style links (like `/Tikify/add`) into the app.

## Releasing an update
Just push. The service worker (`sw.js`) serves the app from its cache, so it opens instantly and offline,
and on each launch it checks the server for changed files. When it finds a new release it downloads
the whole set, and the app shows **"A new version of Tikify is ready — Reload"**; otherwise the new
version is used from the next launch. If a release breaks the app's scripts, the service worker still
checks by itself a few seconds after launch, so a fixed release reaches everyone on their next launch.
No version numbers to bump: just add any new app file (script, stylesheet, icon) to the `SHELL` list in `sw.js`.

Don't add an `id` to `manifest.webmanifest` or change its `start_url`: together they are the installed
app's identity on Android, and a different one makes Chrome stop updating installed copies.

## Install as an app
- **iPhone (Safari)**: Share → *Add to Home Screen* (on iOS 26, tap ⋯ first, then Share).
  Install **before** saving sounds: the Home Screen app has its own storage, separate from Safari.
  Sounds saved in Safari can be moved over with **Export backup** in Safari and **Import backup** in the app.
- **Android (Chrome)**: menu ⋮ → *Install app*.
  Installed it while Tikify still had a black icon? That copy keeps the old icon and doesn't get the home screen
  shortcuts, because the app's identity changed once. To fix it, export a backup (in case uninstalling
  clears the app's data), uninstall Tikify, install it again from Chrome, and import the backup if your
  sounds are gone.

## Notes
- No server or build step: it's plain HTML, CSS and JavaScript.
- Sound lookups use the free public [tikwm.com](https://www.tikwm.com) API. If it's down or rate-limited, try again in a moment.
- Use the link of a TikTok **video** (Share → Copy link). A sound's own page or a profile link has no single sound to read: open a video that uses the sound and share that instead.
- Your library is stored only in your browser on that device. Use **Export backup** to move it to another device.

## Privacy
- Your library (sounds, covers, playlists) stays on your device. There is no account, no Tikify server and no analytics.
- A link you look up is sent to [tikwm.com](https://www.tikwm.com), a third-party service, to find its sound.
  The audio and cover are then downloaded from TikTok's servers.
- Save sounds for your own listening only, and respect the rights of their creators.

## Run locally
Serve the folder *above* the repo, so the app runs under `/Tikify/` like on GitHub Pages:
```sh
cd ..
python3 -m http.server 8000
# open http://localhost:8000/Tikify/
```
