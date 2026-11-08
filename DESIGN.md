# Brotta · design system

Documented from the built site (brotta.online, November 2026). Source: `assets/site.css`, `assets/field.js`.

## World

Order grows out of noise. Ink particles drift as a noise field and settle into Brotta's sprout; that field is the material of the whole site. The home carries it full and alive; product pages carry a slow, sparse drift behind the opening. Everything else is paper, ink, hairlines and one green.

References the owner pinned: anthropic.com (quiet ground, large plain type, pill controls, dark footer) and klur.co (one big visual, tiny nav, nothing else above the fold).

## Tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F3F0E8` | page ground |
| `--sheet` | `#FBFAF6` | mocks, raised panels |
| `--sand` | `#E8E4D8` | figure grounds, chips, hover fills |
| `--ink` | `#15140F` | text, primary buttons, footer, dark band |
| `--ink-2` | `#45423A` | body on paper |
| `--ink-3` | `#625E4E` | secondary text (4.5:1 on sand) |
| `--rule` | `rgba(21,20,15,.12)` | hairlines |
| `--rule-strong` | `rgba(21,20,15,.34)` | outline buttons |
| `--broto` | `#1C8C47` | settled particles, icons, chips |
| `--broto-ink` | `#136A34` | green text, hover of primary button |
| `--broto-soft` | `#DCEBDF` | chip fill |
| `#5FCB86` | | green on the ink band only |
| `--ease` | `cubic-bezier(.16,1,.3,1)` | every transition |
| `--wrap` / `--gutter` | `1320px` / `clamp(16px,4vw,56px)` | page width |
| `--sec` | `clamp(64px,8vw,112px)` | section rhythm |

Green means "arrived": a settled particle, the current page pill, the primary button on hover, the emphasised word in a closing headline. It is never a decorative fill.

## Type

One face, Schibsted Grotesk (Google Fonts), weights 400 to 800.

- Display (h1 banner, product h1): 800, `clamp(42px,6.4vw,92px)` to `clamp(44px,7vw,104px)`, tracking −.045em to −.05em, line-height .94 to .96.
- Section h2: 700, `clamp(30px,3.6vw,52px)`, tracking −.035em, line-height 1.04.
- Statement paragraph (`.why .big`): 600, `clamp(28px,3.9vw,56px)`, second clause in `--ink-3` at 500.
- h3: 700, 21 to 22px, line-height 1.2.
- Body 17px/1.5; lede 20 to 21px/1.4; small 14 to 15px.
- Numerals in mocks: `font-variant-numeric: tabular-nums`.
- No kickers or eyebrows above headings. Headings in sentence case.

## Components

- **Nav**: fixed 68px bar; logo left, four product pills centre, WhatsApp pill right. Pills: 36px, hairline border, `--sand` on hover, inverted ink when `aria-current="page"`. Bar turns to blurred paper after 12px of scroll. Under 900px the pills move into a full-screen menu behind a round button.
- **Buttons** (`.btn`): 50px pills, 600/16px. `btn-ink`, `btn-line`, `btn-paper` and `btn-ghost` (the last two on the ink band). Press scales to .97.
- **Banner** (`.banner`): `min-height: clamp(640px,100svh,1100px)`, canvas behind, copy bottom-left (`max-width:720px`), offers strip on a top hairline with four links. Offers hide under 600px.
- **Products** (`.products`): three columns separated by 1px of `--rule`; each is one link with a sand figure holding a small mock, name, one sentence, arrow.
- **Ink band** (`.custom .box`): 28px radius block in `--ink` with a two-column from → to list on `rgba(243,240,232,.16)` rules.
- **Steps** (`.steps`): four columns, 2px ink top rule, no numbers.
- **Product hero** (`.p-hero`): copy left, mock right, hairline bottom; drift canvas behind.
- **Feature grid** (`.feats`, `.feats.four`): hairline-separated cells, 26px green icon, h3, one paragraph.
- **Showcase** (`.showcase`, `.flip`): copy beside a mock with a check list.
- **FAQ**: `<details>` rows on hairlines, plus icon rotates 45°.
- **Mocks** (`.mock`, `.mock.sm`): sheet panel, 18px radius, hairline border, soft offset shadow `0 18px 44px -24px`. Inner vocabulary: `.chip`, `.steps-m`, `.bubble`, `.rx`, `.lens-row`, `.shop`, `.kpi`, `.flow`. Every mock carries a `.fine` line saying it is illustrative.
- **Footer**: ink, four columns, legal line with CNPJ.
- **Floating WhatsApp**: 54px ink disc, appears after 80% of the viewport is scrolled.

## Motion

- The field (`assets/field.js`): 3D gradient noise drives a curl flow; a 16s cycle (noise 2.4s, grow 5s, hold 5.2s, release 3.4s) pulls each particle to a point sampled from the sprout silhouette; settled particles turn green (left leaf at half alpha). Pointer repels within 150px. Pauses when hidden or off-screen. `data-mode="drift"` keeps the flow without the sprout.
- Reduced motion: the home draws the formed sprout once with a third of the ink scattered; product pages draw a still scatter. `?motion=1` forces the animation for previews.
- Banner copy rises once (`@keyframes rise`, 1s, staggered .12s). No other entrance animations.
- Hover: arrows translate 4px; product panels lighten to `--sheet`.

## Browser surfaces

Selection green on white; focus ring 2px green, 3px offset; caret green; `scrollbar-color` ink-3 on paper; tabular numerals in data.

## Pages

`/` home · `/vollta` · `/lentiva` · `/shopify` · `/sob-medida` (includes the diagnosis chooser) · `404.html`. Extensionless links rely on GitHub Pages resolving `name.html`.
