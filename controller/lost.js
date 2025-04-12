
const lost = require("../model/lost");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const lostPet = async(req,res)=>{
     try { 
    console.log(req.body);
      const {user,name,location,date,time,contact,details} = req.body
if (!req?.files?.picture)
      return res.status(400).json({success: false, message: "Please upload the pet image."});
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if(result){
  const data = lost.create({
      user: user,
      pet_name: name,
      location: location,
      date: date,
      time: time,
      contact: contact,
      details: details,
      pet_image: featuredImage
     });
        res.json({ success: true, message: "Lost Pet information has been saved successfully", data})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({success: false,message: error.message});
  }
}



  module.exports = {
   lostPet
  }