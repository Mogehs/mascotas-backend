const mongoose = require("mongoose");

const ORDER_STATUSES = ["pending", "processing", "on_the_way", "delivered", "cancelled"];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      default: null,
    },
    // Denormalized for display and emails without extra lookups
    tag_title: { type: String, default: "" },
    user_name:  { type: String, default: "" },
    user_email: { type: String, default: "" },

    payment_id: { type: String, default: "" },
    amount:     { type: Number, default: 0 },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },

    shipping_address: { type: String, default: "" },
    notes:            { type: String, default: "" },

    // History of every status change for auditing
    status_history: [
      {
        status:    { type: String, enum: ORDER_STATUSES },
        notes:     { type: String, default: "" },
        changed_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("order", orderSchema);
