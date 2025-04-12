const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    id:{
        type:mongoose.Schema.Types.ObjectId, ref:'user',
    },
    company_name:{
        type: String
    },
    company_type:{
        type: String
    },
    company_description:{
        type: String
    },
    company_logo:{
        type: String
    },
    phone:{
        type: String
    },
    email:{
        type: String
    },
    website:{
        type: String
    },
    social:{
        type: String
    },
    physical_address:{
        type: String
    },
    branches:{
        type: String
    },
    operation_timing:[String],
    // content:{
    //     type: String
    // },
    //  add_link:{
    //     type: String
    // },
    //  payment_method:{
    //  type: String
    // },
    //   billing_name:{
    //     type: String
    // },
    //   billing_address:{
    //     type: String
    // },
     tax_identification_number:{
        type: String
    },
},{
    timestamps: true
})
module.exports = mongoose.model("business",businessSchema);