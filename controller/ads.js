const ads = require("../model/ads");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const adsRegister = async (req, res) => {
    try {
      console.log(req.body);
        const {id,content,method,name,address} = req.body
        if (!req?.files?.picture)
          return res.status(400).json({success: false, message: "Please upload the ad image."});
        const file = req.files.picture;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: file.name,
          resource_type: "image",
          folder: "mascotas",
        });
        if(result){
          const data = await ads.create({
            id: id,
            content: content,
            add_link: result.secure_url,
            payment_method: method,
            billing_name: name,
            billing_address: address
           });
           res.status(200).json({ success: true, message: "Ads have been saved successfully", data})
        }      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  const findAds = async(req,res)=>{
    try {
        const data = await ads.find();
        console.log(data);
        res.status(200).json({success: true, message: "data fetched", data: data});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
  }
  module.exports = {
   adsRegister,
   findAds
  }