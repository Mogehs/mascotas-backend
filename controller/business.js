 const cloudinary = require("../config/cloudinary");
const Business = require("../model/business");
const businessRegister = async (req, res) => {
    try {
      console.log(req.body);
        const {id,name,description,branch,type,phone,email,address,website,operation_timings,tax} = req.body
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
      company_name: name,
      company_type: type,
      company_description: description,
      company_logo: featuredImage,
      phone: phone,
      branches: branch,
      email: email,
      physical_address: address,
      website: website,
      operation_timing: operation_timings,
      tax_identification_number: tax
     });
        res.status(200).json({ success: true, message: "Business information saved successfully", data})
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  module.exports = {
   businessRegister
  }