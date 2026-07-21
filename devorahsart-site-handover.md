# Devorah's Art (devorahsart.com) — Site Handover & Architecture

Last updated: 2026-07-21

## 1. What this site is

devorahsart.com sells Devorah's digital art (anime-inspired). Business owner: Daniel Rosenthal (dan72ros@gmail.com, +972 58 749 0020), based in Israel.

## 2. Current stack (as found, not assumed)

Confirmed by inspecting the live page source and the hosting panel directly:

- **CMS:** WordPress
- **Page builder:** Elementor 3.26.5 (`meta-generator` tag on every page)
- **Shop / cart:** WooCommerce (header shows a live "$0.00 Cart" widget)
- **Theme/build credit:** "Built by Makeev Method" (makeevmethod.co.il) — external agency, likely built the original site and may still hold some access
- **Hosting + domain registrar:** Hostinger (`hpanel.hostinger.com`). Both the domain registration and the web hosting are with Hostinger — confirmed via the Hostinger domain checklist ("Register your domain" ✅, "Create or migrate your website" ✅, business email ✅)
- **Domain expiration:** 2027-01-17, auto-renew ON, privacy protection ON

No prior CLAUDE.md, architecture doc, or handover doc existed for this project before this one — this is the first.

## 3. Cloudflare migration — what's being done and why

**Goal:** speed + security + free CDN in front of the site, without touching WordPress/WooCommerce.

**Why not a full static rebuild on Cloudflare Pages:** Cloudflare Pages only serves static files — no PHP, no MySQL. WooCommerce needs both to run the cart/checkout. Moving to Pages would require ripping out WooCommerce and replacing it with a different checkout (Etsy, Gumroad, a payment-link service, etc.), which is a much bigger, riskier project. That path was explicitly declined in favor of the low-risk option.

**What "low-risk" means concretely:** WordPress + WooCommerce keep running exactly where they are on Hostinger. Only the domain's nameservers change, so that DNS/traffic routes through Cloudflare first (as a reverse proxy / CDN), then to the same Hostinger server as before.

**Important constraint:** Dan is based in Israel — **Stripe cannot be used** for any payment gateway work on this site (or any other project of his). If WooCommerce's current payment gateway is Stripe, that needs to be checked and is a separate problem from the Cloudflare migration — worth confirming what gateway is actually active before doing any checkout work.

### Steps completed

1. Verified via DNS lookup (`dns.google` DoH API) and a live screenshot of the Hostinger panel that the domain's registrar/host is Hostinger, not Namecheap (initial nameserver pattern `ns1/ns2.dns-parking.com` is Hostinger's default parking nameserver, not Namecheap's).
2. devorahsart.com added as a new zone in Cloudflare, under the **same Cloudflare account already used for Prism Publication** (login `Info@prismpublication...`, account ID `f8c334c2394fdd6ec4ea9cf013cd941e`). That account already manages `israelileads.com` and a Worker (`israelileads` / `lingering-shadow-3305`). Free plan.
3. Cloudflare assigned two nameservers for the devorahsart.com zone: `joel.ns.cloudflare.com` and `suzanne.ns.cloudflare.com`.
4. Those two nameservers were entered and saved in Hostinger's DNS/Nameservers panel (`hpanel.hostinger.com/domain/devorahsart.com/dns`). Hostinger's own UI confirms this with the banner "DNS is managed at another provider."
5. devorahsart.com now appears under "Recents > Domains" in the Cloudflare dashboard sidebar, confirming the zone exists.

### Steps completed since last update (2026-07-21)

- **DNS propagation — DONE.** Public lookup now returns Cloudflare nameservers (`joel.ns.cloudflare.com`, `suzanne.ns.cloudflare.com`). A records resolve to Cloudflare proxy IPs (`188.114.96.7`, `188.114.97.7`). Homepage responds with `Server: cloudflare`. Zone should show **Active** in the dashboard.
- **HTTPS working, no redirect loop.** `http://` redirects to `https://` with 301; homepage loads over HTTPS. This strongly suggests SSL mode is not stuck on "Flexible" (which usually causes loops with WordPress force-SSL), but **verify the setting in the dashboard** (see below).

### Steps still to confirm / finish

- **SSL/TLS mode in Cloudflare (verify, don't assume):** In [SSL/TLS → Overview](https://dash.cloudflare.com/f8c334c2394fdd6ec4ea9cf013cd941e/devorahsart.com/ssl-tls), confirm mode is **Full** or **Full (strict)** — NOT "Flexible". Flexible + WordPress force-SSL is a classic cause of infinite redirect loops on WooCommerce sites. As of 2026-07-21 the site loads fine, but the dashboard setting should be checked once.
- **Cache exceptions for dynamic pages (recommended):** `/cart/`, `/checkout/`, and `/my-account/` currently return `cf-cache-status: DYNAMIC` and origin `Cache-Control: no-cache` (LiteSpeed/WooCommerce), which is good. Still add explicit **Cache Rules** as defense in depth — see section 3a below.
- **End-to-end checkout test:** Walk cart → checkout (or do a small real test purchase) to confirm WooCommerce still works through Cloudflare.
- **Confirm WooCommerce's active payment gateway** and rule out Stripe given the Israel constraint above.
- **Makeev Method access:** unclear whether the original agency still has hosting/WordPress admin access or billing control. Worth confirming with Dan before making any WordPress-side changes (only DNS was touched so far, which didn't require WordPress access).

## 3a. Cache Rules to add in Cloudflare (WooCommerce safety)

In the dashboard: **Caching → Cache Rules → Create rule** (one rule is enough):

| Setting | Value |
|---|---|
| Rule name | Bypass WooCommerce dynamic pages |
| When incoming requests match | URI Path contains `/cart` OR `/checkout` OR `/my-account` OR `/wp-admin` OR `/wp-login.php` |
| Then | Cache eligibility → **Bypass cache** |

Save and deploy. This prevents Cloudflare from ever caching cart/checkout/account pages even if origin headers change later.

## 4. Longer-term goals for this project (from Dan, not yet started)

- Improve the site (design/content) beyond what Makeev Method built
- Bring traffic (SEO, RSS feed content)
- Actually sell the art — monetization/affiliate angle also in scope (project instructions mention affiliate links Dan has uploaded separately; none found in the connected folder yet as of this doc)

## 5. Working notes for whoever (human or Claude) picks this up next

- Dan is non-technical and works part-time on this — explain any technical step in plain terms, no assumed jargon.
- Cloudflare deploys/config in this environment should follow the `cloudflare-caveman` skill: the sandbox can't reach `api.cloudflare.com` directly (blocks wrangler CLI), the Chrome browser connector is flaky, and Chrome via computer-use is view-only (screenshots work, clicking/typing doesn't) — so any hands-on Cloudflare dashboard work has to be done by Dan directly, guided one step at a time, verified by screenshot.
- Don't suggest Stripe for this project or any of Dan's other projects (see memory: `user_location_payments.md`).
