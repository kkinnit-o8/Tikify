# Tikify ad on Higgsfield: "WHYYYYYYY" (ink to power-up)

A 30.17 s TikTok at 1080×1920 and 30 fps. An original anime girl scrolls on a rainy black-and-white rooftop while the hook asks the question. The music cuts out and she screams **WHYYYYYYY**. On the drop her aura explodes in Tikify pink, purple and cyan and colour floods the world. The rest of the ad gives the answer, cut to the beat.

**Cost: 49.5 credits for the whole ad** (3 Kling 3.0 Omni generations at 1080p). The hard stop is 90, so at least 10 credits are never spent.

> **Step 0 (free, do this first):** open higgsfield.ai and read the credit counter. It must say **100**. This account matches Higgsfield's "3-day Plus trial for MCP", whose credits "exist only in the MCP - they won't appear or work anywhere on higgsfield.ai". If the site shows less, don't buy anything; go to 2.5. That trial renews at $49 after 3 days unless you cancel it.

All times are seconds in `tikify-ad-audio.mp3`. "f" numbers are frames at 30 fps (12.60 s = f378, shown as 12:18 in CapCut).

### Quick start (the whole job on one screen)
1. **Settings for every generation:** Kling 3.0 Omni (Elements tab), **1080p**, **9:16**, Multi-shot **On** (3 s per shot), Sound **Off** in Shot 1's box, Variants **1**. Details and traps are in 2.1.
2. **Gen 1** (the button must read **18**): attach `refs/08-ink-mood.png`, then paste the 4 boxes from `prompt-part1.txt`.
3. Pause on a clear frame of the girl and screenshot it as **`char-ref.png`**.
4. **Gen 2** (**9**): attach `char-ref.png`, then paste the 2 boxes from `prompt-part2.txt`.
5. Screenshot a clear full-colour frame of her and the aura as **`char-ref-colour.png`**.
6. **Gen 3** (**22.5**): attach `char-ref-colour.png`, `refs/01-tikify-logo.png`, `refs/05-phone-add-sound.png` and `refs/09-cover-art.png`, in that order. Then paste the 5 boxes from `prompt-part3.txt`.
7. **CapCut:**
   - Put `tikify-ad-audio.mp3` at 0:00 and mute the clips.
   - Lay out the clips, overlays and real UI inserts using the table in section 4. `storyboard.png` shows the order; `animatic.mp4` (sent in chat) shows the timing.
   - Export at 1080×1920, 30 fps.

**Total: 49.5 credits.** If you'd rather attach the MP3 on Higgsfield, use Option B (2.6) instead of Gens 1-2, for 60.5 in total.

---

## 1. What you need

**Audio files.** These are the two MP3 files attached to Claude's reply in this chat; they are not stored in the repo. Save both somewhere outside the Tikify repo, for example your Downloads or your CapCut project folder. Don't put them in the repo: it is published on GitHub Pages and the track isn't licensed.

| File | Length | Where it goes |
|---|---|---|
| `tikify-ad-audio.mp3` | 30.26 s. Scream at 10.49, drop at 12.60, music stops at 30.165 | Your **video editor** (CapCut or the TikTok editor), at 0:00, under the whole ad. Always. |
| `tikify-ad-audio-part1.mp3` | 14.83 s (0.00-14.83 of the track) | **Higgsfield, Option B only** (2.6), as the audio reference |

In the main plan the MP3 goes into the editor, not into Higgsfield, for two reasons:
- None of the 1080p models that can make this whole ad within 100 credits accepts an audio reference. Kling 3.0 Omni, used here, accepts images only.
- Models that do take an audio reference don't pass your track through. They generate new sound.

So the original MP3 always ends up in the editor anyway, and there every cut lands on its exact frame.

**Images to attach on Higgsfield.** The attach order sets the @image number. The files are in `marketing/higgsfield-ad/refs/`.

| Gen | @image1 | @image2 | @image3 | @image4 |
|---|---|---|---|---|
| 1 INK | `08-ink-mood.png`: texture only (rain, grain, B&W contrast; no letters or logos) | | | |
| 2 SCREAM → DROP | `char-ref.png`, your still from Gen 1. If no frame is clean: the least-bad Gen 1 frame where her face shows, cropped tight to her head. Never use `08-ink-mood.png` here: it has no girl in it, and the Gen 2 boxes describe her as @image1 | | | |
| 3 POWER | `char-ref-colour.png`, your still from Gen 2. If no frame is clean: `char-ref.png` | `01-tikify-logo.png`: the app icon (sky icon in Shot 5) | `05-phone-add-sound.png`: the real Add-sound screen with a pasted TikTok link (Shot 1) | `09-cover-art.png`: only the 2×2 cover art, cropped from the real Playlist screen with no UI around it (cover style for the flying cards in Shot 2) |

**Two stills you make yourself (free).** They keep the character the same across generations.
- `char-ref.png`: after Gen 1, pause on a frame where her face and hair are clear (Shot 2 or 3, clip 3-9 s). Screenshot it, crop to 9:16 and save as PNG.
- `char-ref-colour.png`: after Gen 2, pause in Shot 2 (clip 4-6 s) on a clear full-colour frame of her and the aura.

