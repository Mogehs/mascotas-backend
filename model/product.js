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
      enum: [
        // Pet-related categories
        "custom_pet_accessories",
        "dog_training",
        "agility",
        "pet_food",
        "pet_equipment_rental",
        "pet_rental",
        "pet_friendly_vehicle_rental",
        "exotic_animals",
        "pet_art_portraits",
        "pet_legal_advice",
        "canicross",
        "pet_adoption_centers",
        "veterinary_clinics",
        "canine_clubs",
        "pet_nutrition_consulting",
        "pet_breeders",
        "pet_dental_care",
        "home_pet_care",
        "bird_care",
        "rodent_care",
        "equestrian_training",
        "responsible_pet_ownership",
        "canine_ethology",
        "pet_sports_events",
        "pet_events",
        "canine_exhibitions",
        "pet_friendly_experiences",
        "pet_product_manufacturer",
        "pet_photography",
        "educational_farms",
        "farm_school",
        "canine_daycare",
        "feline_daycare",
        "mobile_veterinary_daycare",
        "pet_hotels",
        "therapeutic_pets",
        "dog_walkers",
        "canine_feline_grooming",
        "pet_insurance_plans",
        "farm_artisan_products",
        "pet_products",
        "pet_rehabilitation",
        "canine_residences",
        "pet_fashion_clothing",
        "equestrian_routes",
        "canine_services",
        "lost_pet_location_services",
        "animal_health_services",
        "aquatic_pet_therapies",
        "eco_pet_product_store",
        "pet_toy_store",
        "pet_stores",
        "pet_tourism",
        "veterinarians",
        "zootherapy",
        "other",
      ],
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
