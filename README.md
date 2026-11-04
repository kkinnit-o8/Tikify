# Tikify 🎵

Spotify, but for TikTok sounds. Copy a TikTok link, save the sound, and play it from your own playlists — even offline.

> Tikify is an independent project. It is **not affiliated with, endorsed or sponsored by TikTok, ByteDance or Spotify**. TikTok is a trademark of ByteDance Ltd.; Spotify is a trademark of Spotify AB.

## Features
- **Add sounds from TikTok links**: paste a link (or use the paste button), preview, rename, and save.
- **Playlists**: create, rename, delete, reorder, and add sounds to as many playlists as you like.
- **Spotify-style player**: mini player, full-screen player, shuffle, repeat (all / one), seek.
- **Plays in the background**: keeps going from sound to sound with the screen locked or another app open,
  and the lock screen's buttons skip to the previous or next sound.
- **Works offline**: sounds are downloaded and stored on your device (IndexedDB).
- **Installable PWA**: add it to your home screen. On Android you can share a TikTok straight to Tikify.
- **Backup**: export/import your whole library as a file (menu ⋮ on the Library page).

## Put it on GitHub Pages
1. Go to the repo's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick `master` and folder `/ (root)`, then **Save**.
3. After a minute the app is live at `https://<your-username>.github.io/Tikify/`.

The app uses relative paths, so it works under any repo name. The live address, `https://tikify.no`
(set in `CNAME`), appears only where it must be absolute: the canonical, `hreflang` and link-preview
tags in `index.html` and the guide pages, `robots.txt` and `sitemap.xml`. Update all of them if the
site moves. Keep **Enforce HTTPS** ticked in **Settings → Pages**, so the site has one address.
`404.html` sends mistyped or path-style links (like `/Tikify/add`) into the app.

## Search engines and guide pages
The app's own page shows whatever is saved on the device, so a search engine (which has saved
nothing) sees an empty library. This is what it finds instead:
- **`index.html`**: the title and description search results show (`render()` in `app.js` puts the
  title back on the Library view), the canonical address, structured data (JSON-LD) and a
  `<noscript>` introduction for crawlers that don't run JavaScript.
- **The empty Library** shows the same introduction, with links to the guides (`libraryIntro()` in
  `app.js`). Only in a browser: the installed app doesn't show it.
- **Guide pages**: plain HTML that works without JavaScript, styled by `pages.css`:
  `how-to-save-tiktok-sounds/`, `listen-to-tiktok-sounds-offline/`, `tiktok-sound-playlist/`,
  `install/`, `faq/`, `privacy/`, and `no/` in Norwegian.
- **`robots.txt`** and **`sitemap.xml`**.

To add a guide page, copy one of the folders and change its title, description, canonical, `og:url`
and breadcrumb. Add it to `sitemap.xml`, then link it from the other pages' footers, `libraryIntro()`
and the `<noscript>` in `index.html`. When a page changes, update its `<lastmod>` in `sitemap.xml`.
Guide pages aren't part of the app, so they aren't in `sw.js`'s `SHELL` and need internet.

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

## Look
The "Afterglow" design: a warm, deep black (`#08070B`) and one gradient, ember → magenta → violet,
used for the mark, play buttons and progress. The colours are the custom properties at the top of
`styles.css` (and `pages.css` for the guide pages); the concept boards are in `design/future-look/`.
- **Fonts** are self-hosted in `fonts/` (Inter, and Instrument Serif italic for one line here and there)
  and listed in `sw.js`'s `SHELL`, so the app looks the same offline.
- **Keep `background_color` in `manifest.webmanifest` equal to `--strip` in `styles.css`** (`#121212`).
  On iOS 26 that colour fills the strip under the tab bar of a Home Screen app, and iOS keeps the one it
  read when the app was added, so changing it would leave older installs with a mismatched band.
- **Icons and the link preview** (`icons/`) are drawn by `design/future-look/src/brand.html`:
  `node design/future-look/render.js brand`.
- **Store screenshots** (`screenshots/`) come from the real app filled with a demo library:
  run `node design/future-look/render.js covers`, serve the app as below, then `node design/screenshots.js`.

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
