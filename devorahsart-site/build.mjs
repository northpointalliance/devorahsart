import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root, "data/products.json"), "utf8"));
const { site, products } = data;
const LAST_UPDATED = "2026-07-21";

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function goldSection({ id, question, answer, details, tldr, links = [] }) {
  const linkHtml = links.length
    ? `<p class="section-links"><strong>Explore:</strong> ${links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join(" · ")}</p>`
    : "";
  return `<section class="seo-section" aria-labelledby="${id}">
    <h2 id="${id}">${esc(question)}</h2>
    <p class="product-detail__answer">${esc(answer)}</p>
    <p>${esc(details)}</p>
    <p class="tldr"><strong>TLDR:</strong> ${esc(tldr)}</p>
    ${linkHtml}
  </section>`;
}

function header(active = "") {
  const shopCurrent = active === "shop" ? ' aria-current="page"' : "";
  const aboutCurrent = active === "about" ? ' aria-current="page"' : "";
  const faqCurrent = active === "faq" ? ' aria-current="page"' : "";
  return `<header class="site-header">
    <div class="site-header__inner">
      <a class="site-logo" href="/">Devorah's Art</a>
      <nav class="site-nav" aria-label="Main">
        <a href="/"${shopCurrent}>Shop</a>
        <a href="/about/"${aboutCurrent}>About</a>
        <a href="/faq/"${faqCurrent}>FAQ</a>
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="site-footer__inner">
      <p>Original hand-painted digital art by Devorah. Affordable portraits you can print and hang at home.</p>
      <nav aria-label="Footer">
        <a href="/">Shop</a>
        <a href="/about/">About</a>
        <a href="/faq/">FAQ</a>
      </nav>
      <p class="site-footer__legal">© ${new Date().getFullYear()} Devorah's Art. Digital downloads for personal use. All prices in USD ($10). Last updated ${LAST_UPDATED}.</p>
    </div>
  </footer>`;
}

