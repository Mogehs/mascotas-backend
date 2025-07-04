const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const lostSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    pet_name: {
      type: String,
    },
    location: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    contact: {
      type: String,
    },
    details: {
      type: String,
    },
    pet_image: {
      type: String,
    },
    latitude: {
      type: String,
      default: "N/A",
    },
    longitude: {
      type: String,
      default: "N/A",
    },
  },
  {
    timestamps: true,
  },
  {
    strictPopulate: false,
  }
);
module.exports = mongoose.model("lost", lostSchema);
