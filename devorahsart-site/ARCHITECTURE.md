# Devorah's Art: Architecture and Change Log

Last updated: 2026-07-21

This document describes how **devorahsart.com** works today, what changed from the old WordPress setup, and how to maintain the site going forward.

---

## 1. Executive summary

| Before | After |
|---|---|
| WordPress + WooCommerce on Hostinger | Static HTML on **Cloudflare Pages** |
| Elementor page builder | Custom static site generator (`build.mjs`) |
| WooCommerce cart + PayPal plugin | Direct **PayPal Buy buttons** per product |
| Automatic digital delivery plugin | Email delivery within 24 hours (manual to start) |
| Cloudflare as CDN only | Cloudflare hosts the entire site |
| 8 products | **15 products** |
| Heavy maintenance (updates, plugins) | No CMS: edit JSON, run build, deploy |

**Live URL:** https://devorahsart.com  
**Pages preview:** https://devorahsart.pages.dev

---

## 2. System architecture

```
Visitor
   │
   ▼
devorahsart.com  (DNS: CNAME @ → devorahsart.pages.dev, proxied)
   │
   ▼
Cloudflare Pages  (project: devorahsart)
   │
   ├── Static HTML/CSS/images (this repo, built output)
   ├── _redirects (legacy WordPress URL → new paths)
   └── PayPal checkout (external: paypal.com)
           │
           ▼
       dan72ros@gmail.com  (PayPal Business)
           │
           ▼
       Email delivery of high-res file (manual, within 24h)
```

### Why static + Cloudflare Pages

The rethink plan (`../Devorahs-Art-Rethink-Plan.md`) chose this stack because:

- **Zero WordPress maintenance** (no plugins, security patches, or Elementor)
- **Free hosting** on Cloudflare Pages
- **Fast global CDN** by default
- **Simple "add art" workflow:** drop image → edit JSON → build → deploy
- **PayPal stays** (works in Israel; Stripe does not)

WordPress remains on Hostinger but is **no longer served** at devorahsart.com once DNS points to Pages.

---

## 3. Cloudflare and DNS

| Item | Value |
|---|---|
| Domain | devorahsart.com |
| Registrar / original host | Hostinger |
| DNS nameservers | Cloudflare (`joel.ns.cloudflare.com`, `suzanne.ns.cloudflare.com`) |
| Cloudflare account | Prism Publication (`f8c334c2394fdd6ec4ea9cf013cd941e`) |
| Pages project | `devorahsart` |
| Root DNS record | CNAME `@` → `devorahsart.pages.dev` (proxied) |
| SSL | Cloudflare (Full or Full strict recommended) |

### DNS migration steps completed

1. Added devorahsart.com zone to Cloudflare (same account as convomargin / other Prism projects).
2. Changed nameservers at Hostinger to Cloudflare.
3. Created Cloudflare Pages project `devorahsart`.
4. Attached custom domain `devorahsart.com` in Pages → Custom domains.
5. Removed Hostinger A records; CNAME to `devorahsart.pages.dev` serves the new site.

---

## 4. Site generator (build.mjs)

There is **no React, no WordPress, no SSR at runtime**. A Node script reads one JSON file and writes HTML.

### Input

`data/products.json` contains:

- `site` — name, URL, PayPal email, tagline, intro, lastUpdated
- `products[]` — one object per piece (title, slug, price, images, SEO copy, tags, useCase, isNew)

### Output (generated on every build)

| Path | Purpose |
|---|---|
| `/index.html` | Shop homepage + SEO content sections |
| `/about/index.html` | Artist bio + studio story |
| `/faq/index.html` | 8 FAQ sections (FAQPage schema) |
| `/thank-you/index.html` | Post-PayPal return page |
| `/product/<slug>/index.html` | One page per piece (15 total) |
| `/sitemap.xml` | All URLs with lastmod |
| `/robots.txt` | Allows crawlers, points to sitemap |
| `/_redirects` | 301s from old WordPress paths |

### Build command

