const nodemailer = require("nodemailer");

// Required env vars:
//   EMAIL_HOST     — SMTP host (e.g. smtp.gmail.com)
//   EMAIL_PORT     — SMTP port (587 for TLS, 465 for SSL)
//   EMAIL_USER     — SMTP username / sender address
//   EMAIL_PASS     — SMTP password or Gmail app password
//   ADMIN_EMAIL    — where admin notifications are sent

const SMTP_USER = process.env.SMTP_MAIL || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const FROM = `"Mascotas" <${SMTP_USER}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "identificapetinfo@gmail.com";

// Verify SMTP connection on startup (non-fatal)
transporter.verify((err) => {
  if (err) console.warn("Email service SMTP connection failed:", err.message);
  else console.log("Email service ready");
});

// ─── Layout ───────────────────────────────────────────────────────────────────

const wrap = (title, accentColor = "#2E7D32", body) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
      <!-- Header -->
      <tr><td style="background:${accentColor};padding:24px 32px;">
        <span style="font-size:22px;font-weight:bold;color:#fff;">Mascotas</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px;">
        ${body}
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f0f0f0;padding:14px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#999;">© ${new Date().getFullYear()} Mascotas · All rights reserved</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

const row = (label, value, shade) =>
  `<tr style="${shade ? "background:#f9f9f9;" : ""}">
    <td style="border:1px solid #eee;padding:10px 14px;color:#666;width:40%;">${label}</td>
    <td style="border:1px solid #eee;padding:10px 14px;">${value}</td>
  </tr>`;

const table = (...rows) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">${rows.join("")}</table>`;

const badge = (label, color) =>
  `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${color};color:#fff;font-size:13px;font-weight:bold;">${label}</span>`;

// ─── Order helpers ─────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:    { label: "Pending",    color: "#f57c00" },
  processing: { label: "Processing", color: "#1565C0" },
  on_the_way: { label: "On the Way", color: "#7B1FA2" },
  delivered:  { label: "Delivered",  color: "#2E7D32" },
  cancelled:  { label: "Cancelled",  color: "#c62828" },
};

// ─── Safe send wrapper ─────────────────────────────────────────────────────────

