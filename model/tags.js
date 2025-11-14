const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return v >= 0 && Number.isFinite(v);
        },
        message: "Price must be a positive number",
      },
    },
    icons: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
tagSchema.index({ title: 1 });
tagSchema.index({ isActive: 1 });

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
