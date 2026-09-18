# Devorah's Art: Architecture and Change Log

Last updated: 2026-09-18

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

- `business`: `dan73ros@gmail.com` (the PayPal-linked address; see the 18 September 2026 bug fix below, this was wrong for weeks)
- `amount`: `10.00`
- `currency_code`: `USD`
- `no_shipping`: `1`
- `return`: `https://devorahsart.com/thank-you/`

**Two owner emails, not one, don't conflate them:**
- `dan73ros@gmail.com` — the address actually linked to the PayPal account. Only used for the `business` value in PayPal buttons, i.e. where payment goes.
- `dan72ros@gmail.com` — the inbox Daniel actually checks day to day. Used for the checkout-help notification below, i.e. where "something went wrong, please help" alerts go. Confirmed directly with Daniel; this is intentional, not a typo to unify.

### Fulfillment (current)

1. Customer pays via PayPal.
2. Devorah receives PayPal notification.
3. High-resolution file emailed to buyer within **24 hours**.

### Checkout-help notification (built 18 September 2026)

Every product page has a "Trouble with checkout?" `<details>` block: customer enters their email and what happened, submits to `POST /api/notify` (`functions/api/notify.js`), which emails `dan72ros@gmail.com` so the order can be fulfilled manually. Self-contained in this Pages project via a `send_email` binding (`wrangler.toml`, binding name `EMAIL`), no separate Worker involved.

This replaces an earlier, incomplete version of the same idea: `functions/api/notify.js` used to just forward the request, via a `[[services]]` binding, to a separate Worker called `devorahsart-notify` that composed and sent the email. That Worker was fully built and correct, but nothing on the live site ever called `/api/notify` at all, so the whole feature was silently unreachable from launch until this date. The separate Worker is now orphaned (still exists in the Cloudflare account, unused, not yet deleted, pending an explicit decision to remove it).

**One-time setup this needs, not something a deploy or this repo can do on its own:** in the Cloudflare dashboard, `dan72ros@gmail.com` needs to be a verified destination address (Email Routing, or Email Service → Email Sending), and `info@prismpublication.com` (the `from` address used) needs to be an allowed/onboarded sender. Until that's done, submitting the form returns a clean "Email is not configured" error rather than silently failing.

### Fulfillment (future option)

Automated delivery via Cloudflare Worker + email API when sales volume justifies it.

---

## 6a. Cross-listing on Prism Publication (added 18 September 2026)

Daniel owns both **devorahsart.com** and **prismpublication.com** (same person, same Cloudflare account). Prism runs a live AI chat at `prismpublication.com/run-ads/` that shows a sponsored card when a visitor's question closely matches an approved advertiser's creative.

All 15 pieces here are now listed there too, as a "house ad": submitted and approved like a real advertiser campaign, but with no PayPal purchase behind the ad credit, since Daniel isn't paying himself for placement. Each piece has its own entry (title, Devorah's own one-sentence description, real product URL, her tags as matching keywords), so a visitor's question surfaces whichever piece actually fits, not one generic shop link.

**The two systems don't share money or data.** Prism's ad-credit system only governs whether/how often the card shows in that chat, free, nominal, nothing to do with PayPal. If a visitor clicks through and actually buys a piece, that's a completely separate, real PayPal transaction on this site, using the `business` email above, full stop, unrelated to anything Prism tracks.

This is documented in Prism's own memory (`mem/current.md` in the `prismpublication-sept` repo), not duplicated in full here. If devorahsart's catalog changes (a piece is added, removed, or retitled), Prism's copy of that listing does not update automatically, it would need updating separately on that side.

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

### 2026-09-18: PayPal business email fixed (real bug, not cosmetic)

- Every "Buy with PayPal" button on all 15 products, plus a reference in the delivery-FAQ text, was pointing to `dan72ros@gmail.com` instead of the actual PayPal-linked address, `dan73ros@gmail.com`. Fixed at the source (`data/products.json`'s `paypalBusiness` field) and rebuilt.
- A second, independent copy of the same wrong email was hardcoded as a literal string inside `build.mjs` (not read from the JSON), so the JSON fix alone would not have caught it. Changed to read `site.paypalBusiness` instead, so it can't drift out of sync again.

### 2026-09-18: Checkout-help notification finished

- Built the frontend piece that was always missing: a "Trouble with checkout?" form on every product page.
- Collapsed `functions/api/notify.js` from a proxy-to-another-Worker into a self-contained Pages Function with its own `send_email` binding. See section 6 above.
- The separate `devorahsart-notify` Worker this replaced is now orphaned in the Cloudflare account, not deleted yet.

### 2026-09-18: Cross-listed on Prism Publication

- All 15 products submitted and approved as a house-ad campaign on `prismpublication.com/run-ads/`'s live chat. See section 6a above.

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
| `functions/api/notify.js` | Checkout-help email notification (self-contained Pages Function) |
| `wrangler.toml` | Cloudflare Pages project name, `send_email` binding |
| `_redirects` | Legacy URL redirects (regenerated) |
| `../devorahsart-site-handover.md` | Pre-migration WordPress + DNS notes |
| `../Devorahs-Art-Rethink-Plan.md` | Original rebuild decision doc |
| `../mem/current.md` | Running decision log, read this first before making changes |

---

## 13. Troubleshooting

**Site shows old WordPress content**  
DNS may still point to Hostinger. Confirm CNAME `@` → `devorahsart.pages.dev` in Cloudflare DNS and that Pages custom domain shows Active.

**PayPal button fails**  
Verify `site.paypalBusiness` in `products.json` matches the live PayPal Business email (`dan73ros@gmail.com`, not `dan72ros@gmail.com`, these are two different real inboxes, see section 6, this exact mix-up happened once already on 18 September 2026).

**Checkout-help form submits but no email arrives**  
Check the Cloudflare dashboard: is `dan72ros@gmail.com` a verified destination address (Email Routing / Email Sending), and is `info@prismpublication.com` an allowed sender? The form will show a clean error ("Email is not configured") if the `EMAIL` binding itself is missing, but a silent failure past that point means the verification step hasn't been done yet.

**New product 404**  
Run `npm run build` and redeploy. Check slug folder exists under `product/<slug>/index.html`.

**Build JSON error**  
Validate `data/products.json` (trailing commas, missing `]` or `}`).

---

*Maintained for Daniel Rosenthal / Devorah's Art. Rebuild and redeploy after any catalog change.*
