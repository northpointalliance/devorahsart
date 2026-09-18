// Public endpoint: POST /api/notify
// Checkout-help: a customer whose PayPal payment failed or timed out can
// report it here (email, which piece, what happened), and the site owner
// gets emailed so the order can be fulfilled manually. Self-contained
// Pages Function using a send_email binding -- replaces the old setup
// (this endpoint forwarding, via a wrangler.toml service binding, to a
// separate "devorahsart-notify" Worker that did the same thing one hop
// away). That indirection had no benefit for a single small site, so
// this collapses it into one place.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = "dan72ros@gmail.com"; // confirmed directly: the inbox actually checked, distinct from the PayPal-linked address
const FROM_EMAIL = "info@prismpublication.com"; // same sender identity the prior notify Worker used

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const customerEmail = String(body?.customerEmail || "").trim().toLowerCase();
  const selectedArtwork = String(body?.selectedArtwork || "").trim().slice(0, 500);
  const issueMessage = String(body?.issueMessage || "PayPal button failed or timed out.")
    .trim()
    .slice(0, 2000);

  if (!EMAIL_RE.test(customerEmail)) {
    return json({ success: false, error: "Valid email required" }, 400);
  }

  if (!env?.EMAIL?.send) {
    return json({ success: false, error: "Email is not configured" }, 502);
  }

  const text = [
    `Customer email: ${customerEmail}`,
    `Artwork: ${selectedArtwork || "(not listed)"}`,
    `Details: ${issueMessage}`,
  ].join("\n");

  try {
    await env.EMAIL.send({
      from: { email: FROM_EMAIL, name: "Devorah's Art Checkout Alert" },
      to: OWNER_EMAIL,
      replyTo: customerEmail,
      subject: "[Devorah's Art] Checkout help request",
      text,
      html: `<p><strong>Customer email:</strong> ${escapeHtml(customerEmail)}</p>
<p><strong>Artwork:</strong> ${escapeHtml(selectedArtwork || "(not listed)")}</p>
<p><strong>Details:</strong> ${escapeHtml(issueMessage)}</p>`,
    });
    return json({ success: true, message: "Notification sent to studio." });
  } catch (err) {
    return json({ success: false, error: "Failed to dispatch email notification" }, 502);
  }
}

export async function onRequestGet() {
  return json({ error: "Use POST." }, 405);
}