```bash
node build.mjs
# or: npm run build
```

### Deploy command

```bash
npx wrangler pages deploy . --project-name=devorahsart --commit-dirty=true
# or: npm run deploy
```

Set `CLOUDFLARE_ACCOUNT_ID=f8c334c2394fdd6ec4ea9cf013cd941e` if wrangler prompts for account.

---

## 5. Product catalog

All pieces: **$10 USD**, virtual digital download, PayPal checkout.

### Original 8 (migrated from WordPress)

Migrated from WooCommerce with images downloaded from the live WordPress uploads folder. Slugs preserved where possible for SEO continuity.

1. Colorful Confidence (`girl-with-orange-green-blue`)
2. Father's Gaze (`portrait-of-father`)
3. Free Spirit (`girl-with-the-wild-hair`)
4. Pop Icon Tribute (`taylor-swift-art-cover`)
5. Silent Expressions (`feeling-unheard`)
6. Together Forever (`portrait-with-dog`)
7. Warm Reflections (`girl-with-brown-hair`)
8. Comfort in Quiet (`teddy-bear`)

### Added 2026-07-21: Headphones Commute

- First piece added through the new art-folder workflow
- Source: `Devorah Art JPG File/portraits/headphones-commute.jfif`
- Studio process photos kept in `studio/` subfolder for future Pinterest/Reels

### Added 2026-07-21: Six new pieces

| Title | Slug | Image file |
|---|---|---|
| At the Easel | `at-the-easel` | `artist-at-work-peach.jpg` |
| Sunlight on the Canvas | `sunlight-on-canvas` | `sunlight-on-canvas.jpg` |
| Window Seat Waves | `window-seat-waves` | `window-seat-waves.jpg` |
| Radiant Joy | `radiant-joy` | `joyful-orange-hair.jpg` |
| Many Faces | `many-faces` | `four-faces.jpg` |
| Through the Lens | `through-the-lens` | `camera-and-smile.jpg` |

New pieces sort to the top of the shop (`isNew: true`) and show a **New** badge.

---

## 6. Checkout and fulfillment

### PayPal

Each product page has a hosted PayPal button form:

- `business`: `dan72ros@gmail.com` (verify this matches PayPal Business email)
- `amount`: `10.00`
- `currency_code`: `USD`
- `no_shipping`: `1`
- `return`: `https://devorahsart.com/thank-you/`

### Fulfillment (current)

1. Customer pays via PayPal.
2. Devorah receives PayPal notification.
3. High-resolution file emailed to buyer within **24 hours**.

### Fulfillment (future option)

Automated delivery via Cloudflare Worker + email API when sales volume justifies it.

---

## 7. SEO, AEO, and GEO

Applied per the **gettingcited / Gold Plan** framework and `geo-cloudflare` skill.

### On every public page

- Critical content in **static HTML** (no JS-only prices or descriptions)
- **JSON-LD**: `WebSite`, `Organization`, `Product`, `FAQPage`, `ItemList` as appropriate
- Question-based **H2s** with a direct 2–3 sentence answer first
- `canonical`, meta description, `robots.txt`, `sitemap.xml`
- Prices in plain text: `$10`, `$10 digital download`

### Homepage SEO depth

