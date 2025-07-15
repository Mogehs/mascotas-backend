const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Business = require("../model/business");

/**
 * Create payment intent for PetPro subscription
 */
const createPaymentIntent = async (req, res) => {
  try {
    const {
      business_id,
      subscription_type = "premium",
      currency = "usd",
    } = req.body;

    // Validate business exists
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Define pricing based on subscription type
    const pricing = {
      premium: {
        amount: 4900, // $49.00 in cents
        description: "PetPro Premium Subscription - 1 Year",
        features:
          "Featured Ads (10), Products (100), Promotions (20), Analytics",
      },
      basic: {
        amount: 2900, // $29.00 in cents
        description: "PetPro Basic Subscription - 1 Year",
        features: "Featured Ads (3), Products (25), Promotions (5), Analytics",
      },
    };

    const selectedPlan = pricing[subscription_type];
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription type. Choose 'premium' or 'basic'",
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedPlan.amount,
      currency: currency,
      description: selectedPlan.description,
      metadata: {
        business_id: business_id,
        business_name: business.company_name,
        subscription_type: subscription_type,
        features: selectedPlan.features,
        duration: "1 year",
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
        amount: selectedPlan.amount,
        currency: currency,
        subscription_details: {
          type: subscription_type,
          description: selectedPlan.description,
          features: selectedPlan.features,
          business_name: business.company_name,
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
 * Confirm payment and activate subscription
 */
const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id, business_id, subscription_type } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        payment_status: paymentIntent.status,
      });
    }

    // Verify business_id matches metadata
    if (paymentIntent.metadata.business_id !== business_id) {
      return res.status(400).json({
        success: false,
        message: "Business ID mismatch",
      });
    }

    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

    // Define features based on subscription type
    const features =
      subscription_type === "premium"
        ? {
            can_create_featured_ads: true,
            max_featured_ads: 10,
            can_showcase_products: true,
            max_products: 100,
            can_create_promotions: true,
            max_promotions: 20,
            analytics_access: true,
          }
        : {
            can_create_featured_ads: true,
            max_featured_ads: 3,
            can_showcase_products: true,
            max_products: 25,
            can_create_promotions: true,
            max_promotions: 5,
            analytics_access: true,
          };

    // Activate subscription
    const updatedBusiness = await Business.findByIdAndUpdate(
      business_id,
      {
        $set: {
          "petpro_subscription.is_active": true,
          "petpro_subscription.subscription_type": subscription_type,
          "petpro_subscription.start_date": currentDate,
          "petpro_subscription.end_date": endDate,
          "petpro_subscription.payment_status": "paid",
          "petpro_subscription.amount_paid": paymentIntent.amount / 100, // Convert from cents
          "petpro_subscription.payment_method": "stripe",
          "petpro_subscription.stripe_payment_intent_id": payment_intent_id,
          features: features,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed and subscription activated successfully",
      data: {
        subscription: updatedBusiness.petpro_subscription,
        features: updatedBusiness.features,
        payment_details: {
          amount_paid: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          payment_intent_id: payment_intent_id,
        },
      },
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message,
    });
  }
};

/**
 * Webhook handler for Stripe events
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);

      // You can add additional logic here if needed
      // The main activation is handled by the confirmPayment endpoint

      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("Payment failed:", failedPayment.id);

      // You can add logic to handle failed payments
      // e.g., send notification to business owner

      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Get payment history for a business
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { business_id } = req.params;

    const business = await Business.findById(business_id).select(
      "petpro_subscription company_name"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Get payments from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10,
    });

    // Filter payments for this business
    const businessPayments = paymentIntents.data.filter(
      (payment) => payment.metadata.business_id === business_id
    );

    const paymentHistory = businessPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      created: new Date(payment.created * 1000),
      description: payment.description,
      subscription_type: payment.metadata.subscription_type,
    }));

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: {
        business_name: business.company_name,
        current_subscription: business.petpro_subscription,
        payment_history: paymentHistory,
      },
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

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
};
