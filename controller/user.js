const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const user = require("../model/user");
const Pet = require("../model/pet");

const registeruser = async(req,res)=>{
  try {
    console.log(req.body);
    const {email,password} = req.body
  let check = await user.findOne({ email: email });
  if (check) {
    return res.status(400).json({ success: false, message: "Please provide the correct email." })
  } else {
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(password, salt)
    check = await user.create({
        email: email,
        password: securePass
    });
    res.status(200).json({ success: true, message: "You are registered successfully", uid: check._id })
  }
} catch (error) {
  console.log(error.message);
  return res.status(500).json({ success: false, message: error.message });
}
};

const registerowner = async (req, res) => {
    try {
        const {uid,firstname,lastname,phone,address,city,state,postalcode,role} = req.body
      let check = await user.findOne({ _id: uid });
 const data = await user.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
          "phone": phone,
          "firstname": firstname,
          "lastname": lastname,
          "address": address,
          "city":city,
          "state": state,
          "postalcode": postalcode,
          "role": role
            },
          },
          { new: true }
        );
      res.status(200).json({ success: true, message: "Your owner data information is saved successfully." })
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  const login = async (req, res) => {
    const { email, password, token } = req.body;
    try {
      let check = await user.findOne({ email: email });
      if (!check) {
        return res.status(400).json({ success: false, message: "Please provide correct email." });
      }
  
      const passwordCompare = await bcrypt.compare(password, check.password);
      if (!passwordCompare) {
        return res.status(400).json({ success: false, message: "Please provide correct password." });
      }
      const tokenData = await user.findByIdAndUpdate(
        { _id: check._id },
        { $set: { device_token: token } },
        { new: true });
      if (tokenData) {
        
       // const accessToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
        res.json({ success: true,message: "user logged in",user_details: tokenData });
      }
  
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
const fetchUsers = async (req,res)=>{
  try {
    const users = await Pet.find().populate({
      path: 'user',
      select:
        '_id firstname lastname city address phone state role',
    });
    res.status(200).json({success: true, message: "Data found", data: users});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({success: false, message: error.message});
  }
}

const badge = async (req,res)=>{
  try {
      const  {id,name} = req.body
      const check = await user.findOne({ _id : id });
      if (check) {
        const data = await user.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "badge_subscription": true,
              "badge_name": name
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Badge information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
}

const business = async (req,res)=>{
  try {
      const  {id} = req.body
      const check = await user.findOne({ _id : id });
      if (check) {
        const data = await user.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "business_subscription": true
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Badge information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
}




  module.exports =  {
    login,
    registeruser,
    registerowner,
    fetchUsers,
    badge,
    business

  }