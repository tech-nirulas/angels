# ⚠️ Cravelo DEMO — NOT LICENSED FOR PRODUCTION

`Cravelo-DEMO-Regular.otf` is a **demo/trial** cut of *Cravelo Vintage Rounded Serif*
by **Pandeka Studio** (foundry ID `PYRS`).

## Licence

The publisher's readme, shipped with the download, states:

> This demo font is free for **PERSONAL USE** … For Corporate use you have to purchase
> Corporate license.

and, in the Indonesian section, that commercial use is **strictly prohibited**
("DILARANG KERAS") for advertising, promotion, video, product packaging — physical or
digital — or any medium intended to generate profit, and that unlicensed commercial use
is charged at **100× the standard licence price**.

Angels in my Kitchen is a commercial storefront. **This file must not be deployed.**

Commercial licence: https://creativemarket.com/PandekaStudio/91907536-Cravelo-Vintage-Rounded-Serif
Contact: pandekastudio@gmail.com

Note: the font's OS/2 `fsType` is `0x0000` ("Installable Embedding"), which is a
*technical* embedding permission only. It does **not** grant the legal right to use the
demo commercially — the EULA above governs.

## Technical limitations of the DEMO cut

The demo contains **56 mapped codepoints** — verified by parsing the `cmap` table:

| Present | Absent |
|---|---|
| `A–Z`, `a–z`, space | **all digits `0–9`** |
| | **`₹` (U+20B9)** |
| | **all punctuation** — `. , ' - & ( ) ? ! : %` |
| | accented Latin (`À`, `é`, …) |
| | Devanagari |

Consequences, measured against live application content:

- **Prices: 100% unrenderable** — hence prices are mapped to Poppins.
- Category names: ~50% contain `&` or digits.
- Product names: ~21% contain parentheses or digits.
- Static headings: ~35% contain `'`, `&`, `|` or digits.

Where a glyph is missing the browser falls back **per character**, so a single heading
can mix two typefaces mid-word (e.g. "Chef's Picks"). The licensed full family is
expected to carry a complete charset and resolve this.

## Before going to production

1. Purchase the commercial/corporate licence.
2. Replace this file with the licensed build (ideally `.woff2`).
3. Re-verify `₹`, digits and punctuation coverage.
4. Re-evaluate whether prices and product names should move back to the display font.