function shell({ title, description, canonical, jsonLd, active, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(active)}
  <main id="main">${body}</main>
  ${footer()}
</body>
</html>`;
}

function paypalForm(product) {
  return `<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_xclick">
    <input type="hidden" name="business" value="${esc(site.paypalBusiness)}">
    <input type="hidden" name="item_name" value="${esc(product.title)} (Digital Download)">
    <input type="hidden" name="amount" value="${product.price.toFixed(2)}">
    <input type="hidden" name="currency_code" value="${product.currency}">
    <input type="hidden" name="no_shipping" value="1">
    <input type="hidden" name="return" value="${site.url}/thank-you/">
    <button type="submit" class="btn-buy">Buy with PayPal for $${product.price}</button>
  </form>`;
}

function relatedProducts(current) {
  const others = products.filter((p) => p.id !== current.id).slice(0, 3);
  const links = others
    .map((p) => `<li><a href="/product/${p.slug}/">${esc(p.title)}</a>, $${p.price}</li>`)
    .join("");
  return `<section class="seo-section" aria-labelledby="related">
    <h2 id="related">Which other pieces pair well with ${esc(current.title)}?</h2>
    <p class="product-detail__answer">${esc(current.title)} sits alongside Devorah's other $10 portrait downloads, each one hand-painted in the same expressive, anime-influenced style.</p>
    <p>Collectors often mix emotional portraits with colorful character studies. Browse related work below or return to the full shop.</p>
    <ul class="related-list">${links}</ul>
    <p class="tldr"><strong>TLDR:</strong> Every piece is $10, same format, same artist. Easy to build a small gallery wall affordably.</p>
    <p class="section-links"><strong>Explore:</strong> <a href="/">Full shop</a> · <a href="/about/">About Devorah</a></p>
  </section>`;
}

function productPage(product) {
  const url = `${site.url}/product/${product.slug}/`;
  const tags = product.tags.map((t) => `<li>${esc(t)}</li>`).join("");
  const badge = product.isNew ? '<span class="badge-new">New</span>' : "";
  const useCase = product.useCase || "bedrooms, creative workspaces, and anywhere you want art with real feeling";

  const body = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Shop</a> / ${esc(product.title)}
    </nav>
    <article class="product-detail">
      <div class="product-layout">
        <img class="product-image" src="${product.image}" alt="${esc(product.imageAlt)}" width="800" height="1000">
        <div>
          ${badge}
          <h1>${esc(product.title)}</h1>
          <p class="product-detail__price">$${product.price} digital download</p>
          <p class="product-detail__description">${esc(product.description)}</p>
          ${paypalForm(product)}
          <p class="delivery-note">After payment, your high-resolution file is delivered by email within 24 hours.</p>
          <ul class="tags" aria-label="Tags">${tags}</ul>
        </div>
      </div>
      ${goldSection({
        id: "faq1",
        question: product.faqQuestion,
        answer: product.faqAnswer,
        details:
          "Devorah paints in bold acrylics at her studio in Israel. Each file is scanned in high resolution so you can print at poster size or smaller without losing detail. This is original art, not a mass-produced print run.",
        tldr: `${product.title} is a $10 high-res digital download by Devorah, ready to print at any size.`,
        links: [
          { href: "/", label: "Shop all portraits" },
          { href: "/faq/", label: "FAQ" },
        ],
      })}
      ${goldSection({
        id: "faq2",
        question: "How do I buy and receive the file?",
        answer: `Click the PayPal button above, pay $${product.price}, and Devorah sends your high-resolution file by email within 24 hours.`,
        details:
          "Checkout runs through PayPal. No account on this site is required. After payment, check your inbox and spam folder. You can print at home on any paper stock or send the file to a local print shop, Costco, Walgreens, or an online printer.",
        tldr: "Pay $10 via PayPal, receive the file by email within 24 hours, print anywhere.",
        links: [{ href: "/faq/", label: "Full FAQ" }],
      })}
      ${goldSection({
        id: "faq3",
        question: `Where does ${product.title} work best on a wall?`,
        answer: `${product.title} fits naturally in ${useCase}. At $10, it is an easy way to add original art without committing to an expensive canvas.`,
        details:
          "Digital downloads let you choose the exact size for your space. A bedroom might call for an 8×10, while a studio wall might suit an 18×24. Because you receive the full-resolution file, scaling up or down is entirely your choice.",
        tldr: "Print any size for any room: bedroom, office, nursery, or gift.",
        links: [{ href: "/about/", label: "About the artist" }],
      })}
      ${relatedProducts(product)}
    </article>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.title,
        description: product.metaDescription,
        image: `${site.url}${product.image}`,
        brand: { "@type": "Brand", name: site.name },
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: product.currency,
          availability: "https://schema.org/InStock",
          url,
        },
      },
      {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
    ],
  };

  return shell({
    title: `${product.seoTitle} | ${site.name}`,
    description: product.metaDescription,
    canonical: url,
    jsonLd,
    active: "shop",
    body,
  });
}

function homepageSeoSections() {
  return [
    goldSection({
      id: "what-is",
      question: "What is Devorah's Art?",
      answer:
        "Devorah's Art is an online gallery of original hand-painted portraits sold as affordable digital downloads. Every piece on devorahsart.com is painted by Devorah, a young Israeli artist, and delivered as a high-resolution file you print at home.",
      details:
        "Unlike print-on-demand shops that sell the same stock image to thousands of buyers, each painting here starts on canvas in a real studio. Subjects range from everyday commute scenes and emotional portraits to playful character studies and tender nursery art. The site exists so anyone, anywhere, can own original art for $10 without shipping delays or gallery markups.",
      tldr: "Original acrylic portraits by Devorah: $10 digital downloads, print at any size.",
      links: [
        { href: "/about/", label: "Meet Devorah" },
        { href: "/product/headphones-commute/", label: "Headphones Commute (new)" },
      ],
    }),
    goldSection({
      id: "how-much",
      question: "How much does printable digital art cost on this site?",
      answer:
        "Every piece on Devorah's Art costs $10 ($10.00 USD) as a one-time digital download. There are no subscriptions, no hidden fees, and no shipping charges because nothing physical is mailed.",
      details:
        "At $10, each portrait is priced for students, first apartments, nurseries, and gift-givers who want real art without a $200 price tag. PayPal handles checkout securely. After purchase, Devorah emails the high-resolution file within 24 hours. You then print once or several times for personal use: a 5×7 for a desk frame, an 11×14 for a bedroom, or larger if your printer or local shop supports it.",
      tldr: "Flat $10 per piece. Digital download only, no shipping.",
      links: [{ href: "/faq/", label: "How buying works" }],
    }),
    goldSection({
      id: "what-style",
      question: "What style of art does Devorah paint?",
      answer:
        "Devorah paints expressive acrylic portraits influenced by anime, pop art, and classical figure painting. Her brushwork is loose and emotional rather than photorealistic: bold color, honest feeling, everyday subjects.",
      details:
        "You will find girls lost in headphones on a bus, fathers caught in quiet reflection, wild-haired characters full of energy, and small tender objects like teddy bears that carry nostalgia. The through-line is feeling: each piece captures a mood you recognize even if you have never met the subject. That mix of anime-influenced composition and painterly texture is what makes the work stand out in a crowded digital art market.",
      tldr: "Anime-influenced expressive acrylic portraits with bold color and real emotion.",
      links: [
        { href: "/product/girl-with-orange-green-blue/", label: "Colorful Confidence" },
        { href: "/product/girl-with-the-wild-hair/", label: "Free Spirit" },
      ],
    }),
    goldSection({
      id: "how-downloads",
      question: "How do digital art downloads work?",
      answer:
        "Pick a portrait, pay $10 through PayPal, and receive a high-resolution file by email within 24 hours. Open the file on your computer or phone and send it to your home printer or a local print shop.",
      details:
        "Digital downloads remove warehousing, shipping, and inventory costs, which is how original art stays at $10. The file is yours for personal printing and display. Most buyers use standard photo paper, cardstock, or premium matte paper depending on the room. Online printers like Printful or local shops can produce gallery-quality results if you want something larger than your home printer handles.",
      tldr: "Buy → email delivery → print at any size, anywhere.",
      links: [{ href: "/faq/", label: "FAQ" }],
    }),
    goldSection({
      id: "why-independent",
      question: "Why buy art directly from an independent young artist?",
      answer:
        "When you buy from Devorah's Art, your $10 goes to the person who painted the piece, not a middleman, stock-image platform, or mass-market poster factory.",
      details:
        "Independent artists rely on direct sales to keep painting. Devorah works in a Tel Aviv studio; studio photos on the About page show the actual creative process. Collectors increasingly search for 'affordable original art,' 'support emerging artists,' and 'digital download portrait'. Buying here answers all three. You get a file with a story behind it, and Devorah gets to keep making work.",
      tldr: "Direct purchase supports Devorah's studio practice: real art, real artist.",
      links: [{ href: "/about/", label: "About Devorah" }],
    }),
    goldSection({
      id: "print-size",
      question: "Can I print Devorah's art at any size?",
      answer:
        "Yes. Each file is scanned in high resolution so you can print small (5×7 in) or large (18×24 in and beyond) depending on your printer or print shop.",
      details:
        "Digital art downloads are popular precisely because scale is flexible. A nursery might want a soft 8×10; a dorm room might want a bold 16×20. Because you receive the master file, you are not locked into one size. For best results, use a reputable print shop for sizes above 11×14 and choose matte or semi-gloss paper for portrait work.",
      tldr: "High-res files. Print small or large, your choice.",
      links: [{ href: "/product/teddy-bear/", label: "Comfort in Quiet (nursery)" }],
    }),
    goldSection({
      id: "anime-wall-art",
      question: "Why is anime-influenced portrait art popular for wall decor?",
      answer:
        "Anime-influenced portraits combine expressive faces, vivid color, and relatable characters, the same qualities that make illustration share well on Pinterest, Instagram, and TikTok.",
      details:
        "Search interest in 'anime wall art,' 'printable portrait download,' and 'colorful girl painting' continues to grow among younger buyers decorating first homes and creative spaces. Devorah's work sits in that sweet spot: anime energy without being a copy of any single franchise character. Pieces like Free Spirit and Colorful Confidence appeal to buyers who want personality on the wall without commissioning a custom painting.",
      tldr: "Expressive anime-influenced portraits = high shareability + affordable price.",
      links: [
        { href: "/product/feeling-unheard/", label: "Silent Expressions" },
        { href: "/product/portrait-with-dog/", label: "Together Forever" },
      ],
    }),
    goldSection({
      id: "delivery-speed",
      question: "How quickly will I receive my file after purchase?",
      answer:
        "Devorah sends your high-resolution file by email within 24 hours of PayPal payment. Most orders arrive the same day.",
      details:
        "Instant delivery is one advantage digital downloads have over physical prints. There is no two-week shipping window. You can have the file tonight and print tomorrow morning. If an email does not arrive within 24 hours, check spam and reply to your PayPal receipt; the address on file is dan72ros@gmail.com.",
      tldr: "Email delivery within 24 hours, often same day.",
      links: [{ href: "/thank-you/", label: "After checkout" }],
    }),
  ].join("\n");
}

function shopPage() {
  const sortedProducts = [...products].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  const cards = sortedProducts
    .map((p) => {
      const badge = p.isNew ? '<span class="badge-new">New</span>' : "";
      return `<article class="product-card">
        <a href="/product/${p.slug}/" class="product-card__link-wrap">
          <img class="product-card__image" src="${p.image}" alt="${esc(p.imageAlt)}" width="300" height="375" loading="lazy">
        </a>
        <div class="product-card__body">
          ${badge}
          <h2 class="product-card__title"><a href="/product/${p.slug}/">${esc(p.title)}</a></h2>
          <p class="product-card__price">$${p.price}</p>
          <a class="product-card__link" href="/product/${p.slug}/">View &amp; buy →</a>
        </div>
      </article>`;
    })
    .join("\n");

  const faqForSchema = [
    {
      q: "What is Devorah's Art?",
      a: "An online gallery of original hand-painted portraits sold as $10 high-resolution digital downloads by Devorah, a young Israeli artist.",
    },
    {
      q: "How much does each piece cost?",
      a: "Every piece costs $10 USD as a one-time digital download with no shipping fees.",
    },
    {
      q: "How do I receive my file?",
      a: "After PayPal checkout, Devorah emails your high-resolution file within 24 hours.",
    },
  ];

  const body = `
    <section class="hero">
      <h1>${esc(site.tagline)}</h1>
      <p>${esc(site.intro)}</p>
      <p class="updated-note">Collection updated ${LAST_UPDATED}. Six new pieces added, including <a href="/product/window-seat-waves/">Window Seat Waves</a> and <a href="/product/through-the-lens/">Through the Lens</a>.</p>
    </section>
    <h2 class="section-title">Shop the collection</h2>
    <div class="gallery">${cards}</div>
    <div class="seo-content">${homepageSeoSections()}</div>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: site.name,
        url: site.url,
        description: site.intro,
        potentialAction: {
          "@type": "SearchAction",
          target: `${site.url}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: site.name,
        url: site.url,
        description: "Original hand-painted digital art by Devorah, a young Israeli artist.",
      },
      {
        "@type": "ItemList",
        name: "Devorah's Art Shop",
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${site.url}/product/${p.slug}/`,
          name: p.title,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqForSchema.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return shell({
    title: "Affordable Digital Art Downloads | Hand-Painted Portraits $10 | Devorah's Art",
    description:
      "Shop original acrylic portraits by Devorah, a young Israeli artist. Anime-influenced digital art downloads for $10. Print at any size. Headphones Commute, colorful portraits, nursery art & more.",
    canonical: `${site.url}/`,
    jsonLd,
    active: "shop",
    body,
  });
}

function aboutPage() {
  const body = `
    <article class="content-page">
      <h1>Meet Devorah</h1>
      <p class="lead">Devorah is a young artist based in Israel who paints what she feels, and sells every piece as an affordable $10 digital download.</p>
      <img class="content-image" src="/assets/images/devorah-painting.jfif" alt="Devorah painting in her Tel Aviv studio" width="800" height="600" loading="lazy">
      ${goldSection({
        id: "who",
        question: "Who is Devorah?",
        answer:
          "Devorah is a young Israeli artist who works in bold acrylics, turning everyday moments into expressive portraits influenced by anime and classical figure painting.",
        details:
          "She paints in a Tel Aviv studio: commute scenes, family portraits, wild-haired characters, and tender objects like teddy bears. Her brushwork is loose and honest rather than polished and distant. Buyers who want 'art from a real young artist' rather than anonymous stock imagery come to Devorah's Art for exactly that reason.",
        tldr: "Young Israeli acrylic portrait artist, expressive, anime-influenced, studio-based.",
        links: [{ href: "/", label: "Shop her work" }],
      })}
      ${goldSection({
        id: "why-digital",
        question: "Why does Devorah sell digital downloads instead of physical prints?",
        answer:
          "Digital downloads keep each original painting affordable at $10 and let buyers anywhere in the world print at their preferred size without shipping costs or delays.",
        details:
          "Physical print-on-demand adds production markup and weeks of waiting. By scanning paintings in high resolution and delivering files by email, Devorah removes those barriers. You choose the paper, the frame, and the size, from a desk print to a statement wall piece.",
        tldr: "$10 digital files. Print locally, any size, no shipping.",
        links: [{ href: "/faq/", label: "FAQ" }],
      })}
      ${goldSection({
        id: "studio",
        question: "Where does Devorah create her art?",
        answer:
          "Devorah paints at Tel Aviv Art Studio, working on paper and canvas with acrylics, headphones sometimes on, surrounded by color tubes and easels.",
        details:
          "Studio photos on this page show the actual environment: paint-splattered tables, reference photos, and works in progress. That transparency builds trust: you are buying from a person, not a faceless marketplace. When Devorah finishes a new piece like Headphones Commute, she scans it and adds it to the shop within days.",
        tldr: "Tel Aviv studio, real process, real paintings.",
        links: [{ href: "/product/headphones-commute/", label: "Latest: Headphones Commute" }],
      })}
      <p><a class="btn-buy" href="/">Shop the collection →</a></p>
    </article>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: "Original hand-painted digital art by Devorah, a young Israeli artist.",
    founder: { "@type": "Person", name: "Devorah" },
  };

  return shell({
    title: "About Devorah | Young Israeli Portrait Artist | Devorah's Art",
    description:
      "Meet Devorah, a young Israeli artist who paints bold acrylic portraits in Tel Aviv. Every piece is a $10 high-resolution digital download, ready to print and hang at home.",
    canonical: `${site.url}/about/`,
    jsonLd,
    active: "about",
    body,
  });
}

const faqItems = [
  {
    q: "What do I get when I buy a piece?",
    answer:
      "You receive a high-resolution digital file by email within 24 hours of PayPal payment. The file is ready to print at home or through any print shop, at any size you choose.",
    details:
      "Each purchase includes one master file scanned from Devorah's original painting. Print for personal use in as many sizes as you like for your own home, not for resale.",
    tldr: "High-res file by email within 24 hours.",
    links: [{ href: "/", label: "Shop" }],
  },
  {
    q: "How do I pay for digital art on Devorah's Art?",
    answer:
      "Every piece costs $10 USD. Checkout runs through PayPal. Click Buy with PayPal on any product page. No account on devorahsart.com is required.",
    details:
      "PayPal works internationally including Israel. Payment goes directly to Devorah's PayPal Business account. After payment you are redirected to a thank-you page while your file is prepared for email delivery.",
    tldr: "$10 via PayPal. No site account needed.",
    links: [{ href: "/product/headphones-commute/", label: "Example product page" }],
  },
  {
    q: "Can I print the art more than once?",
    answer:
      "Yes, for personal use. Each purchase grants you the right to print and display the art in your own home, not to resell the file or use it commercially.",
    details:
      "Many buyers print a backup copy or try two sizes before framing. That flexibility is a core benefit of digital downloads over single-size physical prints.",
    tldr: "Multiple personal prints allowed. No commercial use.",
    links: [{ href: "/faq/", label: "This page" }],
  },
  {
    q: "Does Devorah ship physical prints?",
    answer:
      "Not at this time. Every piece is a digital download only, which keeps the price at $10 and lets you control print quality, paper, and framing locally.",
    details:
      "If demand grows, physical options may come later. For now the focus is fast, affordable access to original art worldwide.",
    tldr: "Digital only. You handle printing.",
    links: [{ href: "/about/", label: "About Devorah" }],
  },
  {
    q: "What print sizes work best?",
    answer:
      "Files are high resolution, so common sizes from 5×7 in up to 18×24 in and larger work well. Match the size to the room: small for desks, medium for bedrooms, large for feature walls.",
    details:
      "Home inkjet printers handle up to 8.5×11 or A4 easily. For bigger prints, use a local or online print service and upload the file they receive from you after email delivery.",
    tldr: "5×7 to 18×24+. High-res supports large prints.",
    links: [{ href: "/product/teddy-bear/", label: "Nursery example" }],
  },
  {
    q: "Is Devorah's art good for gifts?",
    answer:
      "Yes. At $10, portraits make easy gifts for birthdays, Father's Day, dorm move-ins, and new babies, especially Father's Gaze, Together Forever, and Comfort in Quiet.",
    details:
      "Buy the download, print and frame it, and pair with a short note that it supports a young independent artist. Digital delivery also means last-minute gifts still work if you print locally the same day.",
    tldr: "$10 original art, great for meaningful affordable gifts.",
    links: [
      { href: "/product/portrait-of-father/", label: "Father's Gaze" },
      { href: "/product/portrait-with-dog/", label: "Together Forever" },
    ],
  },
  {
    q: "What is anime-influenced portrait art?",
    answer:
      "It is original figurative painting that borrows expressive faces, bold color, and character energy from anime illustration, without copying any licensed franchise.",
    details:
      "Devorah's style blends that visual language with acrylic painterliness. Pieces like Free Spirit and Colorful Confidence appeal to fans of illustrated wall art who want something unique rather than mass-market posters.",
    tldr: "Expressive illustrated portraits with anime energy, original subjects.",
    links: [{ href: "/product/girl-with-the-wild-hair/", label: "Free Spirit" }],
  },
  {
    q: "How often is new art added?",
    answer:
      "Devorah adds new paintings as she completes them. Recent additions include Headphones Commute (July 2026). The homepage and sitemap update when new work goes live.",
    details:
      "Following the studio process on social media (Pinterest and Reels are planned) is the best way to see work-in-progress before it hits the shop.",
    tldr: "New pieces added when finished. Check the shop regularly.",
    links: [{ href: "/product/headphones-commute/", label: "Headphones Commute" }],
  },
];

function faqPage() {
  const items = faqItems
    .map((f, i) =>
      goldSection({
        id: `faq-${i}`,
        question: f.q,
        answer: f.answer,
        details: f.details,
        tldr: f.tldr,
        links: f.links,
      })
    )
    .join("");

  const body = `<article class="content-page"><h1>Frequently asked questions</h1><p class="lead">Everything you need to know about buying $10 digital art downloads from Devorah's Art.</p>${items}</article>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: `${f.answer} ${f.tldr}` },
    })),
  };

  return shell({
    title: "FAQ | $10 Digital Art Downloads & Printable Portraits | Devorah's Art",
    description:
      "How buying works at Devorah's Art: $10 digital downloads, PayPal checkout, email delivery within 24 hours, print at any size. Answers about gifts, print sizes, and personal use.",
    canonical: `${site.url}/faq/`,
    jsonLd,
    active: "faq",
    body,
  });
}

