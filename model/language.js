const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const langSchema = new Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("languages", langSchema);
