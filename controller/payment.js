const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY environment variable is not set");
}
const stripe = require("stripe")(stripeSecretKey || "sk_test_placeholder");
const Business = require("../model/business");
const User     = require("../model/user");
const Tag      = require("../model/tags");
const Order    = require("../model/order");
const {
  sendPaymentNotification,
  sendBusinessNotification,
  NOTIFICATION_TYPES,
} = require("../service/notification.service");
const {
  sendNewSubscriptionToAdmin,
  sendSubscriptionActivatedToUser,
  sendSubscriptionRenewedToAdmin,
  sendSubscriptionCancelledToAdmin,
  sendSubscriptionCancelledToUser,
  sendPaymentFailedToAdmin,
  sendPaymentFailedToUser,
  sendSubscriptionEndedToUser,
} = require("../service/email.service");

// Set STRIPE_PRICE_ID in your .env to the monthly recurring Price ID from your Stripe dashboard.
// Create it at: https://dashboard.stripe.com/products → Add product → Recurring → Monthly
const MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID;

const premiumFeatures = {
  can_create_featured_ads: true,
  max_featured_ads: -1,
  can_showcase_products: true,
  max_products: -1,
  can_create_promotions: true,
  max_promotions: -1,
  analytics_access: true,
};

const revokedFeatures = {
  can_create_featured_ads: false,
  max_featured_ads: 0,
  can_showcase_products: false,
  max_products: 0,
  can_create_promotions: false,
  max_promotions: 0,
  analytics_access: false,
};

const findBusiness = async (business_id, user_id) => {
  if (business_id) return Business.findById(business_id);
  if (user_id) return Business.findOne({ id: user_id });
  return null;
};

const getOrCreateStripeCustomer = async (business) => {
  if (business.petpro_subscription.stripe_customer_id) {
    return business.petpro_subscription.stripe_customer_id;
  }
  const customer = await stripe.customers.create({
    email: business.email !== "N/A" ? business.email : undefined,
    name: business.company_name,
    metadata: { business_id: business._id.toString() },
  });
  await Business.findByIdAndUpdate(business._id, {
    $set: { "petpro_subscription.stripe_customer_id": customer.id },
  });
  return customer.id;
};

/**
 * Create a monthly recurring subscription.
 * Frontend must call stripe.confirmPayment(clientSecret) after this to complete the first payment.
 */
