const express = require("express");
const router = express.Router();

const {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
} = require("../controller/payment");

// Payment Intent Routes
router.post("/create-payment-intent", createPaymentIntent);
router.post("/confirm-payment", confirmPayment);
router.get("/history/:business_id", getPaymentHistory);

// Stripe Webhook (no auth required - Stripe handles verification)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;
