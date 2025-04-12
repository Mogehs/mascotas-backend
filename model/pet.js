const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema({
   id: {
         type: mongoose.Schema.Types.ObjectId, ref: 'petprofiles'
    },
},{
  timestamps: true
});

const petschema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
       },
    pet_name:{
        type: String
    },
    pet_gender:{
        type: String
    },
    pet_color:{
        type: String
    },
  
    pet_image:{
        type:  String
    },
    pet_weight:{
        type: String
    },
    pet_dob:{
        type: String
    },
   pet:{
    type: String
   },
   pet_height:{
    type: String
   },
   pet_race:{
    type: String
   },
    pet_microchip_number:{
        type: String,
        default: 'N/A'
    },
    pet_description:{
        type: String
    },
    pet_vaccine:{
        type: String
    },
    pet_vaccine_date:{
        type: String
    },
    veterinary_managed:{
        type: String
    },
    pet_vaccine_reminder_date:{
        type: String
    },
    pet_vaccine_price:{
        type: String
    },
    pet_deworming_type:{
        type: String
    },
    pet_deworming_method:{
        type: String
    },
    pet_deworming_date:{
        typ: String
    },
    pet_deworming_reminder_date:{
        type: String
    },
    used_product_in_deworming:{
        type: String
    },
    pet_deworming_price:{
        type: String
    },
    pet_disease_name:{
        type: String
    },
    pet_disease_title:{
        type: String
    },
    pet_disease_description:{
        type: String
    },
    pet_date_diagnosis:{
        type: String
    },
    pet_treatment_start_date:{
        type: String
    },
    pet_treatment_end_date:{
        type: String
    },
    pet_treatment_remider_date:{
   type: String
    },
    pet_veterinarian_diagnosis:{
        type: String
    },
    pet_treatment_price:{
        type: String
    },
    pet_surgery_type:{
        type: String
    },
    pet_date_surgery:{
        type: String
    },
    pet_description_surgery:{
        type: String
    },
    veterinarian_name:{
        type: String
    },
    post_operation_reminder:{
        type: String
    },
    surgery_price:{
        type: String
    },
    medical_check_up_date:{
        type: String
    },
    check_results:{
     type: String
    },
    veterinarian:{
        type: String
    },
    next_check_up_reminder:{
        type: String
    },
    check_up_price:{
        type: String
    },
    allergy_type:{
        type: String
    },
    allergy_title:{
        type: String
    },
    allergy_symptoms:{
        type: String
    },
    allergy_reminder_date:{
        type: String
    },
    drug_name:{
        type: String
    },
    dosage:{
        type: String
    },
    frequency:{
        type: String
    },
    dose_start_date:{
       type: String
    },
    dose_end_date:{
        type: String
    },
    dose_reminder:{
        type: String
    },
    dose_price:{
        type: String
    },
    diet_name:{
        type: String
    },
    diet_description:{
        type: String
    },
    recommend:{
        type: String
    },
    diet_price:{
        type: String
    },
    diet_review_date:{
        type: String
    },
    activity_type:{
        type: String
    },
    activity_description:{
        type: String
    },
    activity_date:{
        type: String
    },
    activity_duration:{
        type: String
    },
    distance_traveled:{
        type: String
    },
    altitude_reached:{
        type: String
    },
    activity_location:{
        type: String
    },
    difficulty:{
        type: String
    },
    fun_level:{
        type: String
    },
    hair_service:{
        type: String
    },
    hair_description:{
        type: String
    },
    date_served:{
        type: String
    },
    hair_price:{
        type: String
    },
    emergency_veterinarian_name:{
        type: String
    },
    emergency_phone:{
        type: String
    },
    emergency_email:{
        type: String
    },
    emergency_address:{
        type:  String
    },
    likes:[likeSchema]
    
},{
    timestamps: true
},{
     strictPopulate: false
})
module.exports = mongoose.model("petprofiles", petschema);