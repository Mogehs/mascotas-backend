const Lost = require("../model/lost");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const lostPet = async (req, res) => {
  try { 
      const {user,name,location,date,time,contact,details,latitude,longitude} = req.body
if (!req?.files?.picture)
    return res.status(400).json({success: false, message: "Por favor sube la imagen de la mascota"});

    const file = req.files.picture;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    public_id: file.name,
    resource_type: "image",
    folder: "mascotas",
  });
   const data = await Lost.create({
    user: user,
    pet_name: name,
    location: location,
    date: date,
    time: time,
    contact: contact,
    details: details,
    pet_image: result.secure_url,
    latitude: latitude,
    longitude: longitude
   });
      res.json({ success: true, message: "La información de la mascota perdida se ha guardado correctamente", data})
    
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const allLostPets = async(req,res)=>{
try {
  const users = await Lost.find({ user:  req.body.user });
  res.status(200).json({success: true, message: "Mascotas perdidas recuperadas con éxito",data: users});
} catch (error) {
  console.error('Error fetching pets:', error);
  res.status(500).json({success:false,  message: error.message });
   }
}

const deletePet = async (req, res) => {
  try {
    const  {id} = req.body

     await Lost.findByIdAndDelete({_id: id})
      res.status(200).json({ success: true, message: "La información de la mascota perdida se ha eliminado de forma permanente." })
    
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}


const updateLostPet = async (req, res) => {
  try {
    const {name,location,date,time,contact,details,id} = req.body
    const data = await Lost.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          "pet_name": name,
          "location": location,
          "date": date,
          "time": time,
          "contact": contact,
          "details": details,
        },
      },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Se han actualizado los detalles de la mascota perdida." })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

  module.exports = {
    lostPet,
    allLostPets,
    deletePet,
    updateLostPet
  }