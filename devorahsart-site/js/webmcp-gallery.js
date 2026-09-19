export const SITE_URL = "https://devorahsart.com";
export const COMMISSION_EMAIL = "dan72ros@gmail.com";
export const COMMISSION_MIN = 30;
export const COMMISSION_MAX = 60;
export const NOT_FOR_SALE_IDS = new Set(["angel-beats", "angelbeats"]);

function norm(value) {
return String(value || "")
.trim()
.toLowerCase()
.replace(/['’]/g, "")
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-|-$/g, "");
}

export function normalizeMedia(media) {
const raw = String(media || "").trim().toLowerCase();
if (!raw || raw === "all" || raw === "any") return null;
if (/\b(digital|composition|clipart|laptop)\b/.test(raw)) return "Digital";
if (/\b(traditional|paint|acrylic|pencil|scan|sketch|hand-?drawn|hand-?painted)\b/.test(raw)) {
return "Traditional";
}
return null;
}

function haystack(product) {
return [
product.id,
product.title,
product.slug,
product.type,
product.description,
product.useCase,
...(product.tags || []),
]
.filter(Boolean)
.join(" ")
.toLowerCase();
}

export function matchesStyle(product, style) {
const query = String(style || "").trim().toLowerCase();
if (!query) return true;
const hay = haystack(product);
if (hay.includes(query)) return true;
return query.split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
}

export function summarizePiece(product) {
return {
id: product.id,
title: product.title,
type: product.type || "Traditional",
price_usd: product.price,
url: `${SITE_URL}/product/${product.slug}/`,
media: product.type === "Digital" ? "digital composition" : "traditional scan",
tags: (product.tags || []).slice(0, 4),
};
}

const MANGA_CATEGORY = /manga|anime|sketch|comic|pencil|illustration/;

export function browseMangaArt(products, category) {
const list = Array.isArray(products) ? products : [];
const cat = String(category || "").trim().toLowerCase();
const filtered = list.filter((product) => {
if (NOT_FOR_SALE_IDS.has(norm(product.id))) return false;
if (!cat || cat === "all" || cat === "manga") {
return MANGA_CATEGORY.test(haystack(product));
}
return matchesStyle(product, cat);
});

return filtered.map((product) => ({
title: product.title,
price: product.price,
available: true,
id: product.id,
url: `${SITE_URL}/product/${product.slug}/`,
}));
}

export function browseGallery(products, { style, media } = {}) {
const list = Array.isArray(products) ? products : [];
const mediaType = normalizeMedia(media);
const filtered = list.filter((product) => {
if (mediaType && product.type !== mediaType) return false;
return matchesStyle(product, style);
});

return {
count: filtered.length,
pieces: filtered.map(summarizePiece),
print_pricing: {
traditional_usd: 5,
digital_usd: 3,
bundle: "Any 3 prints $10",
},
note:
"Shop files are high-resolution digital downloads. Physical originals and custom portrait commissions, when offered, are $30 to $60.",
};
}

export function findPiece(products, pieceId) {
const raw = String(pieceId || "").trim();
const key = norm(raw);
if (!key) return { status: "invalid" };
if (NOT_FOR_SALE_IDS.has(key)) return { status: "not_for_sale", id: key };

const list = Array.isArray(products) ? products : [];
const hit = list.find((product) => {
return (
norm(product.id) === key ||
norm(product.slug) === key ||
norm(product.title) === key
);
});

return hit ? { status: "found", product: hit } : { status: "missing", id: key };
}

export function checkArtworkAvailability(products, pieceId) {
const found = findPiece(products, pieceId);
if (found.status === "invalid") {
return { available: false, reason: "Pass a piece id, slug, or title from the shop." };
}
if (found.status === "not_for_sale") {
return {
available: false,
reason: "That title is not a shop SKU. Browse the gallery for prints that are for sale.",
};
}
if (found.status === "missing") {
return {
available: false,
reason: "No matching piece in the shop. Use browse_gallery to list current ids.",
};
}

const product = found.product;
return {
available: true,
fulfillment: "digital_download",
id: product.id,
title: product.title,
type: product.type || "Traditional",
price_usd: product.price,
currency: "USD",
url: `${SITE_URL}/product/${product.slug}/`,
cart_url: `${SITE_URL}/cart/`,
bundle: "Any 3 prints $10",
delivery: "High-resolution file by email within 24 hours of PayPal payment.",
note: "Physical originals are not listed as shop SKUs. Prints stay $3 or $5.",
};
}

export function inquireCommission({ brief, name, email, piece_id } = {}) {
const text = String(brief || "").trim();
if (text.length < 8) {
return {
ok: false,
error: "Need a short brief: subject, size, or reference. Commissions are $30 to $60.",
};
}

const lines = [
"Hello Devorah,",
"",
`Brief: ${text}`,
];
if (name) lines.push(`Name: ${String(name).trim()}`);
if (email) lines.push(`Reply email: ${String(email).trim()}`);
if (piece_id) lines.push(`Related piece: ${String(piece_id).trim()}`);
lines.push("", "I understand custom portraits are $30 to $60 when offered.");

const subject = "Commission inquiry: Devorah's Art";
const mailto = `mailto:${COMMISSION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

return {
ok: true,
price_range_usd: { min: COMMISSION_MIN, max: COMMISSION_MAX },
email: COMMISSION_EMAIL,
mailto,
next: "Review the draft with the buyer, then send. This does not place an order.",
};
}
