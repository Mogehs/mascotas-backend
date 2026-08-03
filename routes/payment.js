const express = require("express");
const router = express.Router();

const {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  getSubscriptionPlans,
  getPaymentHistory,
  handleStripeWebhook,
  createTagPaymentIntent,
} = require("../controller/payment");

// Business subscription (PetPro Premium — monthly recurring)
router.post("/create-payment-intent",     createSubscription);      // original name kept
router.post("/cancel-subscription",       cancelSubscription);
router.get("/status/:business_id",        getSubscriptionStatus);
router.get("/history/:business_id",       getPaymentHistory);
router.get("/subscription-plans",         getSubscriptionPlans);

// Tag / badge one-time purchase
router.post("/create-tag-payment-intent", createTagPaymentIntent);

// Stripe Webhook — must use raw body, Stripe verifies the signature
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

module.exports = router;
