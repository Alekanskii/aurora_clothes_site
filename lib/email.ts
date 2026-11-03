import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "AURORA <orders@your-domain.com>";

/**
 * Without a real RESEND_API_KEY (unset by default in .env.example), this
 * logs the email to the console instead of throwing — so registration and
 * password reset are fully testable locally without a Resend account.
 * Flip this to always-throw once RESEND_API_KEY is required in production.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!resend) {
    const links = [...params.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    console.log("── [dev email] ──────────────────────────");
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(params.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (links.length > 0) {
      console.log("Link(s):");
      links.forEach((link) => console.log(`  ${link}`));
    }
    console.log("──────────────────────────────────────────");
    return;
  }
  await resend.emails.send({ from: FROM, to: params.to, subject: params.subject, html: params.html });
}

export function verificationEmailHtml(verifyUrl: string) {
  return `
    <p>Welcome to AURORA.</p>
    <p><a href="${verifyUrl}">Confirm your email address</a> to finish creating your account.</p>
    <p>This link expires in 24 hours.</p>
  `;
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
    <p>Someone requested a password reset for this AURORA account.</p>
    <p><a href="${resetUrl}">Reset your password</a>. This link expires in 1 hour.</p>
    <p>If you didn't request this, you can ignore this email.</p>
  `;
}

export function orderConfirmationEmailHtml(orderId: string, totalCents: number): string {
  const orderNumber = orderId.slice(-8).toUpperCase();
  const total = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    totalCents / 100
  );
  return `
    <p>Thank you for your order.</p>
    <p>Order <strong>#${orderNumber}</strong> is confirmed — total <strong>${total}</strong>.</p>
    <p>You can track it any time from your account.</p>
  `;
}
