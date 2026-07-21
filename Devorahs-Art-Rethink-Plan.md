# Devorah's Art — The Rethink

A plan for turning the site into a proper home for Devorah's work, and for using her new art to actually pull in traffic. Written plain, no jargon. Nothing here is built yet. This is the map so you can decide before we touch anything.

---

## 1. What changed, and why it matters

Two months ago this was eight $10 portrait downloads. Now Devorah is making three different kinds of art:

- **Still portraits** (live on the site now, $10 digital downloads).
- **Short animated pieces** (the "timer" videos on your phone). Think a few seconds of motion, closer to a moving illustration than a film.
- **A 90-page hand-drawn manga** based on the story Angel Beats.

That's not just "more art." It's three formats that each behave differently: one you sell, one that spreads on social, and one that builds a following. The whole point of this rethink is to stop forcing all of it through a heavy WordPress shop, and instead give each format the job it's actually good at, all pointing back to one goal: relevant people finding Devorah's work and buying it.

---

## 2. The core decision: what the site should run on

This is the one that matters, because everything else hangs off it. You're feeling that adding art and managing the site is a chore. You're right, and it's not you. WooCommerce on WordPress is a full online-store engine built for shops with hundreds of physical products, inventory, and shipping. For a small set of digital files, it's a lot of machine to maintain: WordPress updates, plugin updates, security, and the occasional thing that breaks and needs a developer. That's the same weight that made the Cloudflare session necessary.

**Decided: rebuild the site as a fast, simple gallery on Cloudflare Pages, with your own PayPal buttons for selling and email file delivery to start. No Payhip, no third-party checkout.**

Here's what that means in plain terms:

- **Cloudflare Pages** hosts the site itself. It's free, extremely fast, and there's nothing to maintain, no WordPress, no plugins, no security patching. This is the "use Cloudflare to the max" path that actually helps you, versus the developer features (Workers, databases) that wouldn't.
- **PayPal buttons** handle the buying, straight from your PayPal Business account (the same one the site uses now). No third-party platform, and no cut of your sales beyond PayPal's normal fee. To start, you deliver the file by email after each sale. Once sales pick up, I can automate delivery on Cloudflare so it happens instantly and securely.
- **You keep the domain and all the SEO work** we already did. The address stays devorahsart.com.

**The honest trade-offs:**

| | Rebuild on Cloudflare + PayPal | Keep WordPress + WooCommerce |
|---|---|---|
| Adding new art | A quick task I can do for you in minutes | Clunky WordPress product screens |
| Maintenance | None | Ongoing (updates, security, plugins) |
| Cost | Free hosting, only PayPal's normal fee | Hosting fee |
| Checkout | PayPal buttons, fully yours | Fully yours |
| File delivery | You email it (automate on Cloudflare later) | Automatic via plugin |
| Risk of breaking | Very low | Higher (moving parts) |
| Effort to switch | One-time rebuild | None |

The only real cost of switching is the one-time rebuild, and to start you deliver files by email instead of automatically. Given you sell $10 items part-time and don't want to babysit software, that's a good trade, and you keep every dollar minus PayPal's normal fee. When sales get steady enough that emailing files by hand gets annoying, I automate delivery on Cloudflare. Simplicity gets you to the first sale faster.

---

## 3. How "adding new art" becomes a five-minute job

This is the part you specifically wanted solved. Once the site is on Cloudflare Pages, the routine for a new piece looks like this:

1. Devorah finishes a piece. You drop the image (or video) into your connected folder.
2. You tell me, in plain English, "add this new piece, call it X, price $10."
3. I add it to the gallery, write the SEO-friendly description, set up its PayPal Buy button, and publish it to Cloudflare.
4. It's live, and it's already written to be found on Google.

No WordPress login, no plugin wrestling, no guessing. That's the workflow the rethink is built to unlock. It also means the SEO discipline from the fix pack gets applied automatically to every new piece, instead of being a thing you have to remember.

---

## 4. Animations as your traffic engine (the near-term play)

