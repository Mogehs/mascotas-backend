const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const analyticsSchema = new Schema(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "business",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ad_view",
        "ad_click",
        "product_view",
        "product_click",
        "product_contact",
        "promotion_view",
        "promotion_click",
        "profile_view",
      ],
      required: true,
    },
    resource_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // ID of the ad, product, or promotion
    },
    resource_type: {
      type: String,
      enum: ["ad", "product", "promotion", "business_profile"],
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    user_location: {
      city: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    device_info: {
      type: String, // mobile, tablet, desktop
    },
    session_id: {
      type: String,
    },
    referrer: {
      type: String, // Where the user came from
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Additional tracking data
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
analyticsSchema.index({ business_id: 1, date: -1 });
analyticsSchema.index({ business_id: 1, type: 1, date: -1 });
analyticsSchema.index({ resource_id: 1, type: 1, date: -1 });

module.exports = mongoose.model("analytics", analyticsSchema);
