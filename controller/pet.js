const Pet = require("../model/pet");
const Lost = require("../model/lost");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

  const get_pet = async(req,res)=>{
    try {
      const { user} = req.body;
      console.log(req.body);
      let data = await Pet.find({ user: user });
      res.json({ success: true, message: "Pet information fetched successfully", pets_list: data});
      
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  }
  const petvaccine = async (req, res) => {
    try {
      const  {id,vaccine,vaccine_date,vaccine_reminder,vaccine_price,veterinary_managed,user} = req.body
        const data = await Pet.create({
              "pet_vaccine": vaccine,
              "pet_vaccine_date": vaccine_date,
              "pet_vaccine_reminder_date": vaccine_reminder,
              "pet_vaccine_price": vaccine_price,
              "veterinary_managed": veterinary_managed,
              "id": id,
              "user": user
        })
      // const check = await Pet.findOne({ _id: id });
      // if (check) {
      //   const data = await Pet.findByIdAndUpdate(
      //     { _id: check._id },
      //     {
      //       $set: { 
      //        "pet_vaccine": vaccine,
      //         "pet_vaccine_date": vaccine_date,
      //         "pet_vaccine_reminder_date": vaccine_reminder,
      //         "pet_vaccine_price": vaccine_price,
      //         "veterinary_managed": veterinary_managed
      //       },
      //     },
      //     { new: true }
      //   );
        res.status(200).json({ success: true,message: "Vaccine added successfully", pet_details: data });
     // }
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const getVaccineReminder = async(req,res)=>{
    try {
      
      const vaccine = await Pet.findOne({ _id:req.body.id });
      res.status(200).json({success: true, message: "vaccine reminder fetched successfully",data: vaccine});
    } catch (error) {
      console.error('Error fetching pets:', error);
      res.status(500).json({success:false,  message: error.message });
    }
  }



const postFavorite = async (req, res) => {
  try {
    const {id} = req.body;
    const data = await Pet.findOne({ _id: id });
    if (!data) {
      return res.status(400).json({ success: false, message: "Pet not found" })
    }
    const favExists = data.likes.some(fav => fav.id.equals(id));
    if (favExists) {
 const doc = await Pet.findByIdAndUpdate(
      data._id,
      { $unset: { likes: "" } },
      { new: true }
    );
     res.status(200).json({ success: true, message: "You removed from the favorite" });
  
    }else{
    data.likes.push(req.body);
    await data.save();
    return res.status(200).json({ success: true, message: "You favorite the pet." });
    }
   
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};



const pet_register = async (req, res) => {
  try {
      const {user,name,gender,dob,weight,height,microchip_number,race,description,color,pet} = req.body
      console.log(req.body)
      if (!req?.files?.picture)
        return res.status(400).json({success: false, message: "Please upload the ad image image."});
      const file = req.files.picture;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: file.name,
        resource_type: "image",
        folder: "mascotas",
      });
      if(result){
        const data = await Pet.create({
          user: user,
          pet_name: name,
          pet_gender: gender,
          pet_dob: dob,
          pet: pet,
          pet_race: race,
          pet_height: height,
          pet_weight: weight,
          pet_microchip_number: microchip_number,
          pet_description: description,
          pet_color:color,
          pet_image:  result.secure_url
         });
            res.json({ success: true, message: "Pet information saved successfully", data})
      }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};


  module.exports = {
    pet_register,
    get_pet,
    postFavorite
  }