const createSubscription = async (req, res) => {
  try {
    if (!stripeSecretKey) {
      return res.status(500).json({ success: false, message: "Payment system is not configured" });
    }
    if (!MONTHLY_PRICE_ID) {
      return res.status(500).json({ success: false, message: "STRIPE_PRICE_ID is not set on the server" });
    }

    const { business_id, user_id, payment_method_id } = req.body;

    if (!payment_method_id) {
      return res.status(400).json({ success: false, message: "payment_method_id is required" });
    }

    const business = await findBusiness(business_id, user_id);
    if (!business) {
      return res.status(business_id || user_id ? 404 : 400).json({
        success: false,
        message: business_id || user_id ? "Business not found" : "business_id or user_id is required",
      });
    }

    // If there's already an active Stripe subscription, block a duplicate
    if (business.petpro_subscription.stripe_subscription_id) {
      try {
        const existing = await stripe.subscriptions.retrieve(
          business.petpro_subscription.stripe_subscription_id
        );
        if (existing.status === "active" && !existing.cancel_at_period_end) {
          return res.status(400).json({
            success: false,
            message: "You already have an active subscription. Cancel it first or wait for it to expire.",
          });
        }
      } catch (_) {
        // Subscription not found in Stripe — proceed to create a new one
      }
    }

    const customerId = await getOrCreateStripeCustomer(business);

    // Attach payment method and set as default
    await stripe.paymentMethods.attach(payment_method_id, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: payment_method_id },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: MONTHLY_PRICE_ID }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        business_id: business._id.toString(),
        business_name: business.company_name,
      },
    });

    await Business.findByIdAndUpdate(business._id, {
      $set: {
        "petpro_subscription.stripe_subscription_id": subscription.id,
        "petpro_subscription.stripe_customer_id": customerId,
        "petpro_subscription.payment_status": "pending",
        "petpro_subscription.cancel_at_period_end": false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Subscription created. Confirm payment on the client to activate.",
      data: {
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
      },
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription",
      error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
  }
};

/**
 * Cancel subscription at end of current billing period.
 * The user keeps access until the period ends, then Stripe stops charging them.
 */
const cancelSubscription = async (req, res) => {
  try {
    if (!stripeSecretKey) {
      return res.status(500).json({ success: false, message: "Payment system is not configured" });
    }

    const { business_id, user_id } = req.body;
    const business = await findBusiness(business_id, user_id);

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const subscriptionId = business.petpro_subscription.stripe_subscription_id;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: "No active Stripe subscription found" });
    }

    if (!business.petpro_subscription.is_active) {
      return res.status(400).json({ success: false, message: "No active subscription to cancel" });
    }

    // Cancel at period end — user keeps access until billing period expires
    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const periodEnd    = new Date(updated.current_period_end * 1000);
    const periodEndStr = periodEnd.toLocaleDateString("es-ES");

    await Business.findByIdAndUpdate(business._id, {
      $set: {
        "petpro_subscription.cancel_at_period_end": true,
        "petpro_subscription.end_date": periodEnd,
      },
    });

    // Fetch user details for emails
    const populatedBusiness = await Business.findById(business._id).populate(
      "id", "email firstname lastname"
    );
    const userEmail = populatedBusiness?.id?.email || business.email;
    const userName  = populatedBusiness?.id
      ? `${populatedBusiness.id.firstname || ""} ${populatedBusiness.id.lastname || ""}`.trim()
      : business.company_name;

    sendSubscriptionCancelledToAdmin({
      businessName:  business.company_name,
      businessEmail: userEmail,
      accessUntil:   periodEndStr,
    }).catch((e) => console.error("Email error (cancel admin):", e.message));

    sendSubscriptionCancelledToUser({
      to:          userEmail,
      userName,
      accessUntil: periodEndStr,
    }).catch((e) => console.error("Email error (cancel user):", e.message));

    res.status(200).json({
      success: true,
      message: "Subscription will be cancelled at the end of the current billing period. You keep access until then.",
      data: { access_until: periodEnd },
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling subscription",
      error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
  }
};

/**
 * Get current subscription status for a business.
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const { business_id } = req.params;
    const business = await Business.findById(business_id).select(
      "petpro_subscription features statistics company_name"
    );

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        business_name: business.company_name,
        subscription: business.petpro_subscription,
        features: business.features,
        statistics: business.statistics,
      },
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ success: false, message: "Error fetching subscription status", error: error.message });
  }
};

/**
 * Get subscription plans info.
 */
const getSubscriptionPlans = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Premium subscription plan retrieved successfully",
    data: {
      available_plan: {
        name: "Premium Plan",
        billing: "Monthly recurring",
        features: {
          max_featured_ads: "Unlimited",
          max_products: "Unlimited",
          max_promotions: "Unlimited",
          analytics_access: true,
          support: "Priority Support",
        },
        description: "Complete business solution. Cancel anytime — you keep access until the end of the billing period.",
        benefits: [
          "Unlimited product showcases",
          "Unlimited featured ads",
          "Unlimited promotions",
          "Advanced analytics & insights",
          "Priority customer support",
          "Cancel anytime",
        ],
      },
    },
  });
};