**Also used in the editor:**
- Editor only, never uploaded to Higgsfield:
  - `refs/02-phone-library.png`, `refs/03-phone-playlist.png` and `refs/04-phone-player.png` as real UI inserts. Gen 3 gets only the cover-art crop of 03 (`refs/09-cover-art.png`), not the full screen
  - `refs/06-why-type-style.png` for a 2-frame scream strobe
  - `refs/07-end-card.png` as the end card
  - `overlays/t1`-`t4` for the locked hook text
  - `overlays/c1`-`c11` for the post-drop captions (all 11 PNGs are in `overlays/`)
- Uploaded in Gen 3 **and** reused in the editor:
  - `refs/01-tikify-logo.png` (@image2) for the exact icon slam
  - `refs/05-phone-add-sound.png` (@image3) as a real UI insert

`storyboard.png` shows all 26 beats from section 4 as a contact sheet, built from these files.

---

## 2. Higgsfield settings

### 2.1 Settings for all three generations

| Setting | Value | Watch out |
|---|---|---|
| Model | **Kling 3.0 Omni → Elements tab** (`kling_o3_image_reference`, up to 7 images) | Not the **Frames** tab (`kling_o3_flf`, start and end frames only: the @image refs would not apply). Not plain "Kling 3.0", not Kling 3.0 Turbo, not Seedance |
| Resolution | **1080p** | Choosing the model switches this to **4K**, which costs 90 for one 15 s clip. Set 1080p again every time. The picker reads 720p / 1080p / 4K |
| Aspect ratio | **9:16** | The form's stored default is 1:1 |
| Multi-shot | **On**, every shot **3 s** | This model is always Custom, so there is no Auto/Custom choice to look for. Web limits: each shot at least 3 s, at most 6 shots, at most 15 s in total |
| Sound | **Off**, set in **Shot 1's box** | New shots start with sound on, and the request uses Shot 1's setting. Off costs 1.5/s, on costs 2/s |
| Variants | **1** | The price is multiplied by it |
| Enhance prompt | Off, if the option is there | Keeps your shot text exactly as written |

In multi-shot mode only the shot boxes are sent, with no shared header. That is why every box in section 3 repeats the style, the character and the negatives. After pasting a box, delete each `@imageN` and insert it again from the **@** menu, so it turns into a linked chip.

### 2.2 The three generations

| Gen | Duration and shots | The button must read | What it covers |
|---|---|---|---|
| 1 INK | 12 s = 4 × 3 s | **18** | 0.00-10.49: hook plates. The breath is a free freeze frame |
| 2 SCREAM → DROP | 6 s = 2 × 3 s | **9** | 10.49-14.83: scream, drop and transformation |
| 3 POWER | 15 s = 5 × 3 s | **22.5** | 14.83-28.05: features, cut between real UI inserts |
| End card | none | 0 | 28.05-30.17: `refs/07` as a still |

Generate them in order 1 → 2 → 3, because each one needs a still from the one before.

### 2.3 Credit budget (whole video ≤ 100)

| Line | Credits | Running total |
|---|---|---|
| Gen 1 | 18 | 18 |
| Gen 2 | 9 | 27 |
| Gen 3 | 22.5 | **49.5 = the whole ad** |
| Fix pool: single-shot re-rolls at 4.5 each (up to 9) | up to 40.5 | **90 = hard stop** |
| Never spent | 10 | 100 |

