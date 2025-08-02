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
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
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
        default: false, // No subscription by default
      },
      subscription_type: {
        type: String,
        enum: ["none", "premium"],
        default: "none", // No subscription by default
      },
      start_date: {
        type: Date,
        default: null, // No start date until subscribed
      },
      end_date: {
        type: Date,
        default: null, // No end date until subscribed
      },
      payment_status: {
        type: String,
        enum: ["pending", "paid", "expired", "cancelled", "none"],
        default: "none", // No payment by default
      },
      amount_paid: {
        type: Number,
        default: 0, // No payment by default
      },
      payment_method: {
        type: String,
        default: "none", // No payment method by default
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
        default: false, // No features by default - must subscribe
      },
      max_featured_ads: {
        type: Number,
        default: 0, // No limit by default
      },
      can_showcase_products: {
        type: Boolean,
        default: false, // No features by default - must subscribe
      },
      max_products: {
        type: Number,
        default: 0, // No limit by default
      },
      can_create_promotions: {
        type: Boolean,
        default: false, // No features by default - must subscribe
      },
      max_promotions: {
        type: Number,
        default: 0, // No limit by default
      },
      analytics_access: {
        type: Boolean,
        default: false, // No features by default - must subscribe
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

// Create geospatial index for location-based queries
businessSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("business", businessSchema);