function thankYouPage() {
  const body = `
    <article class="content-page content-page--center">
      <h1>Thank you for your purchase</h1>
      <p class="product-detail__answer">Your payment was received. Devorah will email your high-resolution file within 24 hours.</p>
      <p>Check your inbox (and spam folder) for an email from Devorah's Art. If you don't hear back within a day, reply to your PayPal receipt email and we'll sort it out.</p>
      <p><a class="btn-buy" href="/">Back to the shop →</a></p>
    </article>`;

  return shell({
    title: `Thank You | ${site.name}`,
    description: "Thank you for purchasing digital art from Devorah's Art. Your file will arrive by email within 24 hours.",
    canonical: `${site.url}/thank-you/`,
    jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "Thank You" },
    active: "",
    body,
  });
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

write(path.join(root, "index.html"), shopPage());

for (const product of products) {
  write(path.join(root, "product", product.slug, "index.html"), productPage(product));
}

write(path.join(root, "about/index.html"), aboutPage());
write(path.join(root, "faq/index.html"), faqPage());
write(path.join(root, "thank-you/index.html"), thankYouPage());

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.url}/</loc><lastmod>${LAST_UPDATED}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${site.url}/about/</loc><lastmod>${LAST_UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${site.url}/faq/</loc><lastmod>${LAST_UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
${products.map((p) => `  <url><loc>${site.url}/product/${p.slug}/</loc><lastmod>${LAST_UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`).join("\n")}
</urlset>`;

write(path.join(root, "sitemap.xml"), sitemap);
write(
  path.join(root, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`
);

const redirects = [
  "/shop/ / 301",
  "/shop / 301",
  "/product/ / 301",
  "/contact/ /faq/ 301",
  ...products.map((p) => `/product/${p.slug} /product/${p.slug}/ 301`),
].join("\n");

write(path.join(root, "_redirects"), redirects);

console.log(`Built ${products.length} product pages + SEO-optimized shop, about, faq`);