**Rules**
1. **Make all three before re-rolling anything.** At 49.5 the whole ad exists, and every credit after that is optional.
2. **Before every click,** check that credits spent so far plus the number on the button is **90 or less**. What is left after the click must also cover every generation you haven't made yet.
3. **Re-roll one shot, not a whole clip.** Turn multi-shot **Off**, set duration to **3**, and keep the same settings and the same images in the same order. Paste only that shot's box into the main prompt. **With multi-shot Off, Shot 1's box disappears, and Sound comes from the main Sound toggle under the prompt, which defaults to On. Switch it Off.** Expected **4.5**; 6 = sound on; 18 = 4K; 3 = 720p; 5.25 = plain Kling 3.0; 3.75 = Frames tab (the re-roll table in 2.4 has the fixes). You can also use this as a fallback if multi-shot ever refuses a clip: make each shot on its own, which costs the same in total.
4. **Re-roll in this priority order:**
   1. Gen 2 Shot 2 (the drop)
   2. Gen 2 Shot 1 (the scream)
   3. Gen 3 Shot 4 (the THAT'S WHY. face)
   4. any shot with garbled UI or stray letters you can't crop
   5. Gen 1 shots

   Try the free fixes in 5.2 first.
5. Higgsfield refunds failed or blocked generations ("Credits are returned for failed generations"), so count only the clips you actually received.

**Example ledger:** first pass 49.5 → drop re-roll 54 → scream re-roll 58.5 → Gen 1 Shot 3 re-roll 63. That leaves 27 before the stop.

### 2.4 Check the price on the Generate button before you press it

| The button shows (Gen 1 / 2 / 3) | What it means | What to do |
|---|---|---|
| **18 / 9 / 22.5** (22.5 may show as 23) **and** the model chip reads Kling 3.0 Omni (Elements tab) **and** resolution reads 1080p | Correct. The same numbers also appear for plain Kling 3.0 or Kling 3.0 Turbo at 720p, so the price alone doesn't prove the settings | Generate |
| 72 / 36 / 90 | 4K is selected | Choose **1080p** |
| 24 / 12 / 30 | Sound is on, **or** Kling 3.0 Turbo (1080p) is selected, **or** plain Kling 3.0 at 720p with sound on | Set **Sound off** in Shot 1's box. If the chip doesn't read Kling 3.0 Omni at 1080p, switch to **Kling 3.0 Omni** (Elements tab), **1080p** |
| 21 / 10.5 / 26.25 | Plain Kling 3.0 is selected | Switch to **Kling 3.0 Omni** (Elements tab) |
| 15 / 7.5 / 18.75 | The **Frames** tab is open (or Omni at 720p with sound on) | Switch to the **Elements** tab, 1080p, Sound off |
| 12 / 6 / 15 | 720p is selected | Choose 1080p. 720p is only the backup in the "Higher" row below |
| 2-4 × the correct number | Variants is above 1 | Set Variants to **1** |
| Higher, with every setting right | The price has changed | Switch to **720p** and expect **12 / 6 / 15** (33 for the whole ad). If 720p also costs more, **stop and generate nothing** |
| "Generate for free instead of X credits" | An unlimited window applies | Go ahead; it costs 0 |

**Re-roll prices** (one 3 s shot, multi-shot Off, rule 3 in 2.3):

| The button shows | What it means | What to do |
|---|---|---|
| **4.5** **and** the chip reads Kling 3.0 Omni (Elements tab) **and** 1080p | Correct (4.5 is also plain Kling 3.0 or Turbo at 720p, so check the chip) | Generate |
| 6 | Sound is on (the main Sound toggle under the prompt), or Kling 3.0 Turbo at 1080p, or plain Kling 3.0 at 720p with sound on | Switch the main **Sound** toggle Off. If the chip isn't Kling 3.0 Omni at 1080p, switch to it |
| 18 | 4K is selected | Choose **1080p** |
| 3 | 720p is selected | Choose **1080p** |
| 5.25 | Plain Kling 3.0 is selected | Switch to **Kling 3.0 Omni** (Elements tab) |
| 3.75 | The **Frames** tab is open | Switch to the **Elements** tab |

### 2.5 If the website doesn't show your 100 credits
Then the credits only work through MCP. The connector that built this kit can only read, so you would need a Higgsfield MCP client that can generate. The kit has a ready-to-run request file for each generation, so you don't have to rebuild anything by hand:

| File | Generation | Expected credits |
|---|---|---|
| `gen1.json` | Gen 1 INK, 12 s, 4 shots | 18 |
| `gen2.json` | Gen 2 SCREAM → DROP, 6 s, 2 shots | 9 |
| `gen3.json` | Gen 3 POWER, 15 s, 5 shots | 22.5 |

Each file holds `model_id: kling_o3_image_reference`, `aspect_ratio: 9:16`, `mode: pro` (pro is 1080p), `sound: off`, `multi_shots: true`, the duration, a `multi_prompt` with the exact box texts from section 3 at `duration: 3`, and the images in attach order as `medias` with role `image_references`. Give the generating client the file for that generation: it uploads the images listed in `request.medias` in that order (they become @image1, @image2, …) and sends every other value in `request` unchanged. `char-ref.png` and `char-ref-colour.png` are the stills you make yourself (section 1).

The budget rules stay the same: check `expected_credits` against the 90 hard stop before each run. Unlimited never applies through MCP.

### 2.6 Option B: attach the MP3 on Higgsfield (secondary)
Use this only if you want the model to *hear* the scream and the drop. It replaces Gen 1 and Gen 2 with one clip that follows the audio. Gen 3 stays exactly as above. Pick one path and don't mix steps from the two.

| Setting | Value |
|---|---|
| Model | higgsfield.ai: pick **Seedance 2.0 Fast** (its own entry in the model list; it defaults to 720p). MCP: `model_id: seedance_2_0` with `mode: fast` |
| Resolution / aspect | **720p / 9:16** |
| Duration | **15** |
| Generate audio | On (free). It is only a preview and gets muted in the edit |
| Bitrate | High (free) |
| Genre | Epic (MCP only; skip it if the web form doesn't show it) |
| Variants | 1 |
| @image1 | `refs/08-ink-mood.png`. Seedance needs at least one image next to the audio |
| @audio1 | `tikify-ad-audio-part1.mp3`: 14.83 s, under the 15 s limit |
| Prompt | `prompt-option-b.txt` (3.4) |

- **The button must read 38.**
  - 180 or 68: you picked plain **Seedance 2.0** (1080p or 720p). Switch to **Seedance 2.0 Fast**.
  - 15 (480p) or 105 (1080p): choose **720p**.
  - 53: the old list price is back. **Skip Option B** and do Kling Gen 1 and Gen 2 instead.
  - Any other number: skip Option B.
- **Budget:** 38 + Gen 3 (22.5) = **60.5**. Never re-roll the Seedance clip. If it comes out unusable, make Kling Gen 1 and Gen 2 (27) for a total of **87.5**, then stop.
- **If Higgsfield blocks the MP3** as protected content, you are not charged. Use the Kling path.
- **For Gen 3,** take `char-ref-colour.png` from Option B's last shot, the colour transformation.
- **In the edit:**
  - Put the clip at 0:00; it covers 0.00-14.83. Mute it and keep the original MP3 underneath.
  - If its white flash doesn't land on f378, split the clip at 10.49 (f315), then close the timing on the main track with no gap or overlap:
    - Flash **N frames late**: delete N frames just after the split. The clip is 15 s but only 14.83 s is used, so its spare tail (5 frames) still reaches f445 for N up to 5. For a bigger N, freeze its last frame until f445.
    - Flash **N frames early**: freeze the frame just before the split for N frames. Trim the clip's tail so it still ends at f445.
- **Trade-off:** 720p Fast is softer than Kling at 1080p. The grey grade and grain hide most of that before the drop.
- **Why not one 30 s clip with the full MP3?** The only model that fits 30 s under 100 credits is Seedance 2.5 at 480p. That costs 90, leaves no retake, and looks soft on TikTok.

---

## 3. Prompt

The prompt files contain prompt text only, with one paragraph per shot box:

| File | Contents |
|---|---|
| `prompt-part1.txt` | Gen 1, 4 boxes |
| `prompt-part2.txt` | Gen 2, 2 boxes |
| `prompt-part3.txt` | Gen 3, 5 boxes |
| `prompt.txt` | all 11 boxes in paste order |
| `prompt-option-b.txt` | Option B only |

Character counts: Gen 1 boxes 476, 499, 499, 496; Gen 2 493, 490; Gen 3 462, 461, 443, 500, 471; Option B 1,896. The limit is 512 per box. Option B is kept under 2,500 by choice; Seedance allows far more.

The same box texts are in `gen1.json`, `gen2.json` and `gen3.json` (2.5), for an MCP client.

None of the prompts asks for on-screen words. All copy comes from the exact-copy overlays, so the spelling is always right.

### 3.1 Gen 1 INK: 12 s, 4 × 3 s, @image1 = `08-ink-mood.png`
**Shot 1 (3 s), eyes (hook)** (476 characters)
```text
9:16 2D anime, crisp 1080x1920, strictly black and white, bold ink, heavy film grain, screentone. @image1 is texture only (rain, grain, contrast); never show it. Original girl, not any existing anime character: black wolf-cut hair, white fringe tips, silver hoop earring, black hoodie, white earbuds. Extreme close-up of her eyes lit from below by a cold phone glow, rain on her lashes, white speed lines rushing to the centre. Fast push-in. No text, letters, logos or colour.
```
**Shot 2 (3 s), rooftop wide** (499 characters)
```text
9:16 2D anime, crisp 1080x1920, strictly black and white, bold ink, heavy film grain, screentone. @image1 is texture only (rain, grain, contrast); never show it. Original girl, not any existing anime character: black wolf-cut hair, white fringe tips, silver hoop earring, black hoodie, white earbuds. Rainy night rooftop above a grey city. Wide shot: she sits hunched on the ledge, lit by a plain black phone whose screen faces away, thumb scrolling. Slow push-in. No text, letters, logos or colour.
```
**Shot 3 (3 s), earbud yank** (499 characters)
```text
9:16 2D anime, crisp 1080x1920, strictly black and white, bold ink, heavy film grain, screentone. @image1 is texture only (rain, grain, contrast); never show it. Original girl, not any existing anime character: black wolf-cut hair, white fringe tips, silver hoop earring, black hoodie, white earbuds. Close-up: she yanks one earbud out and glares at the phone, jaw clenched, sweat drop, diagonal rain, harsh screentone shadows; the screen faces away. Slight shake. No text, letters, logos or colour.
```
**Shot 4 (3 s), she rises** (496 characters)
```text
9:16 2D anime, crisp 1080x1920, strictly black and white, bold ink, heavy film grain, screentone. @image1 is texture only (rain, grain, contrast); never show it. Original girl, not any existing anime character: black wolf-cut hair, white fringe tips, silver hoop earring, black hoodie, white earbuds. Low angle: she slowly stands up on the rooftop ledge, phone hand dropping, fringe hiding her eyes, wind whipping the hoodie, lightning behind her. Slow tilt up. No text, letters, logos or colour.
```

### 3.2 Gen 2 SCREAM → DROP: 6 s, 2 × 3 s, @image1 = `char-ref.png`
**Shot 1 (3 s), the scream** (493 characters)
```text
9:16 2D anime, crisp 1080x1920, bold ink, heavy film grain. Same original girl as @image1 (black wolf-cut hair, white fringe tips, black hoodie), not any existing anime character. Strictly black and white. Extreme low angle, rainy rooftop at night: she throws her head back and screams at the storm, mouth wide open, white lightning crackling around her, puddles lifting, hair whipping up, shake building; in the last half second everything is sucked into the centre. No text, logos or colour.
```
**Shot 2 (3 s), the drop: transformation** (490 characters)
```text
9:16 2D anime, crisp 1080x1920, bold ink, heavy film grain. Same original girl as @image1 (black wolf-cut hair, white fringe tips, black hoodie), not any existing anime character. Opens on one pure white impact flash, then full colour: a shockwave bursts from her chest into a blazing aura of hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee, hair lifting, eyes glowing; colour floods the grey world and the city below lights up in neon. Fast 180-degree orbit. No text, logos or watermark.
```

### 3.3 Gen 3 POWER: 15 s, 5 × 3 s, @image1 = `char-ref-colour.png`, @image2 = `01`, @image3 = `05`, @image4 = `09`
**Shot 1 (3 s), phone powers up** (462 characters)
```text
9:16 2D anime, crisp 1080x1920, neon night in hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee. Same original girl as @image1 (black wolf-cut hair, glowing tips, black hoodie) with a pink-purple-cyan aura; not any existing anime character. On the rooftop she lifts her phone to camera; her aura spirals into it and the screen blazes on, showing exactly the screen in @image3, unchanged. Fast push-in until the phone fills the centre. No new text or other logos.
```
**Shot 2 (3 s), playlist cards** (461 characters)
```text
9:16 2D anime, crisp 1080x1920, neon night in hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee. Same original girl as @image1 (black wolf-cut hair, glowing tips, black hoodie) with a pink-purple-cyan aura; not any existing anime character. Medium shot: she spins on the rooftop as square album-cover cards with the bubble art from @image4 fly out of her phone and orbit her in a glowing ring. Fast orbit. The phone screen is only a soft glow. No text or logos.
```
**Shot 3 (3 s), offline subway** (443 characters)
```text
9:16 2D anime, crisp 1080x1920, neon night in hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee. Same original girl as @image1 (black wolf-cut hair, glowing tips, black hoodie) with a pink-purple-cyan aura; not any existing anime character. Side tracking shot: she rides an empty underground subway car at night, earbuds in, phone screen only a soft glow, calm aura, confident smile, tunnel lights streaking past the windows. No text or logos.
```
**Shot 4 (3 s), THAT'S WHY. face** (500 characters)
```text
9:16 2D anime, crisp 1080x1920, neon night in hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee. Same original girl as @image1 (black wolf-cut hair, glowing tips, black hoodie) with a pink-purple-cyan aura; not any existing anime character. Extreme low angle on the rainy rooftop, same pose and framing as the scream shot, but now calm: she looks down into the camera with a confident smirk, eyes glowing pink and cyan, hair floating in the aura, sparks drifting past. Slow push-in. No text or logos.
```
**Shot 5 (3 s), icon in the sky** (471 characters)
```text
9:16 2D anime, crisp 1080x1920, neon night in hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee. Same original girl as @image1 (black wolf-cut hair, glowing tips, black hoodie) with a pink-purple-cyan aura; not any existing anime character. Back on the rooftop she raises her phone to the sky; a giant glowing app icon like @image2 (rounded square, pink-purple-cyan gradient, white music note) forms in the clouds above the city. Camera cranes up. No text or other logos.
```

### 3.4 Option B only: Seedance 2.0 Fast, 720p, 15 s, @image1 = `08-ink-mood.png`, @audio1 = `tikify-ad-audio-part1.mp3`
Pasted `@audio1` text does not link by itself. After pasting, delete `@image1` and `@audio1` and insert them again from the **@** menu.
```text
Vertical 9:16 anime music video, crisp 1080x1920 look, 2D anime with bold ink lines and heavy film grain. @image1 is a texture reference only (rain, grain, black-and-white contrast); never show it. ORIGINAL character, not from any existing anime: a teenage girl with black shoulder-length wolf-cut hair and bleached white fringe tips, sharp narrow eyes, a small silver hoop earring, an oversized black hoodie and wired white earbuds. Cut to the music in @audio1: tense during the groove, frozen when it goes quiet, explosive on the scream and on the bass drop.

Shot 1: black and white. Extreme close-up of her eyes, lit from below by a cold phone glow, rain on her lashes, white speed lines rushing to the centre. Fast push-in.

Shot 2: black and white. Rainy rooftop at night above a grey city. She sits hunched on the ledge, her face lit by a plain black phone whose screen faces away from camera, thumb scrolling fast.

Shot 3: black and white. Close-up: she yanks one earbud out and glares at the phone, jaw clenched.

Shot 4: black and white. Low angle: she slowly stands up on the ledge, phone hand dropping to her side, fringe hiding her eyes, lightning behind her. When the drums stop in @audio1, everything holds still.

Shot 5: black and white. Exactly when the scream starts in @audio1 (about 10.5 seconds), she throws her head back and screams at the storm, mouth wide open, white lightning crackling around her, puddle water lifting, violent camera shake.

Shot 6: on the bass slam in @audio1 (about 12.6 seconds), a white impact flash, then full colour: a blazing aura of hot pink #fe2c55, purple #7b2cbf and cyan #25f4ee bursts from her chest, colour floods the world, the city below lights up in pink, purple and cyan neon, her fringe tips and eyes glow. Fast orbit around her.

Keep her face in the middle of the frame. No text, letters, subtitles, captions, logos or watermark.
```

---

## 4. Script / shot list

The hook copy is locked: T1 **why use SoundCloud** · T2 **or Spotify** · T3 **why!?!?** · T4 **WHYYYYYYY** (W-H plus seven Y's).
Captions sit in the top band (glyphs y ≈ 270-410); c1 is two rows (y ≈ 265-541) over the transformation, with the icon slam below it. T1-T3 sit in the upper middle (glyphs x 154-924, y 563-818). T3 is narrow enough that its glyphs stay at least 30 px inside the frame at 140 %. T4 and c7 are meant to fill the frame. `storyboard.png` shows these beats as a contact sheet.

| Time (frames) | Audio | Visual (source → clip time) | On-screen text | Edit move (free) |
|---|---|---|---|---|
| 0.00-1.58 (f0-46) | Track starts mid-bar; accent at 0.21 | Gen 1 S1 (best 1.58 s of 0-3): extreme close-up of her eyes in the phone glow, speed lines | **T1** why use SoundCloud | T1 slams 115→100 % over f0-3. 104 % punch at f6 |
| 1.58-3.79 (f47-113) | Downbeat 1.58; hits at 1.99 and 2.41 | Gen 1 S2 (3.4-5.6): wide shot, hunched on the rainy ledge, scrolling | T1 | Hard cut at f47. 3-frame 104 % punches at f47, f60, f72 |
| 3.79-5.99 (f114-179) | Downbeat; hits at 4.20 and 4.62 | Gen 1 S3 (6.4-8.6): yanks out an earbud and glares | **T2** or Spotify | T2 slams in at f114. Punches at f126, f139 |
| 5.99-9.03 (f180-270) | Downbeat; hits at 6.40 and 6.82; then 8.20, 8.61, 9.03 | Gen 1 S4 (9-12) at 0.99×: she rises, lightning behind her | **T3** why!?!? | T3 slams in at f180. Punches at f192, f205. Re-slam to 110 / 125 / 140 % with a 2-frame Invert at f246 / f258 / f271 |
| 9.03-10.49 (f271-314) | Drums and 808 stop after the 9.03 hit; only a thin pad remains (quieter, not silent) | **Freeze frame** of S4's last frame | T3 holds, then fades out over f279-284; after that, nothing | Slow zoom 100→118 %, darken −30 %. Thin music = tension |
| 10.49-10.72 (f315-321) | **SCREAM**, burst 1 | Gen 2 S1, starting at clip 0.89 so that clip 3.00 lands on f378 | **T4** WHYYYYYYY | T4 slams 140→100 % over f315-317. Shake effect on |
| 10.72-10.86 (f322-325) | Gap between bursts | Black solid on the track above; the clip keeps running underneath | (T4 hidden) | 4 black frames |
| 10.86-10.93 (f326-327) | Burst 2 | `refs/06` full frame on the track above | (letters are in 06) | 2-frame strobe; T4 back at f328 |
| 10.93-12.06 (f328-361) | Sustained scream, no bass | Gen 2 S1: screaming at the storm, lightning, puddles lifting | T4 | Stretch T4 scale-Y 100→125 % over f332-362. 2-frame Invert at f345. Shake builds |
| 12.06-12.60 (f362-377) | Scream tail; 808 pickup at 12.33 | Gen 2 S1 end: everything sucked into the centre | T4 | Over f370-377, zoom T4 and picture 100→350 % with RGB split |
| **12.60 DROP (f378-380)** | **808 slam, the loudest moment** | **White solid** on the track above | none | 3 white frames, exactly on f378 |
| 12.70-12.77 (f381-382) | Drop | Gen 2 S2's first frames with the Invert effect | none | Anime impact frames |
| 12.77-13.72 (f383-411) | Drop bar | Gen 2 S2 (3.17-4.12): aura erupts in pink/purple/cyan, colour floods the city | none (let it hit) | Saturation 0→100 over f383-393. Shake f378-393 |
| 13.72-14.83 (f412-444) | Clap; 808 at 14.14 | Gen 2 S2 (4.12-5.23) + **`refs/01` icon slam**, about 360 px wide, centred at y ≈ 1020 | **c1** just use Tikify (two rows) | Icon 300→100 % over f412-416 with a ring flash. 110 % punch at f412 |
| 14.83-15.93 (f445-477) | Bar downbeat | Gen 3 S1 (1.6-2.7): lifts the phone, aura pours in, screen blazes until the phone fills the frame | **c2** copy a TikTok link | Hard cut at f445 |
| 15.93-17.03 (f478-510) | Clap; 808 at 16.34 | **Real `refs/05`** insert (match cut from the phone) | **c3** save the sound | Zoom 100→110 %. Punch at f490 |
| 17.03-18.13 (f511-543) | Downbeat | Gen 3 S2 (3.0-4.1): she spins; album-cover cards fly out and orbit her | **c4** your own playlists | Cut at f511 |
| 18.13-19.24 (f544-576) | Clap (strong click) | **Real `refs/03`** insert | c4 (continues) | Shake at f544 |
| 19.24-20.34 (f577-609) | Downbeat | Gen 3 S3 (6.5-7.6): subway car, earbuds in, calm aura | **c5** works offline | Cut at f577 |
| 20.34-21.43 (f610-642) | Clap; 808 at 20.76 | **Real `refs/02`** insert | **c6** free. no account. | Punch at f623 |
| **21.43-23.65 (f643-708)** | **808 HOLD, the second impact**; brightest clap at 22.54 | Gen 3 S4 (9.4-11.6): extreme low angle, same pose and framing as the scream, now calm with a confident smirk and glowing eyes | **c7** THAT'S WHY. (giant, the callback) | 1 white frame at f643. Slam 140→100 % over f643-646. 2-frame white + RGB split at f676. Scale-Y 100→120 % over f693-708 |
| 23.65-24.75 (f709-741) | Phrase B downbeat | **Real `refs/04`** player insert | **c8** that sped-up version | Cut at f709 |
| 24.75-25.85 (f742-775) | Clap; 808 at 25.17 | Gen 3 S2 (4.6-5.7): the card ring, different moment | **c9** that anime edit | Punch at f755 |
| 25.85-28.05 (f776-841) | Downbeat; clap at 26.96; 808 at 27.40 | Gen 3 S5 (12.6-14.8): she raises the phone and a giant icon forms in the clouds | **c10** that mashup (f776-808), then **c11** on repeat. (f809-841) | Punch at f809. If the icon is off-model, lay `refs/01` over it |
| 28.05-30.17 (f842-904) | Last bar; 808 rolls at 29.43 and 29.62; **hard stop at 30.165** | **`refs/07` end card**: Tikify · "Save TikTok sounds. Play them like music." · "Try it free — link in bio" · URL | (built into the card) | Pop 108→100 % over f842-848, then a slow zoom to 104 %. Glow pulses at f883 and f889. **The video ends at f905** and loops back to T1 |

Every caption is a true Tikify feature from the README (TikTok video link, save, playlists, offline, free, no account, repeat) or a kind of sound you can save. There are no user counts, no store badges and no claims about the other apps.

---

## 5. Make it perfect (free)

### 5.1 Assemble (CapCut, about 30 minutes)
1. **Project:** 9:16, 1080×1920, 30 fps.
2. **Audio:** put `tikify-ad-audio.mp3` at 00:00, as one continuous file. **Mute every generated clip**, Option B's included. If a model changed or replaced the music, that doesn't matter, because the only sound in the export is this file.
3. **Markers:** f47, 60, 72, 114, 180, 246, 258, 271, 315, 322, 326, 345, 370, 378, 383, 412, 445, 478, 511, 544, 577, 610, 643, 676, 709, 742, 776, 809, 842, 905.
4. **Main track:** lay the clips out by the Visual column. Cut where the picture actually changes, not at the nominal clip second, because shot boundaries drift by a few frames.
5. **Never delete frames inside Gen 2.**
   - Put the black frames, the `refs/06` strobe, the white frames and the Invert on tracks above it, so clip 3.00 stays on f378.
   - If Gen 2's Shot 2 starts early or late, slide the whole clip until the first frame after its flash sits on f381.
6. **Grade:**
   - An adjustment layer over f0-377 with saturation −100, contrast +20 and film grain.
   - Then saturation keyframed from 0 at f383 to 100 at f393.

   This guarantees black and white before the drop and an exact colour flood on it, whatever the model rendered.
7. **Overlays:** each PNG at position 0,0 and scale 100 %, with the in and out frames from the table in 5.3.
8. **Real UI inserts** (`refs/02`-`05`):
   - Scale **82 %** and move down **120 px**. The phone top then lands at y ≈ 416, just under the caption band.
   - These PNGs are full 1080×1920 frames with their own dark, glowing background, so at 82 % they would show as a hard-edged rectangle. Add **Mask → Rectangle** over the image with about **40 px feather**, so the edges fade out.
   - Background (on the track below): the previous shot's last frame, blurred and darkened 40 %.
   - Zoom 100→110 % across each insert.
9. **Export:** end the project at **30.17 s (f905)**. The music stops at 30.165, so TikTok's loop drops straight back into "why use SoundCloud". Export at 1080×1920, 30 fps, high bitrate.

### 5.2 First-try problems and free fixes

| Problem | Free fix |
|---|---|
| Stray, misspelled or invented text in a clip | The prompts ask for no text, and all copy comes from the overlays. Zoom the clip to 110-120 % to crop the letters out, or mask-blur them. Re-roll that one shot (4.5) only if the letters sit in the middle of the frame |
| Phone screen garbled in Gen 3 S1 | Cut to the real `refs/05` insert earlier (from about 15.40), or lay `refs/05` over the screen with tracking |
| Icon off-model, or the sky icon missing | Lay `refs/01` over it with a glow |
| Colour leaks into the black-and-white part | The grade in 5.1 step 6 fixes it |
| Gen 1's last shot ends weakly before the breath | Freeze an earlier, stronger frame of S4 instead. The zoom and darken still apply |
| Text hard to read over a busy frame | Add a 40 % black solid under T1-T3 or under the caption |
| Character looks different between generations | Use the two stills as @image1. The fast cuts hide small differences. Re-roll the shot (4.5) only if it is clearly a different person |
| Result resembles an existing anime character | Don't post it. Re-roll that shot |
| Shot lengths drift or two shots merge | Cut on the content. Speed changes of 0.9-1.1× are invisible. Fill a short gap with the neighbouring shot zoomed to 104 % |
| A `c` overlay PNG won't import | All 11 are in `overlays/`. If your editor still refuses one, use CapCut text: Inter Display Black (or Montserrat Black), white, about 96 px (c1 and c11 about 140 px, c1 on two rows), a pink→purple→cyan label or glow, centred at x 540, y ≈ 340. Copy the text exactly from 5.3 |

### 5.3 Exact-copy overlays (`marketing/higgsfield-ad/overlays/`)

| File | Text (exact) | In → out (s) | Frames |
|---|---|---|---|
| `t1-why-use-soundcloud.png` | why use SoundCloud | 0.00 → 3.79 | f0-113 |
| `t2-or-spotify.png` | or Spotify | 3.79 → 5.99 | f114-179 |
| `t3-why.png` | why!?!? | 5.99 → 9.50 (fade-out from 9.30) | f180-284 |
| `t4-whyyyyyyy.png` | WHYYYYYYY | 10.49 → 12.60, hidden f322-327 | f315-377 |
| `c1-just-use-tikify.png` | just use Tikify | 13.72 → 14.83 | f412-444 |
| `c2-copy-a-tiktok-link.png` | copy a TikTok link | 14.83 → 15.93 | f445-477 |
| `c3-save-the-sound.png` | save the sound | 15.93 → 17.03 | f478-510 |
| `c4-your-own-playlists.png` | your own playlists | 17.03 → 19.24 | f511-576 |
| `c5-works-offline.png` | works offline | 19.24 → 20.34 | f577-609 |
| `c6-free-no-account.png` | free. no account. | 20.34 → 21.43 | f610-642 |
| `c7-thats-why.png` | THAT'S WHY. | 21.43 → 23.65 | f643-708 |
| `c8-that-sped-up-version.png` | that sped-up version | 23.65 → 24.75 | f709-741 |
| `c9-that-anime-edit.png` | that anime edit | 24.75 → 25.85 | f742-775 |
| `c10-that-mashup.png` | that mashup | 25.85 → 26.96 | f776-808 |
| `c11-on-repeat.png` | on repeat. | 26.96 → 28.05 | f809-841 |

### 5.4 Posting on TikTok
- **Post organically** from a personal or creator account, not as a paid ad (see 6).
- **Caption:**
  `sped-up version not on your music app? Tikify saves TikTok sounds. Not affiliated w/ TikTok, Spotify, SoundCloud. free, link in bio`

  The disclaimer starts at character 68, so it shows before TikTok cuts the caption off with "more" (about 100 characters).
- **Hashtags:** `#tikify #animeedit #phonk #spedup #tiktoksounds`
- **Cover frame:** about 11.5 s, the giant WHYYYYYYY.
- **Labels and links:**
  - Turn on the **AI-generated content** label.
  - Put `https://kkinnit-o8.github.io/Tikify/` in your bio, because the end card says "link in bio".
- **If TikTok mutes or claims the audio:** post the edit silent and add the original sound from TikTok's sound picker, lined up so the scream starts at 10.49.

---

## 6. Notes
- **Paid ads are high risk; post organically.**
  - TikTok's ad policy (updated April 2026) allows comparative claims only "subjected to the provision of evidence or clear disclaimer(s)". It bars subjective negative judgements about a named brand, and "why use SoundCloud or Spotify" can read as one.
  - TikTok's IP policy says: "We do not allow the use of third-party brands without authorization".
  - TikTok's Terms (section 3.4) ban extracting content without written approval. So an ad for an app that saves TikTok sounds is likely to be rejected; that is our inference, not a stated rule.
  - The meme audio isn't licensed for ads.
- **No competitor branding.** Spotify, SoundCloud and TikTok appear only as plain words in the copy (T1, T2, c2, the end card and the post caption), never as their logos, icons or UI. The prompts never name them. The only visual overlap is Tikify's own #1ed760 accent green on play buttons and the now-playing title in the real UI shots (`refs/02`-`05`). No prompt asks for it, and Gen 3 gets only the cover-art crop (`refs/09`), not the full Playlist screen, so the model isn't shown a green list layout to copy. Tikify is not affiliated with TikTok, ByteDance, Spotify or SoundCloud, so say so in the caption.
- **Original character.** The girl is an original design: black wolf-cut hair with white fringe tips, a silver hoop earring, a black hoodie and wired earbuds. Every box says "not any existing anime character". Never type a show or character name into Higgsfield.
- **Safe zones.** T1-T3 (glyphs x 154-924, y 563-818, all above y 840) and the captions (glyphs x 181-905, y 265-541) sit inside TikTok's conservative in-feed safe area: x 120-960, y 240-1260, and nothing past x 780 below y 840. T4 and c7 fill the frame on purpose, like the anime edit they copy. The end card's button (y ≈ 1180-1310) reaches into the paid-ad CTA zone, which starts at y 1260. That is fine for an organic post.
- **Prices.** They come from Higgsfield's live cost table on 2026-10-19 (Kling 3.0 Omni at 1080p with sound off = 1.5 credits/s). The number on the Generate button is always the real price.
