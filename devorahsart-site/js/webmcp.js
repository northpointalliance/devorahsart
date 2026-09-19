import catalog from "../data/products.json" with { type: "json" };
import { registerWebMCPTool } from "./webmcp-register.js";
import {
browseGallery,
browseMangaArt,
checkArtworkAvailability,
inquireCommission,
} from "./webmcp-gallery.js";
import { addToCart } from "./cart.js";

const products = catalog.products || [];

function toolResult(payload) {
return { content: [{ type: "text", text: JSON.stringify(payload) }] };
}

function registerTools() {
registerWebMCPTool({
name: "browse_manga_art",
description:
"Search original hand-drawn artwork, sketches, and manga gallery pieces in the Devorah's Art shop. Handmade human prints only. Returns title, price, and availability. Any 3 prints $10.",
inputSchema: {
type: "object",
properties: {
category: {
type: "string",
description: "Optional category such as manga, sketch, portrait, or coastal. Defaults to manga and sketchbook pieces.",
},
},
},
annotations: { readOnlyHint: true },
execute({ category } = {}) {
return toolResult({
pieces: browseMangaArt(products, category),
bundle: "Any 3 prints $10",
note: "Digital downloads from the live shop catalog. Angel Beats is not a shop SKU.",
});
},
});

registerWebMCPTool({
name: "browse_gallery",
description:
"List Devorah's Art shop prints. Filter by style (manga, portrait, coastal, studio) and media (traditional scan or digital composition). Returns ids, titles, USD prices, and product URLs. Handmade human art only. Any 3 prints $10.",
inputSchema: {
type: "object",
properties: {
style: {
type: "string",
description: "Optional theme or tag, such as manga, anime, portrait, or coastal.",
},
media: {
type: "string",
description: "Optional medium: traditional, digital, or all.",
},
},
},
annotations: { readOnlyHint: true },
execute({ style, media } = {}) {
return toolResult(browseGallery(products, { style, media }));
},
});

registerWebMCPTool({
name: "check_artwork_availability",
description:
"Confirm whether a shop piece is for sale as a digital download. Pass id, slug, or title from browse_gallery. Optionally add the print to the visitor cart. Does not complete PayPal checkout.",
inputSchema: {
type: "object",
properties: {
piece_id: {
type: "string",
description: "Catalog id, URL slug, or exact title.",
},
add_to_cart: {
type: "boolean",
description: "If true, add one copy to the visitor cart and open /cart/.",
},
},
required: ["piece_id"],
},
execute({ piece_id, add_to_cart } = {}) {
const result = checkArtworkAvailability(products, piece_id);
if (result.available && add_to_cart) {
addToCart(result.id);
window.location.assign("/cart/");
result.added_to_cart = true;
}
return toolResult(result);
},
});

registerWebMCPTool({
name: "inquire_commission",
description:
"Draft a custom portrait or original commission request ($30 to $60). Opens a mailto draft for the buyer to send. Does not charge a card or invent a shop SKU.",
inputSchema: {
type: "object",
properties: {
brief: {
type: "string",
description: "What to paint: subject, size, or reference.",
},
name: { type: "string", description: "Buyer name." },
email: { type: "string", description: "Buyer reply email." },
piece_id: {
type: "string",
description: "Optional shop piece to use as a style reference.",
},
},
required: ["brief"],
},
execute({ brief, name, email, piece_id } = {}) {
const result = inquireCommission({ brief, name, email, piece_id });
if (result.ok && result.mailto) {
window.location.assign(result.mailto);
}
return toolResult(result);
},
});
}

registerTools();