/**
 * Get payment history for a business.
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { business_id } = req.params;
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: {
        current_subscription: business.petpro_subscription,
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ success: false, message: "Error retrieving payment history", error: error.message });
  }
};

/**
 * Stripe webhook handler.
 * Handles all subscription lifecycle events — this is the source of truth for activation/deactivation.
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await handlePaymentSucceeded(invoice);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await handlePaymentFailed(invoice);
        }
        break;
      }
      case "customer.subscription.deleted": {
        // Fires when subscription fully ends (period ended after cancel_at_period_end, or immediate cancel)
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object);
        break;
      }
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

const handlePaymentSucceeded = async (invoice) => {
  const business = await Business.findOne({
    "petpro_subscription.stripe_subscription_id": invoice.subscription,
  }).populate("id", "device_token firstname lastname");

  if (!business) {
    console.warn(`No business found for subscription ${invoice.subscription}`);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const periodStart = new Date(subscription.current_period_start * 1000);
  const periodEnd = new Date(subscription.current_period_end * 1000);

  await Business.findByIdAndUpdate(business._id, {
    $set: {
      "petpro_subscription.is_active": true,
      "petpro_subscription.subscription_type": "premium",
      "petpro_subscription.start_date": periodStart,
      "petpro_subscription.end_date": periodEnd,
      "petpro_subscription.payment_status": "paid",
      "petpro_subscription.amount_paid": invoice.amount_paid / 100,
      "petpro_subscription.payment_method": "stripe",
      "petpro_subscription.cancel_at_period_end": subscription.cancel_at_period_end,
      features: premiumFeatures,
      is_blocked: false,
    },
  });

  await User.findByIdAndUpdate(business.id?._id || business.id, {
    $set: { business_subscription: true },
  });

  console.log(`Subscription activated for business: ${business.company_name} until ${periodEnd}`);

  const userEmail = business.id?.email || business.email;
  const userName  = business.id
    ? `${business.id.firstname || ""} ${business.id.lastname || ""}`.trim()
    : business.company_name;
  const amountPaid = invoice.amount_paid / 100;
  const periodEndStr = periodEnd.toLocaleDateString("es-ES");
  const isFirstPayment = invoice.billing_reason === "subscription_create";

  // Email notifications
  if (isFirstPayment) {
    sendNewSubscriptionToAdmin({
      businessName:   business.company_name,
      businessEmail:  userEmail,
      amount:         amountPaid,
      periodEnd:      periodEndStr,
      subscriptionId: invoice.subscription,
    }).catch((e) => console.error("Email error (new subscription admin):", e.message));

    sendSubscriptionActivatedToUser({
      to:        userEmail,
      userName,
      amount:    amountPaid,
      periodEnd: periodEndStr,
    }).catch((e) => console.error("Email error (subscription activated user):", e.message));
  } else {
    sendSubscriptionRenewedToAdmin({
      businessName:  business.company_name,
      businessEmail: userEmail,
      amount:        amountPaid,
      periodEnd:     periodEndStr,
    }).catch((e) => console.error("Email error (renewal admin):", e.message));
  }

  // Push notification (existing)
  if (business.id?.device_token) {
    try {
      await sendPaymentNotification(
        business.id.device_token,
        "¡Pago exitoso!",
        `Tu suscripción Premium está activa hasta ${periodEndStr}.`,
        NOTIFICATION_TYPES.PAYMENT_SUCCESS,
        { amount: amountPaid, subscription_id: invoice.subscription }
      );
    } catch (e) {
      console.error("Push notification error (payment succeeded):", e.message);
    }
  }
};

const handlePaymentFailed = async (invoice) => {
  const business = await Business.findOne({
    "petpro_subscription.stripe_subscription_id": invoice.subscription,
  }).populate("id", "device_token");

  if (!business) return;

  await Business.findByIdAndUpdate(business._id, {
    $set: { "petpro_subscription.payment_status": "failed" },
  });

  console.log(`Payment failed for business: ${business.company_name}`);

  const userEmail = business.id?.email || business.email;
  const userName  = business.id
    ? `${business.id.firstname || ""} ${business.id.lastname || ""}`.trim()
    : business.company_name;

  sendPaymentFailedToAdmin({
    businessName:   business.company_name,
    businessEmail:  userEmail,
    subscriptionId: invoice.subscription,
  }).catch((e) => console.error("Email error (payment failed admin):", e.message));

  sendPaymentFailedToUser({
    to:       userEmail,
    userName,
  }).catch((e) => console.error("Email error (payment failed user):", e.message));

  if (business.id?.device_token) {
    try {
      await sendPaymentNotification(
        business.id.device_token,
        "Error en el pago",
        "No pudimos procesar tu pago mensual. Por favor, actualiza tu método de pago.",
        NOTIFICATION_TYPES.PAYMENT_FAILED,
        { subscription_id: invoice.subscription }
      );
    } catch (e) {
      console.error("Push notification error (payment failed):", e.message);
    }
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  const business = await Business.findOne({
    "petpro_subscription.stripe_subscription_id": subscription.id,
  }).populate("id", "device_token");

  if (!business) return;

  await Business.findByIdAndUpdate(business._id, {
    $set: {
      "petpro_subscription.is_active": false,
      "petpro_subscription.subscription_type": "none",
      "petpro_subscription.payment_status": "cancelled",
      "petpro_subscription.cancel_at_period_end": false,
      "petpro_subscription.end_date": null,
      "petpro_subscription.stripe_subscription_id": null,
      features: revokedFeatures,
      is_blocked: true,
    },
  });

  await User.findByIdAndUpdate(business.id?._id || business.id, {
    $set: { business_subscription: false },
  });

  console.log(`Subscription ended for business: ${business.company_name}`);

  const userEmail = business.id?.email || business.email;
  const userName  = business.id
    ? `${business.id.firstname || ""} ${business.id.lastname || ""}`.trim()
    : business.company_name;

  sendSubscriptionEndedToUser({
    to:       userEmail,
    userName,
  }).catch((e) => console.error("Email error (subscription ended user):", e.message));
};

const handleSubscriptionUpdated = async (subscription) => {
  const business = await Business.findOne({
    "petpro_subscription.stripe_subscription_id": subscription.id,
  });

  if (!business) return;

  // Sync cancel_at_period_end flag and period end date
  const periodEnd = new Date(subscription.current_period_end * 1000);

  await Business.findByIdAndUpdate(business._id, {
    $set: {
      "petpro_subscription.cancel_at_period_end": subscription.cancel_at_period_end,
      "petpro_subscription.end_date": periodEnd,
    },
  });
};

/**
 * Create a one-time Stripe PaymentIntent for a tag/badge purchase.
 * Returns client_secret so Flutter can confirm the payment on-device.
 * After confirmation, Flutter calls POST /api/order/create with the payment_intent_id.
 */