This is where the quickest wins are, and it's what you picked. Short art videos are the single best-performing kind of content on Pinterest, Instagram Reels, and TikTok right now, because the platforms push motion and people stop scrolling for it. A still portrait gets a glance. A portrait that comes alive for three seconds gets watched, saved, and shared.

The plan for the animations is not to sell them (yet). It's to use them as free advertising that points back to the site:

- **Each animation becomes a post** on Pinterest first (it behaves like a search engine and keeps sending traffic for months), then Reels and TikTok (short bursts of reach).
- **Every post links back** to devorahsart.com, ideally to a matching still portrait people can actually buy.
- **The hook is the making.** "Watch this portrait come to life" plus a glimpse of Devorah painting (you have studio photos already) is the kind of thing that travels. People buy from a real young artist, not a faceless shop.
- **Rhythm beats perfection.** A steady trickle, say two or three posts a week, teaches the algorithms to show her work. One viral-chasing masterpiece a month does not.

First practical step here: get the videos off your phone so we can see what we're working with and identify the app she used (that tells us her fastest path to making more). I can walk you through that whenever you want.

---

## 5. The manga: build an audience, mind the copyright

A 90-page hand-drawn manga is a serious body of work and a real audience magnet. But because it's based on Angel Beats, it uses characters and a story someone else owns. Fan art is a gray area that's usually tolerated when it's free and non-commercial. Selling it is where it turns into a legal risk, and it's not worth building a paid product on ground that isn't yours.

So the smart use of the manga is as a **free audience builder**, not a product:

- Publish it free, either in a "read the manga" section of the site or on a comics platform like Webtoon or Tapas where manga readers already are and can discover it.
- Use it to grow a following that then buys the original work Devorah fully owns (the portraits, and later original animated pieces).
- For anything you want to actually sell, steer Devorah toward an original story and characters. That's the version you can build a business on without looking over your shoulder.

This isn't legal advice, I'm not a lawyer. It's the cautious operator's read: free manga to pull people in, original work to sell.

---

## 6. Selling, and the Israel question

Good news from the last session: **PayPal works for you in Israel** (receive payments, withdraw to an Israeli bank in shekels), and your current WooCommerce checkout is already wired to it and functioning. So you are not blocked either way.

- On the **new Cloudflare site**, PayPal Buy buttons collect the money to that same account, and you email the file after each sale to start.
- If you had **kept WooCommerce**, it already works, you would just carry the maintenance.

Either path, PayPal is the engine. Stripe stays off the table for you, and none of this needs it.

---

## 7. The roadmap (in order, tied to the goal)

A sensible sequence so we're always moving toward the first sale and real traffic, not polishing in circles:

**Phase 1 — Make what's live actually sell (this week).**
Paste in the SEO fix pack (homepage, product descriptions, About page with Devorah's story). This works no matter which platform you choose, so it's safe to do now.

**Phase 2 — Turn on the traffic tap (this week).**
Set up Google Search Console (so Google indexes the fixed pages), and get the animations off your phone so we can start posting them to Pinterest.

**Phase 3 — Rebuild the platform (next).**
I build the new gallery on Cloudflare Pages, move the portraits over, add PayPal Buy buttons with an email-delivery process, and set up the five-minute "add new art" workflow.

**Phase 4 — Feed the machine (ongoing).**
Steady animation posts to Pinterest and Reels, new portraits added as Devorah makes them, manga published free to grow the audience.

You don't have to commit to all of it now. Phases 1 and 2 are pure upside and platform-independent. Phase 3 is the real decision.

---

## 8. What I need from you to move

1. **Platform:** decided. Rebuild as Cloudflare Pages with your own PayPal buttons and email delivery.
2. **The videos:** ready to get them off your phone so we can see them and find the app?
3. **The manga:** happy to treat it as a free audience builder rather than a paid product?

Tell me where you want to start and we go. My vote: do Phase 1 and 2 this week regardless, because they help under any plan, and sit on the platform decision until you've seen the first trickle of traffic.
