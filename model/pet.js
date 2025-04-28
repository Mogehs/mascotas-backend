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
     id:{
        type: String
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
    likes:[likeSchema]
    
},{
    timestamps: true
},{
     strictPopulate: false
})
module.exports = mongoose.model("petprofiles", petschema);