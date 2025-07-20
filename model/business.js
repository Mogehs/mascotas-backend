const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    company_name: {
      type: String,
    },
    company_type: {
      type: String,
    },
    company_description: {
      type: String,
    },
    company_logo: {
      type: String,
      default: "N/A",
    },
    phone: {
      type: String,
      default: "N/A",
    },
    email: {
      type: String,
      default: "N/A",
    },
    website: {
      type: String,
      default: "N/A",
    },
    social: {
      type: String,
      default: "N/A",
    },
    physical_address: {
      type: String,
      default: "Not Found",
    },
    branches: {
      type: String,
      default: "N/A",
    },
    additional: {
      type: String,
      default: "N/A",
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    operation_timing: {},
    tax_identification_number: {
      type: String,
      default: "N/A",
    },
    // PetPro Subscription Features
    petpro_subscription: {
      is_active: {
        type: Boolean,
        default: true, // Basic plan is active by default
      },
      subscription_type: {
        type: String,
        enum: ["basic", "premium"],
        default: "basic",
      },
      start_date: {
        type: Date,
        default: Date.now, // Set start date to now for basic plan
      },
      end_date: {
        type: Date,
        // Basic plan has no end date (permanent)
      },
      payment_status: {
        type: String,
        enum: ["pending", "paid", "expired", "cancelled", "free"],
        default: "free", // Basic plan is free
      },
      amount_paid: {
        type: Number,
        default: 0, // Basic plan is free
      },
      payment_method: {
        type: String,
        default: "free", // Basic plan doesn't require payment
      },
      stripe_payment_intent_id: {
        type: String,
        default: null,
      },
      // auto_renewal: {
      //   type: Boolean,
      //   default: true,
      // },
    },
    features: {
      can_create_featured_ads: {
        type: Boolean,
        default: true, // Basic plan can create featured ads
      },
      max_featured_ads: {
        type: Number,
        default: 3, // Basic plan limit
      },
      can_showcase_products: {
        type: Boolean,
        default: true, // Basic plan can showcase products
      },
      max_products: {
        type: Number,
        default: 25, // Basic plan limit
      },
      can_create_promotions: {
        type: Boolean,
        default: true, // Basic plan can create promotions
      },
      max_promotions: {
        type: Number,
        default: 5, // Basic plan limit
      },
      analytics_access: {
        type: Boolean,
        default: true, // Basic plan has analytics access
      },
    },
    statistics: {
      total_views: {
        type: Number,
        default: 0,
      },
      total_clicks: {
        type: Number,
        default: 0,
      },
      monthly_views: {
        type: Number,
        default: 0,
      },
      monthly_clicks: {
        type: Number,
        default: 0,
      },
      last_stats_update: {
        type: Date,
        default: Date.now,
      },
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("business", businessSchema);
