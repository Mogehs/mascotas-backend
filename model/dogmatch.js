const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dogMatchSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "petprofiles",
      required: true,
    },
    neutered: {
      type: String,
      required: true,
    },
    temperament: {
      type: [String],
      required: true,
    },
    socialize: {
      type: String,
      required: true,
    },
    time: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("dogmatch", dogMatchSchema);
