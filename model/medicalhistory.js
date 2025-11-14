const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const medicalSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "petprofiles",
      required: true,
    },
    pet_vaccine: {
      type: String,
      default: "N/A",
    },
    pet_vaccine_date: {
      type: String,
      default: "N/A",
    },
    veterinary_managed: {
      type: String,
      default: "N/A",
    },
    pet_vaccine_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple vaccine reminder times per day
    pet_vaccine_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    pet_vaccine_price: {
      type: String,
      default: "N/A",
    },
    pet_vaccine_image: {
      type: String,
    },
    pet_deworming_type: {
      type: String,
      default: "N/A",
    },
    pet_deworming_method: {
      type: String,
      default: "N/A",
    },
    pet_deworming_date: {
      type: String,
      default: "N/A",
    },
    pet_deworming_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple deworming reminder times per day
    pet_deworming_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    used_product_in_deworming: {
      type: String,
      default: "N/A",
    },
    pet_deworming_price: {
      type: String,
      default: "N/A",
    },
    pet_deworming_image: {
      type: String,
    },
    pet_disease_name: {
      type: String,
      default: "N/A",
    },
    pet_disease_title: {
      type: String,
      default: "N/A",
    },
    pet_disease_description: {
      type: String,
      default: "N/A",
    },
    pet_date_diagnosis: {
      type: String,
      default: "N/A",
    },
    pet_treatment_start_date: {
      type: String,
      default: "N/A",
    },
    pet_treatment_end_date: {
      type: String,
      default: "N/A",
    },
    pet_treatment_remider_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple reminder times per day
    pet_treatment_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    pet_veterinarian_diagnosis: {
      type: String,
      default: "N/A",
    },
    pet_treatment_price: {
      type: String,
      default: "N/A",
    },
    pet_surgery_type: {
      type: String,
      default: "N/A",
    },
    pet_date_surgery: {
      type: String,
      default: "N/A",
    },
    pet_description_surgery: {
      type: String,
      default: "N/A",
    },
    veterinarian_name: {
      type: String,
      default: "N/A",
    },
    post_operation_reminder: {
      type: String,
      default: "N/A",
    },
    // Support for multiple post-operation reminder times per day
    post_operation_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    surgery_price: {
      type: String,
      default: "N/A",
    },
    medical_check_up_date: {
      type: String,
      default: "N/A",
    },
    check_results: {
      type: String,
      default: "N/A",
    },
    veterinarian: {
      type: String,
      default: "N/A",
    },
    next_check_up_reminder: {
      type: String,
      default: null,
    },
    // Support for multiple check-up reminder times per day
    next_check_up_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],

    check_up_price: {
      type: String,
      default: "N/A",
    },
    allergy_type: {
      type: String,
      default: "N/A",
    },
    allergy_title: {
      type: String,
      default: "N/A",
    },
    allergy_symptoms: {
      type: String,
      default: "N/A",
    },
    allergy_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple allergy reminder times per day
    allergy_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    drug_name: {
      type: String,
      default: "N/A",
    },
    dosage: {
      type: String,
      default: "N/A",
    },
    frequency: {
      type: String,
      default: "N/A",
    },
    dose_start_date: {
      type: String,
      default: "N/A",
    },
    dose_end_date: {
      type: String,
      default: "N/A",
    },
    dose_reminder: {
      type: String,
      default: "N/A",
    },
    // Support for multiple dose reminder times per day
    dose_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    dose_price: {
      type: String,
      default: "N/A",
    },
    diet_name: {
      type: String,
      default: "N/A",
    },
    diet_description: {
      type: String,
      default: "N/A",
    },
    recommend: {
      type: String,
      default: "N/A",
    },
    diet_price: {
      type: String,
      default: "N/A",
    },
    diet_review_date: {
      type: String,
      default: "N/A",
    },
    diet_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple diet reminder times per day
    diet_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    activity_type: {
      type: String,
      default: "N/A",
    },
    activity_description: {
      type: String,
      default: "N/A",
    },
    activity_date: {
      type: String,
      default: "N/A",
    },
    activity_image: {
      type: String,
    },
    activity_duration: {
      type: String,
      default: "N/A",
    },
    distance_traveled: {
      type: String,
      default: "N/A",
    },
    altitude_reached: {
      type: String,
      default: "N/A",
    },
    activity_location: {
      type: String,
      default: "N/A",
    },
    difficulty: {
      type: String,
      default: "N/A",
    },
    fun_level: {
      type: String,
      default: "N/A",
    },
    activity_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple activity reminder times per day
    activity_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    hair_service: {
      type: String,
      default: "N/A",
    },
    hair_description: {
      type: String,
      default: "N/A",
    },
    hair_image: {
      type: String,
    },
    date_served: {
      type: String,
      default: "N/A",
    },
    hair_price: {
      type: String,
      default: "N/A",
    },
    hair_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple hair service reminder times per day
    hair_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    emergency_veterinarian_name: {
      type: String,
      default: "N/A",
    },
    emergency_phone: {
      type: String,
      default: "N/A",
    },
    emergency_email: {
      type: String,
      default: "N/A",
    },
    emergency_address: {
      type: String,
      default: "N/A",
    },
    personal_type: {
      type: String,
      default: "N/A",
    },
    personal_description: {
      type: String,
      default: "N/A",
    },
    personal_date: {
      type: String,
      default: "N/A",
    },
    personal_duration: {
      type: String,
      default: "N/A",
    },
    personal_travelled: {
      type: String,
      default: "N/A",
    },
    personal_image: {
      type: String,
    },
    personal_location: {
      type: String,
      default: "N/A",
    },
    personal_fun: {
      type: String,
      default: "N/A",
    },
    personal_reminder_date: {
      type: String,
      default: "N/A",
    },
    // Support for multiple personal activity reminder times per day
    personal_reminder_times: [
      {
        date: {
          type: String,
          required: true,
        },
        times: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
  {
    strictPopulate: false,
  }
);
module.exports = mongoose.model("medical", medicalSchema);