const send = async (options) => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("Email skipped — SMTP credentials not configured");
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, ...options });
  } catch (err) {
    console.error(`Email send failed [${options.subject}]:`, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER EMAILS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Admin: a new tag/badge order was placed.
 */
const sendNewOrderToAdmin = (order) => {
  if (!ADMIN_EMAIL) return console.warn("ADMIN_EMAIL not set — admin order email skipped");
  return send({
    to: ADMIN_EMAIL,
    subject: `🛍 New Order #${order.orderId} — ${order.tagTitle}`,
    html: wrap("New Order", "#2E7D32", `
      <h2 style="margin-top:0;color:#2E7D32;">New Tag Order Received</h2>
      <p>A customer just placed an order. Log in to the admin panel to manage it.</p>
      ${table(
        row("Order ID",         `<strong>#${order.orderId}</strong>`, true),
        row("Customer",         order.userName || "—"),
        row("Customer Email",   order.userEmail || "—", true),
        row("Tag / Badge",      order.tagTitle || "—"),
        row("Amount",           `<strong>$${order.amount}</strong>`, true),
        row("Shipping Address", order.shippingAddress || "Not provided"),
        row("Payment ID",       order.paymentId || "—", true),
      )}
    `),
  });
};

/**
 * User: confirmation that their order was received.
 */
const sendOrderConfirmationToUser = (order) => {
  if (!order.userEmail) return;
  return send({
    to: order.userEmail,
    subject: `Order Confirmed — #${order.orderId}`,
    html: wrap("Order Confirmed", "#2E7D32", `
      <h2 style="margin-top:0;color:#2E7D32;">Thank you, ${order.userName || "there"}!</h2>
      <p>We received your order and it is now being reviewed.</p>
      ${table(
        row("Order ID",  `<strong>#${order.orderId}</strong>`, true),
        row("Tag",       order.tagTitle || "—"),
        row("Amount",    `$${order.amount}`, true),
        row("Status",    badge("Pending", "#f57c00")),
      )}
      <p style="margin-top:24px;color:#555;">We will email you as your order progresses. If you have questions, reply to this email.</p>
    `),
  });
};

/**
 * User: order status changed.
 */
const sendOrderStatusUpdateToUser = (order) => {
  if (!order.userEmail) return;
  const meta = STATUS_META[order.status] || { label: order.status, color: "#333" };
  return send({
    to: order.userEmail,
    subject: `Your order #${order.orderId} — ${meta.label}`,
    html: wrap("Order Update", meta.color, `
      <h2 style="margin-top:0;color:${meta.color};">Order Update</h2>
      <p>Hi ${order.userName || "there"}, your order status has been updated.</p>
      ${table(
        row("Order ID",   `<strong>#${order.orderId}</strong>`, true),
        row("Tag",        order.tagTitle || "—"),
        row("New Status", badge(meta.label, meta.color), true),
        ...(order.notes ? [row("Note from us", order.notes)] : []),
      )}
      <p style="margin-top:24px;color:#555;">${
        order.status === "delivered"
          ? "Thank you for your purchase! We hope you love it."
          : order.status === "cancelled"
          ? "Your order has been cancelled. Contact us if you believe this is an error."
          : "We will keep you posted on any further updates."
      }</p>
    `),
  });
};

/**
 * Admin: confirmation that order status was changed.
 */
const sendOrderStatusUpdateToAdmin = (order) => {
  if (!ADMIN_EMAIL) return;
  const meta = STATUS_META[order.status] || { label: order.status, color: "#333" };
  return send({
    to: ADMIN_EMAIL,
    subject: `Order #${order.orderId} status → ${meta.label}`,
    html: wrap("Order Status Updated", meta.color, `
      <h2 style="margin-top:0;color:${meta.color};">Order Status Updated</h2>
      ${table(
        row("Order ID",   `<strong>#${order.orderId}</strong>`, true),
        row("Customer",   order.userName || "—"),
        row("Tag",        order.tagTitle || "—", true),
        row("New Status", badge(meta.label, meta.color)),
        ...(order.notes ? [row("Notes", order.notes, true)] : []),
      )}
    `),
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION EMAILS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Admin: a new business subscribed to PetPro Premium.
 */
const sendNewSubscriptionToAdmin = ({ businessName, businessEmail, amount, periodEnd, subscriptionId }) => {
  if (!ADMIN_EMAIL) return;
  return send({
    to: ADMIN_EMAIL,
    subject: `💳 New PetPro Subscription — ${businessName}`,
    html: wrap("New Subscription", "#1565C0", `
      <h2 style="margin-top:0;color:#1565C0;">New PetPro Premium Subscription</h2>
      <p>A business has subscribed to PetPro Premium.</p>
      ${table(
        row("Business",       `<strong>${businessName}</strong>`, true),
        row("Email",          businessEmail || "—"),
        row("Monthly Amount", `<strong>$${amount}</strong>`, true),
        row("Next Billing",   periodEnd),
        row("Subscription ID", subscriptionId, true),
      )}
    `),
  });
};

/**
 * User: their PetPro subscription is active.
 */
const sendSubscriptionActivatedToUser = ({ to, userName, amount, periodEnd }) => {
  if (!to) return;
  return send({
    to,
    subject: "PetPro Premium is Active!",
    html: wrap("Subscription Active", "#2E7D32", `
      <h2 style="margin-top:0;color:#2E7D32;">Welcome to PetPro Premium, ${userName || "there"}!</h2>
      <p>Your subscription is now active. Enjoy unlimited access to all Premium features.</p>
      ${table(
        row("Plan",             "Premium (Monthly)", true),
        row("Amount",           `$${amount}/month`),
        row("Next Billing Date", periodEnd, true),
      )}
      <p style="margin-top:24px;color:#555;">You can cancel anytime from the app — you'll keep access until the end of the current billing period.</p>
    `),
  });
};

/**
 * Admin: subscription renewal (monthly payment succeeded again).
 */
const sendSubscriptionRenewedToAdmin = ({ businessName, businessEmail, amount, periodEnd }) => {
  if (!ADMIN_EMAIL) return;
  return send({
    to: ADMIN_EMAIL,
    subject: `🔄 Subscription Renewed — ${businessName}`,
    html: wrap("Subscription Renewed", "#2E7D32", `
      <h2 style="margin-top:0;color:#2E7D32;">Monthly Subscription Renewed</h2>
      ${table(
        row("Business",       `<strong>${businessName}</strong>`, true),
        row("Email",          businessEmail || "—"),
        row("Amount Charged", `$${amount}`, true),
        row("Next Billing",   periodEnd),
      )}
    `),
  });
};

/**
 * Admin: a subscription was cancelled.
 */
const sendSubscriptionCancelledToAdmin = ({ businessName, businessEmail, accessUntil }) => {
  if (!ADMIN_EMAIL) return;
  return send({
    to: ADMIN_EMAIL,
    subject: `❌ Subscription Cancelled — ${businessName}`,
    html: wrap("Subscription Cancelled", "#c62828", `
      <h2 style="margin-top:0;color:#c62828;">Subscription Cancellation</h2>
      <p>A business has cancelled their PetPro Premium subscription.</p>
      ${table(
        row("Business",      `<strong>${businessName}</strong>`, true),
        row("Email",         businessEmail || "—"),
        row("Access Until",  accessUntil, true),
      )}
      <p style="margin-top:24px;color:#555;">Their features will remain active until the end of their billing period.</p>
    `),
  });
};

/**
 * User: their subscription was cancelled.
 */
const sendSubscriptionCancelledToUser = ({ to, userName, accessUntil }) => {
  if (!to) return;
  return send({
    to,
    subject: "PetPro Premium — Cancellation Confirmed",
    html: wrap("Subscription Cancelled", "#c62828", `
      <h2 style="margin-top:0;color:#c62828;">Cancellation Confirmed</h2>
      <p>Hi ${userName || "there"}, we have cancelled your PetPro Premium subscription as requested.</p>
      ${table(
        row("Access Until", `<strong>${accessUntil}</strong>`, true),
      )}
      <p style="margin-top:24px;color:#555;">Your features remain active until the date above. You can re-subscribe at any time.</p>
    `),
  });
};

/**
 * Admin: a monthly payment failed.
 */
const sendPaymentFailedToAdmin = ({ businessName, businessEmail, subscriptionId }) => {
  if (!ADMIN_EMAIL) return;
  return send({
    to: ADMIN_EMAIL,
    subject: `⚠️ Payment Failed — ${businessName}`,
    html: wrap("Payment Failed", "#c62828", `
      <h2 style="margin-top:0;color:#c62828;">Monthly Payment Failed</h2>
      <p>Stripe was unable to charge the following business for their monthly subscription.</p>
      ${table(
        row("Business",       `<strong>${businessName}</strong>`, true),
        row("Email",          businessEmail || "—"),
        row("Subscription ID", subscriptionId, true),
      )}
      <p style="margin-top:24px;color:#555;">Stripe will automatically retry. The subscription will be cancelled after all retry attempts are exhausted.</p>
    `),
  });
};

/**
 * User: their subscription payment failed.
 */
const sendPaymentFailedToUser = ({ to, userName }) => {
  if (!to) return;
  return send({
    to,
    subject: "Action Required: PetPro Payment Failed",
    html: wrap("Payment Failed", "#c62828", `
      <h2 style="margin-top:0;color:#c62828;">Payment Failed</h2>
      <p>Hi ${userName || "there"}, we could not process your monthly PetPro Premium payment.</p>
      <p>Please update your payment method in the app to avoid losing access to your Premium features.</p>
      <p style="margin-top:24px;color:#555;">If you need help, reply to this email and we will assist you.</p>
    `),
  });
};

/**
 * User: subscription ended (period expired after cancel or after failed retries).
 */
const sendSubscriptionEndedToUser = ({ to, userName }) => {
  if (!to) return;
  return send({
    to,
    subject: "Your PetPro Premium has ended",
    html: wrap("Subscription Ended", "#555", `
      <h2 style="margin-top:0;color:#555;">Subscription Ended</h2>
      <p>Hi ${userName || "there"}, your PetPro Premium subscription has ended and your business features have been deactivated.</p>
      <p>Subscribe again at any time from the app to regain full access.</p>
    `),
  });
};

module.exports = {
  // Orders
  sendNewOrderToAdmin,
  sendOrderConfirmationToUser,
  sendOrderStatusUpdateToUser,
  sendOrderStatusUpdateToAdmin,
  // Subscriptions
  sendNewSubscriptionToAdmin,
  sendSubscriptionActivatedToUser,
  sendSubscriptionRenewedToAdmin,
  sendSubscriptionCancelledToAdmin,
  sendSubscriptionCancelledToUser,
  sendPaymentFailedToAdmin,
  sendPaymentFailedToUser,
  sendSubscriptionEndedToUser,
};
