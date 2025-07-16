const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "business",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["food", "accessories", "toys", "health", "grooming", "other"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "EUR",
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    is_available: {
      type: Boolean,
      default: true,
    },
    availability_status: {
      type: String,
      enum: ["in_stock", "out_of_stock", "limited_stock", "on_request"],
      default: "in_stock",
    },
    specifications: {
      type: Map,
      of: String, // Key-value pairs for product specs
    },
    tags: [String],
    weight: {
      type: Number, // in kg
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    contact_preference: {
      type: String,
      enum: ["phone", "email", "both"],
      default: "both",
    },
    views: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0, // Track how many people clicked to contact
    },
    contact_clicks: {
      type: Number,
      default: 0, // Track phone/email clicks
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    featured_until: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
productSchema.index({ business_id: 1, category: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ is_featured: -1, createdAt: -1 });

module.exports = mongoose.model("product", productSchema);
