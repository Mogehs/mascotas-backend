const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adsSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "business",
    },
    content: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    add_link: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        "food",
        "accessories",
        "toys",
        "health",
        "grooming",
        "services",
        "other",
      ],
    },
    target_audience: {
      age_range: {
        min: Number,
        max: Number,
      },
      pet_types: [
        {
          type: String,
        },
      ],
      location_radius: {
        type: Number, // in km
      },
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    featured_until: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 1, // Higher number = higher priority
    },
    status: {
      type: String,
      enum: ["active", "paused", "expired", "rejected"],
      default: "active",
    },
    budget: {
      daily_limit: {
        type: Number,
      },
      total_budget: {
        type: Number,
      },
      spent: {
        type: Number,
        default: 0,
      },
    },
    performance: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      conversions: {
        type: Number,
        default: 0,
      },
      ctr: {
        type: Number,
        default: 0, // Click-through rate
      },
    },
    schedule: {
      start_date: {
        type: Date,
        default: Date.now,
      },
      end_date: {
        type: Date,
      },
      time_slots: [
        {
          day: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          start_time: String, // Format: "HH:MM"
          end_time: String, // Format: "HH:MM"
        },
      ],
    },
    payment_method: {
      type: String,
    },
    billing_name: {
      type: String,
    },
    billing_address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
adsSchema.index({ business_id: 1, status: 1 });
adsSchema.index({ is_featured: -1, priority: -1, createdAt: -1 });
adsSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("ads", adsSchema);
