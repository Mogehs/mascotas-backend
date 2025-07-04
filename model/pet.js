const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "petprofiles",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const discardSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "petprofiles",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const petschema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    id: {
      type: String,
    },
    pet_name: {
      type: String,
    },
    pet_gender: {
      type: String,
    },
    pet_color: {
      type: String,
    },
    pet_image: {
      type: String,
    },
    pet_weight: {
      type: String,
    },
    pet_dob: {
      type: String,
    },
    pet: {
      type: String,
    },
    pet_height: {
      type: String,
    },
    pet_race: {
      type: String,
    },
    pet_microchip_number: {
      type: String,
      default: "N/A",
    },
    pet_description: {
      type: String,
    },
    likes: [likeSchema],
    discards: [discardSchema],
    isNeutered: {
      type: String,
      default: "No",
    },
    temperament: {
      type: [String],
    },
    pet_socialize: {
      type: String,
      default: "No",
    },
    preferred_time: {
      type: [String],
    },
    preferred_location: {
      type: String,
      default: "N/A",
    },
    pet_size: {
      type: String,
      default: "Todos",
    },
    distance: {
      type: String,
    },
    preferred_age: {
      type: String,
      default: "1-5 años",
    },
    notes_other: {
      type: String,
      default: "Prefiere perros tranquilos",
    },
  },
  {
    timestamps: true,
  },
  {
    strictPopulate: false,
  }
);
module.exports = mongoose.model("petprofiles", petschema);
