const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promotionSchema = new Schema(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "business",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed_amount", "buy_one_get_one", "free_shipping"],
      required: true,
    },
    value: {
      type: Number,
      required: true, // Percentage or fixed amount
    },
    minimum_order_amount: {
      type: Number,
      default: 0,
    },
    applicable_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
    applicable_categories: [
      {
        type: String,
        enum: ["food", "accessories", "toys", "health", "grooming", "other"],
      },
    ],
    promo_code: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when not null
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    usage_limit: {
      type: Number,
      default: null, // null means unlimited
    },
    usage_count: {
      type: Number,
      default: 0,
    },
    user_limit: {
      type: Number,
      default: 1, // How many times a single user can use this promotion
    },
    used_by: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        usage_count: {
          type: Number,
          default: 1,
        },
        used_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
    banner_image: {
      type: String, // Cloudinary URL
    },
    terms_conditions: {
      type: String,
    },
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
      default: 0, // How many times the promotion was actually used
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
promotionSchema.index({ business_id: 1, is_active: 1 });
promotionSchema.index({ promo_code: 1 });
promotionSchema.index({ start_date: 1, end_date: 1 });

// Validation to ensure end_date is after start_date
promotionSchema.pre("save", function (next) {
  if (this.end_date <= this.start_date) {
    next(new Error("End date must be after start date"));
  } else {
    next();
  }
});

module.exports = mongoose.model("promotion", promotionSchema);
