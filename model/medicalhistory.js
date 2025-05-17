const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const medicalSchema = new Schema({
    // user:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'user',
    //     required:true
    //    },
     pet:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'petprofiles',
        required: true,
     },
    pet_vaccine:{
        type: String,
        default: 'N/A'
    },
    pet_vaccine_date:{
        type: String,
         default: 'N/A'
    },
    veterinary_managed:{
        type: String,
         default: 'N/A'
    },
    pet_vaccine_reminder_date:{
        type: String,
         default: 'N/A'
    },
    pet_vaccine_price:{
        type: String,
         default: 'N/A'
    },
    pet_vaccine_image:{
        type: String
    },
    pet_deworming_type:{
        type: String,
         default: 'N/A'
    },
    pet_deworming_method:{
        type: String,
         default: 'N/A'
    },
    pet_deworming_date:{
        type: String,
      default: 'N/A'
    },
    pet_deworming_reminder_date:{
        type: String,
        default: 'N/A'
    },
    used_product_in_deworming:{
        type: String,
        default: 'N/A'
    },
    pet_deworming_price:{
        type: String,
          default: 'N/A'
    },
    pet_deworming_image:{
        type: String
    },
    pet_disease_name:{
        type: String,
         default: 'N/A'
    },
    pet_disease_title:{
        type: String,
         default: 'N/A'
    },
    pet_disease_description:{
        type: String,
         default: 'N/A'
    },
    pet_date_diagnosis:{
        type: String,
         default: 'N/A'
    },
    pet_treatment_start_date:{
        type: String,
         default: 'N/A'
    },
    pet_treatment_end_date:{
        type: String,
        default: 'N/A'
    },
    pet_treatment_remider_date:{
   type: String,
   default: 'N/A'
    },
    pet_veterinarian_diagnosis:{
        type: String,
        default: 'N/A'
    },
    pet_treatment_price:{
        type: String,
        default: 'N/A'
    },
    pet_surgery_type:{
        type: String,
        default: 'N/A'
    },
    pet_date_surgery:{
        type: String,
        default: 'N/A'
    },
    pet_description_surgery:{
        type: String,
        default: 'N/A'
    },
    veterinarian_name:{
        type: String,
        default: 'N/A'
    },
    post_operation_reminder:{
        type: String,
        default: 'N/A'
    },
    surgery_price:{
        type: String,
        default: 'N/A'
    },
    medical_check_up_date:{
        type: String,
        default: 'N/A'
    },
    check_results:{
     type: String,
     default: 'N/A'
    },
    veterinarian:{
        type: String,
        default: 'N/A'
    },
    next_check_up_reminder:{
        type: String,
        default: 'N/A'
    },
    check_up_price:{
        type: String,
        default: 'N/A'
    },
    allergy_type:{
        type: String,
        default: 'N/A'
    },
    allergy_title:{
        type: String,
        default: 'N/A'
    },
    allergy_symptoms:{
        type: String,
        default: 'N/A'
    },
    allergy_reminder_date:{
        type: String,
        default: 'N/A'
    },
    drug_name:{
        type: String,
        default: 'N/A'
    },
    dosage:{
        type: String,
        default: 'N/A'
    },
    frequency:{
        type: String,
        default: 'N/A'
    },
    dose_start_date:{
       type: String,
       default: 'N/A'
    },
    dose_end_date:{
        type: String,
        default: 'N/A'
    },
    dose_reminder:{
        type: String,
        default: 'N/A'
    },
    dose_price:{
        type: String,
        default: 'N/A'
    },
    diet_name:{
        type: String,
        default: 'N/A'
    },
    diet_description:{
        type: String,
        default: 'N/A'
    },
    recommend:{
        type: String,
        default: 'N/A'
    },
    diet_price:{
        type: String,
        default: 'N/A'
    },
    diet_review_date:{
        type: String,
        default: 'N/A'
    },
    activity_type:{
        type: String,
        default: 'N/A'
    },
    activity_description:{
        type: String,
        default: 'N/A'
    },
    activity_date:{
        type: String,
        default: 'N/A'
    },
    activity_image:{
        type: String
    },
    activity_duration:{
        type: String,
        default: 'N/A'
    },
    distance_traveled:{
        type: String,
        default: 'N/A'
    },
    altitude_reached:{
        type: String,
        default: 'N/A'
    },
    activity_location:{
        type: String,
        default: 'N/A'
    },
    difficulty:{
        type: String,
        default: 'N/A'
    },
    fun_level:{
        type: String,
        default: 'N/A'
    },
    hair_service:{
        type: String,
        default: 'N/A'
    },
    hair_description:{
        type: String,
        default: 'N/A'
    },
    hair_image:{
        type: String,
    },
    date_served:{
        type: String,
        default: 'N/A'
    },
    hair_price:{
        type: String,
        default: 'N/A'
    },
    emergency_veterinarian_name:{
        type: String,
        default: 'N/A'
    },
    emergency_phone:{
        type: String,
        default: 'N/A'
    },
    emergency_email:{
        type: String,
        default: 'N/A'
    },
    emergency_address:{
        type:  String,
        default: 'N/A'
    },
    personal_type:{
        type: String
    },
    personal_description:{
        type: String
    },
    personal_date:{
        type: String
    },
    personal_duration:{
        type: String
    },
    personal_travelled:{
        type: String
    },
    personal_image:{
        type: String
    },
    personal_location:{
        type: String
    },
    personal_fun:{
        type: String
    }
},{
    timestamps: true
},{
    strictPopulate: false
})
module.exports = mongoose.model("medical",medicalSchema);