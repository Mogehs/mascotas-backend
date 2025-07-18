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
        default: false,
      },
      subscription_type: {
        type: String,
        enum: ["basic", "premium"],
        default: "basic",
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
      },
      payment_status: {
        type: String,
        enum: ["pending", "paid", "expired", "cancelled"],
        default: "pending",
      },
      amount_paid: {
        type: Number,
        default: 49,
      },
      payment_method: {
        type: String,
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
        default: false,
      },
      max_featured_ads: {
        type: Number,
        default: 0,
      },
      can_showcase_products: {
        type: Boolean,
        default: false,
      },
      max_products: {
        type: Number,
        default: 0,
      },
      can_create_promotions: {
        type: Boolean,
        default: false,
      },
      max_promotions: {
        type: Number,
        default: 0,
      },
      analytics_access: {
        type: Boolean,
        default: false,
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
