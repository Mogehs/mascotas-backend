const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const Business = require("../model/business");
const User = require("../model/user")
const businessRegister = async (req, res) => {
    try {
        const {id,name,type,description,branch,phone,email,website,address,operation_timings,tax,addition} = req.body
        console.log(req.body);
        const data = await Business.create({
          id:id,
          company_name: name,
          company_type: type,
          company_description: description,
          branches: branch,
          phone: phone,
          email: email,
          website: website,
          additional: addition,
          physical_address: address,
          operation_timing: operation_timings,
          tax_identification_number: tax
         });
          await User.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              company_registered: true
            },
          },
          { new: true }
        );
            res.status(200).json({ success: true, message: "Business information saved successfully", business: data._id})
         
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const uploadBusinessImage = async(req,res)=>{
    try {
       if (!req?.files?.picture)
          return res.status(400).json({success: false, message: "Please upload the pet image."});
        const file = req.files.picture;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: file.name,
          resource_type: "image",
          folder: "mascotas",
        });
        console.log(result);
        console.log(req.body.uid);
        if(result){
          const data = await Business.findByIdAndUpdate(
                   { _id: req.body.uid },
                   {
                     $set: {
                    company_logo: result.secure_url,
                     },
                   },
                   { new: true }
                 );
          res.status(200).json({success: true, message: "Imagen cargada exitosamente"});       
        }   
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const uploadLatlng = async(req,res)=>{
    try {
          const data = await Business.findByIdAndUpdate(
                   { _id: req.body.uid },
                   {
                     $set: {
                    latitude: req.body.lat,
                    longitude: req.body.lon
                     },
                   },
                   { new: true }
                 );
          res.status(200).json({success: true, message: "El formulario comercial se ha completado con éxito"});       
          
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const getBusiness = async(req,res)=>{
    try {
      
      const data = await Business.find();
      res.status(200).json({success: true, message: "Business are fetcched", data: data});

    } catch (error) {
      console.log(error.message);
      res.status(500).json({success: false, message: error.message});
    }
  }

  const updateBusiness = async (req, res) => {
    try {
      console.log("working")
        const {id,name,type,description,branch,phone,email,website,address,operation_timings,tax,addition} = req.body
        console.log(req.body);

        const data = await Business.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
             company_name: name,
             company_type: type,
             company_description: description,
             branches: branch,
             phone: phone,
             email: email,
             website: website,
             additional: addition,
             physical_address: address,
             operation_timing: operation_timings,
             tax_identification_number: tax
            },
          },
          { new: true }
        );
 res.status(200).json({success: true, message: "El formulario comercial se ha completado con éxito",business: data._id});              
    
   
         
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  module.exports = {
   businessRegister,
   uploadBusinessImage,
   uploadLatlng,
   getBusiness,
   updateBusiness
  }