# Carry-forward | devorahsart

Read this before touching anything. It's the compressed decision log from
the 18 September 2026 session that fixed real bugs, finished a half-built
feature, and cross-listed this catalog on a sibling project. Full detail
lives in `devorahsart-site/ARCHITECTURE.md`'s Change Log; this file is the
short version plus the things that are easy to get wrong.

## Identity

Daniel Rosenthal owns both this site and `prismpublication.com`, same
Cloudflare account (`f8c334c2394fdd6ec4ea9cf013cd941e`). Not a coincidence,
not two unrelated businesses accidentally sharing infra.

**Two real, separate inboxes -- do not treat one as a typo of the other:**
- `dan73ros@gmail.com` -- linked to PayPal. Only place this belongs: the
  `business` field on a buy button, i.e. where payment goes.
- `dan72ros@gmail.com` -- checked constantly. Only place this belongs:
  checkout-help alerts, i.e. where "something went wrong" goes.

Confirmed directly, twice, after an initial wrong assumption that one must
be a typo of the other. It isn't. Mixing them up is exactly the bug fixed
below.

## Bug fixed: wrong PayPal email on every buy button

Every "Buy with PayPal" button (all 15 products), plus a line in the
delivery-FAQ text, was hardcoded to `dan72ros@gmail.com` instead of the
real PayPal-linked address, `dan73ros@gmail.com`. Two separate copies of
the bug, not one:
1. `data/products.json`'s `paypalBusiness` field (the real source of
   truth, `build.mjs` templates every page from it)
2. A second, independent hardcoded copy as a literal string inside
   `build.mjs` itself, in the delivery-FAQ prose, not read from the JSON
   at all -- fixing #1 alone would not have caught this one. Changed to
   read `site.paypalBusiness` so it can't drift out of sync again.

Both fixed, rebuilt, pushed (commit `929a02a`). Verified zero remaining
occurrences of the wrong email anywhere in the repo before pushing.

## Feature finished: checkout-help notification

`functions/api/notify.js` existed before this session but was **completely
unreachable** -- nothing on the live site ever called it. It just forwarded
(via a `[[services]]` binding in `wrangler.toml`) to a separate Worker,
`devorahsart-notify`, that composed and sent the email. That Worker's code
was correct and complete; the frontend to actually trigger it never
existed. So this "safety net" had been sitting there, useless, since it
was built.

Fixed properly (commit `ea75018`), not just patched:
- Added a real "Trouble with checkout?" form to every product page
  (`build.mjs`'s `productPage()` template), posts to `/api/notify`.
- Collapsed `functions/api/notify.js` into a self-contained Pages
  Function: composes and sends the email itself via a `send_email`
  binding, no separate Worker, no service-binding indirection.
- `wrangler.toml`: removed the `[[services]]` block, added
  `[[send_email]] name = "EMAIL" destination_address = "dan72ros@gmail.com"`.
- Notification recipient is `dan72ros@gmail.com` (confirmed above), sender
  is `info@prismpublication.com` (same identity the old Worker already
  used).

**The old `devorahsart-notify` Worker is now fully orphaned.** Nothing
references it. Still exists in the Cloudflare account. Not deleted --
that was left as an open question, not decided either way.

**Still needs, and cannot be done from a coding session, only from the
Cloudflare dashboard directly:** `dan72ros@gmail.com` verified as a
destination address (Email Routing or Email Service -> Email Sending),
and `info@prismpublication.com` allowed as a sender. Until that's done,
the form fails cleanly ("Email is not configured") rather than silently.
**Not yet confirmed working end-to-end** -- nobody has actually submitted
the live form and confirmed an email arrived.

## Cross-listed on Prism Publication (18 September 2026)

All 15 products are now live as a "house ad" campaign in the chat at
`prismpublication.com/run-ads/` -- each piece its own entry (own title,
her own real one-sentence description, real product URL, her tags as
matching keywords), so a visitor's question surfaces whichever piece
actually fits, not one blanket shop link.

**No money crosses between the two systems.** Prism's ad-credit ($20 per
piece, nominal, no real PayPal transaction behind it) only governs
whether/how often the card shows in that chat. If a visitor clicks
through and actually buys a piece, that's a separate, real PayPal
transaction here on devorahsart.com, full stop, invisible to Prism.

Full detail and the actual database rows live in Prism's own
`mem/current.md` (`prismpublication-sept` repo), not duplicated here.
**If this catalog changes** (a piece added, removed, retitled, repriced),
**Prism's copy of that listing does not update itself** -- it would need
a separate, explicit update on that side.

## Deploy: confirmed different from what the code implies

`package.json`'s `deploy` script (`npm run build && wrangler pages deploy
.`) implies a manual, local Wrangler push is required for anything to go
live. **That may not be the whole picture.** After pushing the PayPal fix
to `master`, the Cloudflare dashboard (Workers & Pages -> devorahsart ->
Deployments) showed a new version deployed ~48 seconds later, labeled "by
Claude" with the commit's own message, source tagged
`northpointalliance/devorahsart`. That strongly suggests **Git integration
is actually active** and a push to `master` auto-deploys, contradicting
the manual-only assumption. Not fully confirmed either way, treat "does a
push alone go live" as an open question until someone watches the
Deployments tab after a push and confirms directly, rather than assuming
`npm run deploy` is always required.

## Unresolved from this session, never confirmed

Two product URLs Daniel mentioned wanting added, `the-woman-on-the-bus`
and `the-beloved-mug`, **do not exist anywhere in this repo** -- checked
`sitemap.xml`, `data/products.json`, and the full `product/` directory
listing; only one branch, one commit, not a stale-clone issue. The
closest real match for "the woman on the bus" is **Headphones Commute**
(`/product/headphones-commute/`, "two women lost in their headphones on a
bus"), already live either way as part of the 15. "The Beloved Mug" has
no match at all, anywhere, not even a filename. Daniel insisted the URLs
were copied directly from the live site, which raised the real
possibility this GitHub repo and what's actually deployed have diverged
(a Wrangler CLI deploy doesn't require a Git push first). Never
independently confirmed either way, worth re-checking directly against
the live site rather than assuming the repo is 100% authoritative.

## Also true, not yet acted on

- No CLAUDE.md exists for this repo yet.
- `README.md` (repo root and `devorahsart-site/`) and `ARCHITECTURE.md`
  updated 18 September 2026 to reflect everything above; treat those,
  plus this file, as current -- `devorahsart-site-handover.md` and
  `Devorahs-Art-Rethink-Plan.md` are explicitly historical (July 2026
  WordPress migration), not maintained going forward.
