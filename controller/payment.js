const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Business = require("../model/business");
const User = require("../model/user");
const {
  sendPaymentNotification,
  sendBusinessNotification,
  NOTIFICATION_TYPES,
} = require("../service/notification.service");

/**
 * Create payment intent for PetPro premium subscription only
 */
const createPaymentIntent = async (req, res) => {
  try {
    const {
      business_id,
      user_id, // Can use either business_id or user_id
      subscription_type = "premium", // Only premium available
      currency = "usd",
    } = req.body;

    let business;

    // Find business by business_id or user_id
    if (business_id) {
      business = await Business.findById(business_id);
    } else if (user_id) {
      business = await Business.findOne({ id: user_id });
    } else {
      return res.status(400).json({
        success: false,
        message: "Either business_id or user_id is required",
      });
    }

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found. Please register your business first.",
      });
    }

    // Only allow premium subscription
    if (subscription_type !== "premium") {
      return res.status(400).json({
        success: false,
        message:
          "Only premium subscription is available. Basic plan has been discontinued.",
      });
    }

    // Check if user already has an active premium subscription
    if (
      business.petpro_subscription.is_active &&
      business.petpro_subscription.subscription_type === "premium"
    ) {
      const currentDate = new Date();
      const isExpired =
        business.petpro_subscription.end_date &&
        business.petpro_subscription.end_date < currentDate;

      if (!isExpired) {
        return res.status(400).json({
          success: false,
          message:
            "You already have an active premium subscription. Use renewal instead.",
          current_subscription: {
            type: business.petpro_subscription.subscription_type,
            end_date: business.petpro_subscription.end_date,
          },
        });
      }
    }

    // Premium subscription pricing
    const premiumPlan = {
      amount: 4900, // $49.00 in cents
      description: "PetPro Premium Subscription - 1 Year",
      features:
        "Unlimited Products, Featured Ads & Promotions, Advanced Analytics",
    };

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: premiumPlan.amount,
      currency: currency,
      description: premiumPlan.description,
      metadata: {
        business_id: business._id.toString(),
        business_name: business.company_name,
        subscription_type: "premium",
        features: premiumPlan.features,
        duration: "1 year",
        user_id: business.id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: premiumPlan.amount,
        currency: currency,
        subscription_details: {
          type: "premium",
          description: premiumPlan.description,
          features: premiumPlan.features,
          business_name: business.company_name,
          current_status: business.petpro_subscription.is_active
            ? `Current: ${business.petpro_subscription.subscription_type}`
            : "No active subscription - Subscribe to unlock unlimited features",
        },
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment intent",
      error: error.message,
    });
  }
};

/**
 * Confirm payment and activate premium subscription
 */
