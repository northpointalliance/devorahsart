import { calculateCartTotal } from "./pricing.js";
import { CATALOG, PAYPAL_BUSINESS, SITE_URL } from "./catalog.js";

const STORAGE_KEY = "devorahsart-cart";

function catalogById() {
return new Map(CATALOG.map((item) => [item.id, item]));
}

function readCart() {
try {
const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
if (!Array.isArray(raw)) return [];
const byId = catalogById();
return raw
.map((row) => {
const product = byId.get(row.id);
if (!product) return null;
return {
id: product.id,
title: product.title,
price: product.price,
slug: product.slug,
image: product.image,
qty: Math.max(1, Number(row.qty) || 1),
};
})
.filter(Boolean);
} catch {
return [];
}
}

function writeCart(items) {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify(items.map(({ id, qty }) => ({ id, qty })))
);
renderCartChrome();
}

function itemCount(items = readCart()) {
return items.reduce((sum, item) => sum + item.qty, 0);
}

function addToCart(id) {
const product = catalogById().get(id);
if (!product) return;
const items = readCart();
const existing = items.find((item) => item.id === id);
if (existing) existing.qty += 1;
else items.push({ ...product, qty: 1 });
writeCart(items);
}

function setQty(id, qty) {
const nextQty = Math.max(0, Number(qty) || 0);
const items = readCart().filter((item) => {
if (item.id !== id) return true;
item.qty = nextQty;
return nextQty > 0;
});
writeCart(items);
}

function money(value) {
return `$${Number(value).toFixed(2)}`;
}

function renderCartChrome() {
const count = itemCount();
document.querySelectorAll("[data-cart-count]").forEach((el) => {
el.textContent = String(count);
el.hidden = count === 0;
});
document.querySelectorAll("[data-cart-label]").forEach((el) => {
el.textContent = count === 1 ? "Cart (1)" : `Cart (${count})`;
});
}

function renderCartPage() {
const root = document.querySelector("[data-cart-root]");
if (!root) return;

const items = readCart();
const totals = calculateCartTotal(items);

if (!items.length) {
root.innerHTML = `<p class="product-detail__answer">Your cart is empty. Browse the shop and add three pieces to unlock the $10 bundle.</p>
<p><a class="btn-buy" href="/">Shop the collection</a></p>`;
return;
}

const rows = items
.map(
(item) => `<tr>
<th scope="row"><a href="/product/${item.slug}/">${escapeHtml(item.title)}</a></th>
<td>${money(item.price)}</td>
<td>
<label class="cart-qty">
<span class="visually-hidden">Quantity for ${escapeHtml(item.title)}</span>
<input type="number" min="1" max="9" value="${item.qty}" data-cart-qty="${escapeHtml(item.id)}">
</label>
</td>
<td>${money(item.price * item.qty)}</td>
<td><button type="button" class="cart-remove" data-cart-remove="${escapeHtml(item.id)}">Remove</button></td>
</tr>`
)
.join("");

const savingsRow = totals.hasBundleApplied
? `<p class="cart-savings" role="status">3 for $10 applied. You save ${money(totals.savings)}.</p>`
: `<p class="cart-hint">Add ${3 - (itemCount(items) % 3)} more piece${itemCount(items) % 3 === 2 ? "" : "s"} to trigger a $10 bundle on the three highest-priced files.</p>`;

root.innerHTML = `
<table class="artwork-specs cart-table">
<caption class="visually-hidden">Items in your cart</caption>
<thead>
<tr><th scope="col">Piece</th><th scope="col">Price</th><th scope="col">Qty</th><th scope="col">Line</th><th scope="col"> </th></tr>
</thead>
<tbody>${rows}</tbody>
</table>
<p><strong>List subtotal:</strong> ${money(totals.subtotal)}</p>
${savingsRow}
<p class="product-detail__price">Pay today: ${money(totals.finalTotal)}</p>
<form id="paypal-cart-form" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_cart">
<input type="hidden" name="upload" value="1">
<input type="hidden" name="business" value="${escapeHtml(PAYPAL_BUSINESS)}">
<input type="hidden" name="currency_code" value="USD">
<input type="hidden" name="no_shipping" value="1">
<input type="hidden" name="return" value="${escapeHtml(SITE_URL)}/thank-you/">
${paypalFields(items, totals)}
<button type="submit" class="btn-buy">Checkout with PayPal for ${money(totals.finalTotal)}</button>
</form>
<p class="delivery-note">After payment, Devorah emails every high-resolution file in this order within 24 hours.</p>`;
}

function paypalFields(items, totals) {
const fields = [];
let index = 1;
for (const item of items) {
fields.push(`<input type="hidden" name="item_name_${index}" value="${escapeHtml(item.title)} (Digital Download)">`);
fields.push(`<input type="hidden" name="amount_${index}" value="${Number(item.price).toFixed(2)}">`);
fields.push(`<input type="hidden" name="quantity_${index}" value="${item.qty}">`);
index += 1;
}
if (Number(totals.savings) > 0) {
fields.push(`<input type="hidden" name="discount_amount_cart" value="${totals.savings}">`);
}
return fields.join("\n");
}

function escapeHtml(text) {
return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;");
}

function announce(message) {
const live = document.querySelector("[data-cart-live]");
if (live) live.textContent = message;
}

document.addEventListener("click", (event) => {
const add = event.target.closest("[data-add-to-cart]");
if (add) {
const id = add.getAttribute("data-add-to-cart");
addToCart(id);
const product = catalogById().get(id);
announce(`${product ? product.title : "Piece"} added to cart.`);
return;
}

const remove = event.target.closest("[data-cart-remove]");
if (remove) {
setQty(remove.getAttribute("data-cart-remove"), 0);
renderCartPage();
}
});

document.addEventListener("change", (event) => {
const qty = event.target.closest("[data-cart-qty]");
if (!qty) return;
setQty(qty.getAttribute("data-cart-qty"), qty.value);
renderCartPage();
});

renderCartChrome();
renderCartPage();

export { addToCart };
