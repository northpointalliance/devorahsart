/**
* Calculates total cart price applying the "3 for $10" bundle rule.
* Sorts items by price descending so highest value items get bundled into the $10 tier first.
*
* Example: [{price: 5}, {price: 5}, {price: 5}, {price: 3}]
* finalTotal = "13.00" ($10 bundle + $3 remainder), savings vs $18 list.
*/
export function calculateCartTotal(cartItems) {
const sortedPrices = cartItems
.flatMap((item) => {
const qty = Math.max(1, Number(item.qty) || 1);
const price = Number(item.price);
return Array.from({ length: qty }, () => price);
})
.sort((a, b) => b - a);

let total = 0;
const count = sortedPrices.length;

const bundleGroups = Math.floor(count / 3);

total += bundleGroups * 10.0;

const remainingPrices = sortedPrices.slice(bundleGroups * 3);
const remainderTotal = remainingPrices.reduce((sum, p) => sum + p, 0);
total += remainderTotal;

const rawTotal = sortedPrices.reduce((sum, p) => sum + p, 0);
if (total > rawTotal) total = rawTotal;

const savings = rawTotal - total;

return {
subtotal: rawTotal.toFixed(2),
finalTotal: total.toFixed(2),
savings: savings.toFixed(2),
hasBundleApplied: bundleGroups > 0 && savings > 0,
};
}
