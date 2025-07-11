const Pet = require("../model/pet");
const Lost = require("../model/lost");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_APP_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const get_pet = async (req, res) => {
  try {
    const { user } = req.body;
    let data = await Pet.find({ user: user }).populate(
      "user",
      "firstname lastname phone address"
    );
    res.json({
      success: true,
      message: "Información de la mascota obtenida correctamente",
      pets_list: data,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const get_pet_id = async (req, res) => {
  try {
    const petId = req.params.id;

    const data = await Pet.findOne({ _id: petId }).populate(
      "user",
      "firstname lastname phone address"
    );

    if (!data) {
      return res.json({
        success: false,
        message: "Mascota no encontrada para este usuario",
      });
    }

    res.json({
      success: true,
      message: "Información de la mascota obtenida correctamente",
      pet: data,
    });
  } catch (error) {
    console.error(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const petvaccine = async (req, res) => {
  try {
    const {
      id,
      vaccine,
      vaccine_date,
      vaccine_reminder,
      vaccine_price,
      veterinary_managed,
      user,
    } = req.body;
    const data = await Pet.create({
      pet_vaccine: vaccine,
      pet_vaccine_date: vaccine_date,
      pet_vaccine_reminder_date: vaccine_reminder,
      pet_vaccine_price: vaccine_price,
      veterinary_managed: veterinary_managed,
      id: id,
      user: user,
    });
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
    res.status(200).json({
      success: true,
      message: "Vaccine added successfully",
      pet_details: data,
    });
    // }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getVaccineReminder = async (req, res) => {
  try {
    const vaccine = await Pet.findOne({ _id: req.body.id });
    res.status(200).json({
      success: true,
      message: "recordatorio de vacuna obtenido con éxito",
      data: vaccine,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const postFavorite = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Pet.findOne({ _id: id });
    if (!data) {
      return res.status(400).json({ success: false, message: "Pet not found" });
    }
    const favExists = data.likes.some((fav) => fav.id.equals(id));
    if (favExists) {
      const doc = await Pet.findByIdAndUpdate(
        data._id,
        { $unset: { likes: "" } },
        { new: true }
      );
      res
        .status(200)
        .json({ success: true, message: "Te eliminaron de favoritos" });
    } else {
      data.likes.push(req.body);
      await data.save();
      return res
        .status(200)
        .json({ success: true, message: "Tu favorita la mascota." });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const discard = async (req, res) => {
  try {
    const data = await Pet.findOne({ _id: req.body.id });
    if (!data) {
      return res.status(400).json({ success: false, message: "Pet not found" });
    }
    data.discards.push(req.body);
    await data.save();
    res.status(200).json({ success: true, message: "Descartar el perfil." });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const pet_register = async (req, res) => {
  try {
    const {
      user,
      name,
      gender,
      dob,
      weight,
      height,
      microchip_number,
      race,
      description,
      color,
      pet,
    } = req.body;
    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image image." });
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if (result) {
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
        pet_color: color,
        pet_image: result.secure_url,
      });
      res.json({
        success: true,
        message: "La información de la mascota se guardó correctamente",
        data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const dogmatch = async (req, res) => {
  try {
    const {
      id,
      neutered,
      temperament,
      socialize,
      time,
      location,
      size,
      distance,
      age,
      notes,
    } = req.body;
    const data = await Pet.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isNeutered: neutered,
          temperament: temperament,
          pet_socialize: socialize,
          preferred_time: time,
          preferred_location: location,
          pet_size: size,
          distance: distance,
          preferred_age: age,
          notes_other: notes,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Se ha guardado la información del partido del perro",
      pet_details: data,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete({ _id: req.body.id });
    res
      .status(200)
      .json({ success: true, message: "La mascota ha sido eliminada." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  pet_register,
  get_pet,
  get_pet_id,
  postFavorite,
  dogmatch,
  deletePet,
  discard,
};
