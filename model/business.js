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
      type: String,
    },
    longitude: {
      type: String,
    },
    operation_timing: {},
    tax_identification_number: {
      type: String,
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("business", businessSchema);
