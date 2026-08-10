<!--
  ╔══════════════════════════════════════════════════════════════════════════╗
  ║  GENERATED FILE — DO NOT EDIT BY HAND                                    ║
  ║                                                                          ║
  ║  Source of truth : @aimk/image-spec                                      ║
  ║                    aimk_backend/packages/aimk-image-spec/src/index.ts    ║
  ║  Regenerate with : npm run build   (in that package)                     ║
  ║                                                                          ║
  ║  Edits made here will be overwritten on the next build.                  ║
  ╚══════════════════════════════════════════════════════════════════════════╝
-->

# Image Guidelines — Angels in My Kitchen

**For the Marketing and UI teams.**
Answers one question: *"I'm uploading an image for X. What size should it be?"*

Every number here was measured from the running application, then published from a single shared
package (`@aimk/image-spec`) that the storefront, the Admin Panel and this document all read from.
If a number changes here, it changed in the application too.

> **You usually don't need this document.** The Admin Panel shows the requirements for each image
> slot right next to the upload button. This is the full reference.

---

## Quick reference

| Slot | Recommended | Minimum | Ratio | Fit | Cropped? | Transparency | Max size |
|---|---:|---:|---:|---|---|---|---:|
| Hero / Offer Banner | **2560 × 1080** | 1920 × 810 | 2.37:1 (desktop) · 4:3 (tablet) · 4:5 (mobile) | Cover | Yes | No — JPG | 800 KB |
| Product Card | **1200 × 900** | 800 × 600 | 4:3 | Cover | Yes | No — JPG | 300 KB |
| Featured Card | **1200 × 900** | 800 × 600 | 4:3 | Cover | Yes | No — JPG | 300 KB |
| Category Avatar | **800 × 800** | 512 × 512 | 1:1 | Cover | Yes | No — JPG | 150 KB |
| Product Gallery / Modal | **1200 × 1200** | 800 × 800 | 1:1 | Cover | Yes | No — JPG | 300 KB |
| Thumbnail (nav, cart, orders) | **256 × 256** | 128 × 128 | 1:1 | Cover | Yes | No — JPG | 80 KB |
| Category Icon (chips) | **256 × 256** | 128 × 128 | 1:1 | Contain | No | **Yes — PNG or SVG** | 40 KB |

Cart, order and navigation thumbnails (36–88 px) **reuse the product or category asset**. No separate
upload is needed — the 1200 × 900 product image already covers them at 3× pixel density.

---

## Why "recommended" is bigger than the box on screen

A product card is about 570 px wide at its largest. Most phones and modern laptops have 2× or 3×
pixel density, so a 570 px box needs roughly a 1140 px image to look sharp. That is where
1200 × 900 comes from — it is not arbitrary padding.

Below the **minimum**, the browser has to stretch the image and it will look soft. Above the
recommendation there is no visible benefit — the app resizes and converts everything to WebP
automatically, so a 6000 px original just slows down the upload.

**Uploading something larger than recommended is always fine.** The Admin Panel will never reject it.

---

## Slot details

### Hero / Offer Banner

| | |
|---|---|
| **Recommended** | 2560 × 1080 px |
| **Minimum** | 1920 × 810 px |
| **Aspect ratio** | 2.37:1 (desktop) · 4:3 (tablet) · 4:5 (mobile) |
| **Fit** | Cover (fills the box, trims overflow) |
| **Cropped?** | Yes |
| **Format** | JPG |
| **Transparency** | Not used — flatten onto a background |
| **Max file size** | 800 KB |
| **Rendered quality** | 90 |

**Safe area.** Single asset is cropped hard on phones — only the central ~34% of the width survives. Keep all headline text, logos and price callouts inside the central 34% (≈ 865px of a 2560px asset). Also avoid the bottom 25%, which the copy overlay and gradient cover.

### Product Card

| | |
|---|---|
| **Recommended** | 1200 × 900 px |
| **Minimum** | 800 × 600 px |
| **Aspect ratio** | 4:3 |
| **Fit** | Cover (fills the box, trims overflow) |
| **Cropped?** | Yes |
| **Format** | JPG |
| **Transparency** | Not used — flatten onto a background |
| **Max file size** | 300 KB |
| **Rendered quality** | 85 |

**Safe area.** A 4:3 upload is not cropped. Off-ratio uploads are trimmed symmetrically from the long edge — keep the product centred.

### Featured Card

| | |
|---|---|
| **Recommended** | 1200 × 900 px |
| **Minimum** | 800 × 600 px |
| **Aspect ratio** | 4:3 |
| **Fit** | Cover (fills the box, trims overflow) |
| **Cropped?** | Yes |
| **Format** | JPG |
| **Transparency** | Not used — flatten onto a background |
| **Max file size** | 300 KB |
| **Rendered quality** | 85 |

**Safe area.** A 4:3 upload is not cropped. Off-ratio uploads are trimmed symmetrically from the long edge — keep the product centred.

### Category Avatar

| | |
|---|---|
| **Recommended** | 800 × 800 px |
| **Minimum** | 512 × 512 px |
| **Aspect ratio** | 1:1 |
| **Fit** | Cover (fills the box, trims overflow) |
| **Cropped?** | Yes |
| **Format** | JPG |
| **Transparency** | Not used — flatten onto a background |
| **Max file size** | 150 KB |
| **Rendered quality** | 85 |