Eight question-based sections below the gallery grid (What is Devorah's Art?, How much does it cost?, etc.), each with answer, details, TLDR, and internal links.

### Product pages

Three FAQ sections per product plus related pieces links.

### Prose style rule

**Minimize em dashes.** Use commas, colons, periods, or `|` in titles instead. Documented in Cursor skills (`gettingcited`, `geo-cloudflare`) and workspace rule `web-standards-light-blue.mdc`.

### Redirects from WordPress

| Old path | New path |
|---|---|
| `/shop/` | `/` |
| `/contact/` | `/faq/` |
| `/product/<slug>` | `/product/<slug>/` |

---

## 8. Visual and accessibility standards

From workspace web standards (light blue theme):

| Element | Color |
|---|---|
| Page background | `#F0F9FF` |
| Sections | `#E0F2FE` / `#BAE6FD` |
| Cards | `#FFFFFF` |
| Body text | `#1E293B` |
| Accent / links | `#0284C7`–`#0369A1` |

- Skip link, `:focus-visible` rings, semantic HTML
- `prefers-reduced-motion: reduce` honored
- Footer on every page: shop links, FAQ, copyright, last updated date

---

## 9. Art asset workflow

```
Devorah finishes piece
        │
        ▼
Drop image in Devorah Art JPG File/portraits/
        │
        ▼
Copy to devorahsart-site/assets/images/
        │
        ▼
Add entry to data/products.json
        │
        ▼
npm run build && deploy
        │
        ▼
Live at devorahsart.com/product/<slug>/
```

**Folder structure for art assets:**

```
Devorah Art JPG File/
├── portraits/       # Finished work for sale
├── studio/          # Behind-the-scenes (social media, not shop)
├── animations/      # Future video content
└── manga/           # Future manga pages
```

---

## 10. Change log

### 2026-07-21: Cloudflare Pages rebuild and go-live

- Scaffolded `devorahsart-site/` static generator
- Migrated 8 WordPress products with local images
- Created Cloudflare Pages project `devorahsart`
- Deployed to devorahsart.pages.dev
- Connected custom domain devorahsart.com (DNS CNAME to Pages)
- Removed dependency on WordPress/WooCommerce for public site

### 2026-07-21: Headphones Commute

- First new piece via art-folder workflow
- Product page, SEO copy, PayPal button

### 2026-07-21: SEO / gettingcited optimization

- Expanded homepage with 8 Gold Plan SEO sections
- Added FAQPage, ItemList, SearchAction JSON-LD
- Expanded FAQ to 8 questions
- Expanded About page
- Added product page FAQ sections and related links
- sitemap lastmod dates

### 2026-07-21: Em dash cleanup

- Removed em dashes sitewide (61 in source → 0)
- Updated Cursor SEO skills to enforce minimal em dash use

### 2026-07-21: Six new pieces

- At the Easel, Sunlight on the Canvas, Window Seat Waves, Radiant Joy, Many Faces, Through the Lens
- Shop expanded to 15 products
- New pieces marked `isNew`, sorted to top of gallery

### 2026-07-21: Documentation

- Added `README.md` and this `ARCHITECTURE.md`

---

## 11. What is intentionally not built yet

| Item | Notes |
|---|---|
| Automated file delivery | Email manual for now |
| Pinterest / Reels posting | Planned traffic engine; studio photos ready |
| Google Search Console | Recommended next step for indexing |
| Physical print shipping | Digital only |
| Cart / multi-item checkout | One PayPal button per piece |
| WordPress decommission | Can cancel Hostinger WP hosting once confident |

---

## 12. Key file reference

| File | Role |
|---|---|
| `data/products.json` | Product catalog + site config (edit this to add art) |
| `build.mjs` | HTML generator |
| `css/styles.css` | All styles |
| `wrangler.toml` | Cloudflare Pages project name |
| `_redirects` | Legacy URL redirects (regenerated) |
| `../devorahsart-site-handover.md` | Pre-migration WordPress + DNS notes |
| `../Devorahs-Art-Rethink-Plan.md` | Original rebuild decision doc |

---

## 13. Troubleshooting

**Site shows old WordPress content**  
DNS may still point to Hostinger. Confirm CNAME `@` → `devorahsart.pages.dev` in Cloudflare DNS and that Pages custom domain shows Active.

**PayPal button fails**  
Verify `site.paypalBusiness` in `products.json` matches the live PayPal Business email.

**New product 404**  
Run `npm run build` and redeploy. Check slug folder exists under `product/<slug>/index.html`.

**Build JSON error**  
Validate `data/products.json` (trailing commas, missing `]` or `}`).

---

*Maintained for Daniel Rosenthal / Devorah's Art. Rebuild and redeploy after any catalog change.*
