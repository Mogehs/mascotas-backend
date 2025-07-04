const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    payment_id: {
      type: String,
    },
    amount: {
      type: String,
    },
    badge: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("order", orderSchema);
