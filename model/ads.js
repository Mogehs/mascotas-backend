const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adsSchema = new Schema({
    id:{
        type:mongoose.Schema.Types.ObjectId, ref:'user',
    },
    content:{
        type: String
    },
     add_link:{
        type: String
    },
     payment_method:{
     type: String
    },
      billing_name:{
        type: String
    },
      billing_address:{
        type: String
    },
},{
    timestamps: true
})
module.exports = mongoose.model("ads",adsSchema);