const confirmPayment = async (req, res) => {
  try {
    const {
      payment_intent_id,
      business_id,
      user_id,
      subscription_type = "premium",
    } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed successfully",
        payment_status: paymentIntent.status,
      });
    }

    let business;

    // Find business by business_id or user_id
    if (business_id) {
      business = await Business.findById(business_id).populate("id", "device_token firstname lastname");
    } else if (user_id) {
      business = await Business.findOne({ id: user_id }).populate("id", "device_token firstname lastname");
    } else {
      return res.status(400).json({
        success: false,
        message: "Either business_id or user_id is required",
      });
    }

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Only allow premium subscription
    if (subscription_type !== "premium") {
      return res.status(400).json({
        success: false,
        message: "Only premium subscription is available",
      });
    }

    // Validate payment amount for premium
    const expectedAmount = 4900; // $49 for premium
    if (paymentIntent.amount !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount does not match premium subscription. Expected $49, received $${
          paymentIntent.amount / 100
        }`,
      });
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

    // Premium features - unlimited everything
    const premiumFeatures = {
      can_create_featured_ads: true,
      max_featured_ads: -1, // Unlimited
      can_showcase_products: true,
      max_products: -1, // Unlimited
      can_create_promotions: true,
      max_promotions: -1, // Unlimited
      analytics_access: true,
    };

    // Update business with subscription details
    const updatedBusiness = await Business.findByIdAndUpdate(
      business._id,
      {
        $set: {
          "petpro_subscription.is_active": true,
          "petpro_subscription.subscription_type": "premium",
          "petpro_subscription.start_date": currentDate,
          "petpro_subscription.end_date": endDate,
          "petpro_subscription.payment_status": "paid",
          "petpro_subscription.amount_paid": paymentIntent.amount / 100, // Convert cents to dollars
          "petpro_subscription.payment_method": "stripe",
          "petpro_subscription.stripe_payment_intent_id": payment_intent_id,
          features: premiumFeatures,
        },
      },
      { new: true }
    );

    // Update user subscription status
    await User.findByIdAndUpdate(
      { _id: business.id },
      {
        $set: {
          business_subscription: true,
        },
      },
      { new: true }
    );

    // Send payment success notification
    if (business.id && business.id.device_token) {
      try {
        await sendPaymentNotification(
          business.id.device_token,
          "¡Pago exitoso!",
          `Tu suscripción Premium de PetPro ha sido activada. Válida hasta ${endDate.toLocaleDateString('es-ES')}.`,
          NOTIFICATION_TYPES.PAYMENT_SUCCESS,
          {
            amount: paymentIntent.amount / 100,
            transaction_id: payment_intent_id,
            subscription_type: "premium",
            business_name: business.company_name,
            start_date: currentDate.toISOString(),
            end_date: endDate.toISOString(),
            features_unlocked: premiumFeatures
          }
        );

        // Also send business notification about subscription activation
        await sendBusinessNotification(
          business.id.device_token,
          "Suscripción Premium Activada",
          "¡Felicidades! Tu negocio ahora tiene acceso completo a todas las funciones Premium de PetPro.",
          NOTIFICATION_TYPES.BUSINESS_APPROVED,
          {
            business_id: business._id,
            subscription_type: "premium",
            features: premiumFeatures
          }
        );

        console.log(`Payment success notification sent to business: ${business.company_name}`);
      } catch (notificationError) {
        console.error("Error sending payment notification:", notificationError);
        // Don't fail the payment confirmation because of notification error
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Premium subscription activated successfully! You now have unlimited access to all features.",
      data: {
        subscription: updatedBusiness.petpro_subscription,
        features: updatedBusiness.features,
        business_name: business.company_name,
        activation_date: currentDate,
        expiry_date: endDate,
      },
    });
  } catch (error) {
    console.error("Confirm payment error:", error);

    // Try to send payment failure notification if we have user info
    if (business_id || user_id) {
      try {
        let user;
        if (business_id) {
          const business = await Business.findById(business_id).populate("id", "device_token");
          user = business?.id;
        } else {
          user = await User.findById(user_id, "device_token");
        }

        if (user && user.device_token) {
          await sendPaymentNotification(
            user.device_token,
            "Error en el pago",
            "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.",
            NOTIFICATION_TYPES.PAYMENT_FAILED,
            {
              error_message: error.message,
              payment_intent_id: payment_intent_id
            }
          );
        }
      } catch (notificationError) {
        console.error("Error sending payment failure notification:", notificationError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message,
    });
  }
};

/**
 * Get subscription plans and pricing - Premium only
 */
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = {
      premium: {
        name: "Premium Plan",
        price: 49,
        currency: "USD",
        duration: "1 Year",
        features: {
          max_featured_ads: "Unlimited",
          max_products: "Unlimited",
          max_promotions: "Unlimited",
          analytics_access: true,
          support: "Priority Support",
        },
        description:
          "Complete business solution with unlimited access to all features",
        benefits: [
          "Unlimited product showcases",
          "Unlimited featured ads",
          "Unlimited promotions",
          "Advanced analytics & insights",
          "Priority customer support",
          "No feature restrictions",
        ],
      },
    };

    res.status(200).json({
      success: true,
      message: "Premium subscription plan retrieved successfully",
      data: {
        available_plan: plans.premium,
        pricing_model: "Premium only - No basic plan available",
        current_offer:
          "Subscribe to Premium and unlock unlimited business features!",
        no_free_tier:
          "All features require Premium subscription - No free limits available",
      },
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving subscription plans",
      error: error.message,
    });
  }
};

/**
 * Get payment history for a business
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Find business
    const business = await Business.findById(business_id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Get subscription payment history
    const paymentHistory = {
      current_subscription: business.petpro_subscription,
      payment_records: [
        {
          date: business.petpro_subscription.start_date,
          amount: business.petpro_subscription.amount_paid || 0,
          subscription_type: business.petpro_subscription.subscription_type,
          payment_method:
            business.petpro_subscription.payment_method || "stripe",
          payment_id: business.petpro_subscription.stripe_payment_intent_id,
          status: business.petpro_subscription.payment_status,
        },
      ],
    };

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: paymentHistory,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving payment history",
      error: error.message,
    });
  }
};

/**
 * Handle Stripe webhook events
 */
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Update business subscription status if needed
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.error(
          `Payment failed: ${failedPayment.last_payment_error?.message}`
        );
        break;

      case "charge.succeeded":
        const charge = event.data.object;
        console.log(`Charge succeeded: ${charge.id}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Error handling webhook",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getSubscriptionPlans,
  getPaymentHistory,
  handleStripeWebhook,
};
