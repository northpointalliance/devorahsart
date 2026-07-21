# Devorah's Art (devorahsart.com)

Static gallery and shop for Devorah's hand-painted digital art. Built for **Cloudflare Pages**, deployed at **https://devorahsart.com**.

Each piece is a **$10 digital download**. Checkout runs through **PayPal**. Files are delivered by email within 24 hours.

---

## Quick start

```bash
cd devorahsart-site
npm run build      # regenerate HTML from data/products.json
npm run deploy     # build + deploy to Cloudflare Pages (requires wrangler auth)
```

**Cloudflare account:** Prism Publication (`f8c334c2394fdd6ec4ea9cf013cd941e`)  
**Pages project:** `devorahsart`  
**Custom domain:** `devorahsart.com` (CNAME → `devorahsart.pages.dev`)

---

## Project layout

```
devorahsart-site/
├── data/products.json    # Single source of truth: all products + site config
├── build.mjs             # Static site generator (Node, no framework)
├── assets/images/        # Product and about-page images
├── css/styles.css        # Shared styles (light blue theme, WCAG-friendly)
├── index.html            # Generated shop homepage
├── about/ faq/ thank-you/  # Generated static pages
├── product/<slug>/       # Generated product pages (15 pieces)
├── sitemap.xml           # Generated
├── robots.txt            # Generated
├── _redirects            # Cloudflare Pages redirects (old WordPress URLs)
├── wrangler.toml         # Cloudflare Pages config
└── ARCHITECTURE.md       # Full architecture + change log
```

**Art source folder (separate):** `../Devorah Art JPG File/portraits/` — drop new images here, then tell the agent to add them to `products.json`.

---

## Adding new art

1. Save the image to `Devorah Art JPG File/portraits/` (and copy to `assets/images/`).
2. Add an entry to `data/products.json` (copy an existing product block).
3. Run `npm run build` and deploy.
4. Update `site.lastUpdated` in `products.json`.

Required fields per product: `id`, `title`, `slug`, `price`, `image`, `imageAlt`, `seoTitle`, `metaDescription`, `description`, `faqQuestion`, `faqAnswer`, `tags`, `useCase`. Set `"isNew": true` to show the New badge and sort to the top of the shop.

---

## Current collection (15 pieces)

| Title | Slug |
|---|---|
| Headphones Commute | `headphones-commute` |
| Colorful Confidence | `girl-with-orange-green-blue` |
| Father's Gaze | `portrait-of-father` |
| Free Spirit | `girl-with-the-wild-hair` |
| Pop Icon Tribute | `taylor-swift-art-cover` |
| Silent Expressions | `feeling-unheard` |
| Together Forever | `portrait-with-dog` |
| Warm Reflections | `girl-with-brown-hair` |
| Comfort in Quiet | `teddy-bear` |
| At the Easel | `at-the-easel` |
| Sunlight on the Canvas | `sunlight-on-canvas` |
| Window Seat Waves | `window-seat-waves` |
| Radiant Joy | `radiant-joy` |
| Many Faces | `many-faces` |
| Through the Lens | `through-the-lens` |

---

## Related docs (parent folder)

| File | Purpose |
|---|---|
| `../devorahsart-site-handover.md` | Original WordPress + Cloudflare DNS handover |
| `../Devorahs-Art-Rethink-Plan.md` | Decision to rebuild on Cloudflare Pages |
| `../Devorahs-Art-SEO-Fix-Pack.md` | SEO copy for original 8 WordPress products |

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full migration story, stack details, SEO rules, and change log.

---

## Owner

Daniel Rosenthal · dan72ros@gmail.com · Devorah's Art, Israel
