 const cloudinary = require("../config/cloudinary");
const ads = require("../model/ads");
const adsRegister = async (req, res) => {
    try {
      console.log(req.body);
        const {id,content,method,name,address} = req.body
        let featuredImage = ''
        if (req.file) {
          // Upload an image
          const uploadResult = await cloudinary.uploader
              .upload(
                  req.file.path,
                  { folder: 'mascotas', resource_type: 'auto' }
              )
              .catch((error) => {
                 console.log("error")
              });
          featuredImage = uploadResult.secure_url
         
      }
      console.log(featuredImage)
     const data = Business.create({
      id: id,
      content: content,
      add_link: featuredImage,
      payment_method: method,
      billing_name: name,
      billing_address: address
     });
        res.status(200).json({ success: true, message: "Ads have been saved successfully", data})
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  const findAds = async(req,res)=>{
    try {
        const data = await ads.find({id: req.body.id})
        res.status(200).json({success: true, data: data});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
  }
  module.exports = {
   adsRegister,
   findAds
  }