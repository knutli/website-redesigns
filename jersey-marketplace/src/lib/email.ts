import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function fromAddress() {
  return env.EMAIL_FROM ?? "Oase <no-reply@oase.ai>";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] ${subject} → ${to} (RESEND_API_KEY not set)`);
    return;
  }
  await resend.emails.send({ from: fromAddress(), to, subject, html });
}

export async function sendVerificationEmail({ to, url }: { to: string; url: string }) {
  await send(to, "Verify your email — Oase", `
    <p>Welcome to Oase.</p>
    <p>Click the link below to verify your email:</p>
    <p><a href="${esc(url)}">${esc(url)}</a></p>
  `);
}

export async function sendListingApprovedEmail({ to, title }: { to: string; title: string }) {
  await send(to, `Your listing is live`, `
    <p>Your listing <strong>${esc(title)}</strong> has been approved and is now live on Oase.</p>
  `);
}

export async function sendListingRejectedEmail({ to, title, reason }: { to: string; title: string; reason: string }) {
  await send(to, `Your listing needs changes`, `
    <p>Our reviewers couldn't approve your listing <strong>${esc(title)}</strong> just yet.</p>
    <p><strong>Reason:</strong> ${esc(reason)}</p>
    <p>Edit the listing and resubmit — we'll take another look right away.</p>
  `);
}

export async function sendOutbidEmail({ to, title, amount }: { to: string; title: string; amount: string }) {
  await send(to, `You've been outbid on ${esc(title)}`, `
    <p>Someone just bid <strong>${esc(amount)}</strong> on <strong>${esc(title)}</strong>.</p>
    <p>Raise your bid or set a max bid so you don't miss it.</p>
  `);
}

export async function sendAuctionWonEmail({ to, title, amount }: { to: string; title: string; amount: string }) {
  await send(to, `It's yours — ${esc(title)}`, `
    <p>You won <strong>${esc(title)}</strong> with a bid of <strong>${esc(amount)}</strong>.</p>
    <p>Head to your purchases to complete payment.</p>
  `);
}

export async function sendOrderShippedEmail({ to, title, carrier, trackingNo }: { to: string; title: string; carrier: string; trackingNo: string }) {
  await send(to, `Your jersey is on its way`, `
    <p><strong>${esc(title)}</strong> has been shipped.</p>
    <p><strong>Carrier:</strong> ${esc(carrier)}<br/><strong>Tracking:</strong> ${esc(trackingNo)}</p>
    <p>Once it arrives, confirm delivery in your purchases.</p>
  `);
}

export async function sendOrderDeliveredEmail({ to, title }: { to: string; title: string }) {
  await send(to, `Delivery confirmed — leave a review?`, `
    <p>Glad <strong>${esc(title)}</strong> arrived safely.</p>
    <p>Leave a review for the seller — it helps the whole community.</p>
  `);
}

export async function sendPaymentReceivedEmail({ to, title, amount }: { to: string; title: string; amount: string }) {
  await send(to, `Payment received for ${esc(title)}`, `
    <p>The buyer has paid <strong>${esc(amount)}</strong> for <strong>${esc(title)}</strong>.</p>
    <p>Ship the jersey and paste the tracking number in your seller dashboard.</p>
  `);
}
