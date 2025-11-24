const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "petprofiles",
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  url: {
    type: String,
    required: false,
  },
  qrCodeImage: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  soldBy: {
    type: String,
    default: null,
    required: false,
  },
  shopName: {
    type: String,
    default: null,
    required: false,
  },
  printStatus: {
    type: String,
    enum: ["pending", "sent_for_print", "assigned"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

qrCodeSchema.index({ petId: 1 });
qrCodeSchema.index({ userId: 1 });

module.exports = mongoose.model("QRCode", qrCodeSchema);
