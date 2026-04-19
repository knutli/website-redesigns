import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function fromAddress() {
  return env.EMAIL_FROM ?? "Oase <no-reply@oase.ai>";
}

export async function sendVerificationEmail({ to, url }: { to: string; url: string }) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set. Would have sent verification to ${to}: ${url}`,
    );
    return;
  }
  await resend.emails.send({
    from: fromAddress(),
    to,
    subject: "Verify your email — Oase",
    html: `
      <p>Welcome to Oase.</p>
      <p>Click the link below to verify your email:</p>
      <p><a href="${url}">${url}</a></p>
    `,
  });
}

export async function sendListingApprovedEmail({ to, title }: { to: string; title: string }) {
  if (!resend) return;
  await resend.emails.send({
    from: fromAddress(),
    to,
    subject: `Your listing "${title}" is live`,
    html: `<p>Your listing <strong>${title}</strong> has been approved and is now live on Oase.</p>`,
  });
}

export async function sendListingRejectedEmail({
  to,
  title,
  reason,
}: {
  to: string;
  title: string;
  reason: string;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: fromAddress(),
    to,
    subject: `Your listing "${title}" needs changes`,
    html: `
      <p>Our reviewers couldn't approve your listing <strong>${title}</strong> just yet.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Edit the listing and resubmit — we'll take another look right away.</p>
    `,
  });
}
