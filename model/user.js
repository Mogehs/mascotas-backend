const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String
    },
    password:{
        type: String
    },
    firstname:{
        type: String
    },
    lastname:{
        type: String
    },
    phone:{
        type: String,
        default: "N/A"
    },
    address:{
        type: String,
        default: "N/A"
    },
    city:{
        type: String
    },
    postalcode:{
        type: String
    },
    state:{
        type: String
    },
    role:{
        type: String
    },
    business_subscription:{
        type: Boolean,
        default: false
    },
    badge_subscription:{
        type: Boolean,
        default: false
    },
    badge_name:{
        type: String
    },
    device_token:{
        type: String
    }
},{
    timestamps: true
})
module.exports = mongoose.model("user", userSchema);