**Safe area.** Cropped to a circle — all four corners are discarded. Keep the subject inside the inscribed circle with ~10% breathing room.

### Product Gallery / Modal

| | |
|---|---|
| **Recommended** | 1200 × 1200 px |
| **Minimum** | 800 × 800 px |
| **Aspect ratio** | 1:1 |
| **Fit** | Cover (fills the box, trims overflow) |
| **Cropped?** | Yes |
| **Format** | JPG |
| **Transparency** | Not used — flatten onto a background |
| **Max file size** | 300 KB |
| **Rendered quality** | 85 |

**Safe area.** Keep the product centred; edges are trimmed on narrow viewports.

### Thumbnail (nav, cart, orders)

| | |
|---|---|
| **Recommended** | 256 × 256 px |
| **Minimum** | 128 × 128 px |
| **Aspect ratio** | 1:1 |
| **Fit** | Cover (fills the box, trims overflow) |
| **Cropped?** | Yes |
| **Format** | JPG |
| **Transparency** | Not used — flatten onto a background |
| **Max file size** | 80 KB |
| **Rendered quality** | 75 |

**Safe area.** Reuses the product or category asset. No separate upload required.

### Category Icon (chips)

| | |
|---|---|
| **Recommended** | 256 × 256 px |
| **Minimum** | 128 × 128 px |
| **Aspect ratio** | 1:1 |
| **Fit** | Contain (whole image fits, never trimmed) |
| **Cropped?** | No |
| **Format** | PNG or SVG |
| **Transparency** | Supported and useful |
| **Max file size** | 40 KB |
| **Rendered quality** | 75 |

**Safe area.** Not cropped (object-fit: contain). Currently reuses the category photograph, which is illegible at icon size — a dedicated transparent icon asset is a planned improvement, so uploading one here has no effect yet.

---

## Hero banner — the one to read carefully

The hero is the only slot whose container **reshapes between devices**, because a banner that fills a
widescreen monitor cannot also fill a tall phone screen. Measured containers:

| Device | Hero area | Shape |
|---|---:|---|
| 1920 × 1080 desktop | 1920 × 810 | wide, 2.37:1 |
| 1440 × 900 laptop | 1440 × 608 | wide, 2.37:1 |
| 1366 × 768 laptop | 1366 × 576 | wide, 2.37:1 |
| 768 × 1024 tablet | 768 × 576 | 4:3 |
| 390 × 844 phone | 390 × 488 | 4:5, portrait |
| 360 × 800 phone | 360 × 450 | 4:5, portrait |

One wide image is used at every size and the sides are cropped away as the screen narrows.
**On a phone only the middle ~34 % of the width is visible.**

```
2560 × 1080 banner
|-------------------------------------------------------------|
|         :                                       :            |
|         :        ✅ SAFE AREA — 865 px          :            |
|  cropped:   headline · logo · price · CTA       :  cropped   |
| on phone:                                       : on phone   |
|-------------------------------------------------------------|
          ←------------- central 34% -------------→
```

**Rules:**

1. Keep every headline, logo, price and call-to-action inside the **central 865 px** of a
   2560 px asset. Anything outside is invisible to phone users.
2. Keep the **bottom 25 %** clear of important detail — the app draws a dark gradient and overlays
   the offer title, description and buttons there.
3. Let the background photography bleed to the full 2560 px. Only the *message* must stay central.
4. Prefer not to bake the headline into the image. `headline` and `subtext` are separate fields on
   the banner record and stay sharp and readable at every size.

There is **no separate mobile banner asset.** One image serves every breakpoint.

---

## File format and compression

- **JPG** for photography. **PNG** or **SVG** only where transparency matters (icons, logo).
- **Do not pre-compress before uploading.** The app re-encodes everything to WebP automatically; a
  pre-squashed JPG only compounds the artefacts. Export at the highest quality your tool offers, at
  the stated dimensions.
- Colour profile: **sRGB**. Other profiles can shift colour in some browsers.
- The app serves images at three quality tiers — **90** for the hero,
  **85** for cards and avatars, **75** for small thumbnails.
  This is automatic; you do not need to do anything.

---

## Filename convention

```
hero-{campaign}-{YYYYMM}.jpg        hero-diwali-202611.jpg
product-{sku-or-slug}.jpg           product-belgian-truffle-500g.jpg
category-{slug}.jpg                 category-breads.jpg
icon-category-{slug}.png            icon-category-breads.png
```

---

## Known limitation — category icons

The chips in the menu filter currently reuse the category **photograph** at 18–24 px, where a photo is
unreadable at any resolution. A dedicated transparent icon needs a new media field on the Category
record; that is a separate, scheduled change. Until then, uploading a `Category Icon (chips)`
asset has no effect on those chips.

---

## Checklist before you upload

- [ ] Correct dimensions from the table above
- [ ] Correct aspect ratio (so nothing is cropped unexpectedly)
- [ ] For heroes: headline, logo and CTA inside the central 34 %; bottom 25 % clear
- [ ] For category avatars: subject inside the circle
- [ ] sRGB, not pre-compressed
- [ ] Under the file-size ceiling