const createTagPaymentIntent = async (req, res) => {
  try {
    if (!stripeSecretKey) {
      return res.status(500).json({ success: false, message: "Payment system is not configured" });
    }

    const { user_id, tag_id, currency = "usd" } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id is required" });
    }
    if (!tag_id) {
      return res.status(400).json({ success: false, message: "tag_id is required" });
    }

    const [user, tag] = await Promise.all([
      User.findById(user_id).select("firstname lastname email"),
      Tag.findById(tag_id).select("title price isActive"),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }
    if (!tag.isActive) {
      return res.status(400).json({ success: false, message: "This tag is no longer available for purchase" });
    }
    if (!tag.price || tag.price <= 0) {
      return res.status(400).json({ success: false, message: "This tag has no valid price set" });
    }

    // Convert price to cents for Stripe (price stored in dollars)
    const amountInCents = Math.round(tag.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency,
      description: `Tag purchase — ${tag.title}`,
      metadata: {
        type:      "tag_purchase",
        user_id:   user_id.toString(),
        tag_id:    tag_id.toString(),
        tag_title: tag.title,
        user_name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
        user_email: user.email || "",
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      success: true,
      message: "Payment intent created. Confirm payment on the client to proceed.",
      data: {
        payment_intent_id: paymentIntent.id,
        client_secret:     paymentIntent.client_secret,
        amount:            tag.price,
        currency,
        tag: {
          id:    tag._id,
          title: tag.title,
          price: tag.price,
        },
      },
    });
  } catch (error) {
    console.error("createTagPaymentIntent error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment intent",
      error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  getSubscriptionPlans,
  getPaymentHistory,
  handleStripeWebhook,
  createTagPaymentIntent,
};
