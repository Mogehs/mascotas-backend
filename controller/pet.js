const Pet = require("../model/pet");
const Lost = require("../model/lost");
const QRCode = require("../model/qrcode");
const DogMatch = require("../model/dogmatch");
const {
  sendDogMatchNotificationsToUsers,
} = require("../service/notification.service");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_APP_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const get_pet = async (req, res) => {
  try {
    const { user } = req.body;
    let pets = await Pet.find({ user: user }).populate(
      "user",
      "firstname lastname phone address"
    );

    // Convert pets to plain objects and add QR code data
    const petsWithQrData = await Promise.all(
      pets.map(async (pet) => {
        const petObj = pet.toObject();
        const qrCode = await QRCode.findOne({ petId: pet._id });
        petObj.qrCode = qrCode ? qrCode.toObject() : null;
        return petObj;
      })
    );

    res.json({
      success: true,
      message: "Información de la mascota obtenida correctamente",
      pets_list: petsWithQrData,
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

    const petQr = await QRCode.findOne({ petId: petId });

    // Convert Mongoose document to a plain JavaScript object
    const petData = data.toObject();

    // Add QR code data to the response
    petData.qrCode = petQr ? petQr.toObject() : null;

    res.json({
      success: true,
      message: "Información de la mascota obtenida correctamente",
      pet: petData,
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

const update_pet = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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

    // Check if pet exists
    const existingPet = await Pet.findById(id);
    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: "Mascota no encontrada",
      });
    }

    // Prepare update data
    const updateData = {
      pet_name: name || existingPet.pet_name,
      pet_gender: gender || existingPet.pet_gender,
      pet_dob: dob || existingPet.pet_dob,
      pet: pet || existingPet.pet,
      pet_race: race || existingPet.pet_race,
      pet_height: height || existingPet.pet_height,
      pet_weight: weight || existingPet.pet_weight,
      pet_microchip_number:
        microchip_number || existingPet.pet_microchip_number,
      pet_description: description || existingPet.pet_description,
      pet_color: color || existingPet.pet_color,
    };

    // Handle image upload if provided
    if (req?.files?.picture) {
      const file = req.files.picture;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: file.name,
        resource_type: "image",
        folder: "mascotas",
      });
      if (result) {
        updateData.pet_image = result.secure_url;
      }
    }

    // Update the pet
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("user", "firstname lastname phone address");

    res.json({
      success: true,
      message: "La información de la mascota se actualizó correctamente",
      data: updatedPet,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const dogmatch = async (req, res) => {
  try {
    const { neutered, temperament, socialize, time, location, size, age } =
      req.body;
    const matchedDogs = await Pet.find({
      isNeutered: neutered,
      temperament: { $in: temperament },
      pet_socialize: socialize,
      pet_size: size,
      preferred_age: age,
      preferred_time: { $in: time },
      preferred_location: location,
    }).populate("user", "firstname lastname phone address");

    if (!matchedDogs.length) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron perros que coincidan con los filtros.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Se encontraron perros que coinciden con los filtros.",
      matchedDogs,
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

// New API: Create or update dog match preferences
const createDogMatchPreferences = async (req, res) => {
  try {
    const {
      user,
      pet,
      neutered,
      temperament,
      socialize,
      time,
      location,
      size,
      age,
    } = req.body;

    // Check if user already has preferences
    const existingPreferences = await DogMatch.findOne({ user });

    let preferencesData;
    let isNewPreferences = false;
    let isPreferencesChanged = false;

    if (existingPreferences) {
      // Check if preferences have actually changed
      const hasChanged =
        existingPreferences.neutered !== neutered ||
        JSON.stringify(existingPreferences.temperament.sort()) !==
          JSON.stringify(temperament.sort()) ||
        existingPreferences.socialize !== socialize ||
        JSON.stringify(existingPreferences.time.sort()) !==
          JSON.stringify(time.sort()) ||
        existingPreferences.location !== location ||
        existingPreferences.size !== size ||
        existingPreferences.age !== age;

      if (hasChanged) {
        isPreferencesChanged = true;
      }

      // Update existing preferences
      preferencesData = await DogMatch.findByIdAndUpdate(
        existingPreferences._id,
        {
          neutered,
          temperament,
          socialize,
          time,
          location,
          size,
          age,
          isActive: true,
        },
        { new: true }
      )
        .populate("user", "firstname lastname phone address")
        .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");
    } else {
      // Create new preferences
      isNewPreferences = true;
      const newPreferences = await DogMatch.create({
        user,
        pet,
        neutered,
        temperament,
        socialize,
        time,
        location,
        size,
        age,
      });

      preferencesData = await DogMatch.findById(newPreferences._id)
        .populate("user", "firstname lastname phone address")
        .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");
    }

    // Find other users with matching preferences (for notifications)
    const matchingUsers = findMatchingUsersForNotification(preferencesData);

    console.log(matchingUsers);
    const shouldSendNotifications = isNewPreferences || isPreferencesChanged;

    // Send notifications if needed
    let notificationResults = [];
    if (shouldSendNotifications && matchingUsers.length > 0) {
      try {
        notificationResults = await sendDogMatchNotificationsToUsers(
          matchingUsers,
          preferencesData,
          isNewPreferences
        );
        console.log(
          `Sent ${notificationResults.length} notifications for dog match preferences`
        );
      } catch (notificationError) {
        console.error(
          "Error sending dog match notifications:",
          notificationError.message
        );
      }
    }

    res.status(isNewPreferences ? 201 : 200).json({
      success: true,
      message: isNewPreferences
        ? "Preferencias de dog match creadas correctamente"
        : "Preferencias de dog match actualizadas correctamente",
      data: preferencesData,
      matchingUsers: matchingUsers.length,
      shouldSendNotifications,
      notificationType: isNewPreferences
        ? "new_preferences"
        : "updated_preferences",
      notificationsSent: notificationResults.length,
      notificationResults,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// New API: Get user's dog match preferences
const getDogMatchPreferences = async (req, res) => {
  try {
    const { user } = req.body;

    const preferences = await DogMatch.findOne({
      user,
      isActive: true,
    })
      .populate("user", "firstname lastname phone address")
      .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontraron preferencias de dog match para este usuario",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferencias de dog match obtenidas correctamente",
      data: preferences,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// New API: Get matched dogs based on user's preferences
const getAllDogMatches = async (req, res) => {
  try {
    // Get all saved preferences (for all users)
    const allPreferences = await DogMatch.find()
      .populate("user", "firstname lastname phone address")
      .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");

    if (!allPreferences || allPreferences.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay preferencias de dog match guardadas",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Se obtuvieron todas las preferencias de dog match",
      preferences: allPreferences,
      count: allPreferences.length,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to find users who should be notified when new dog match preferences are created
const findMatchingUsersForNotification = async (newUserPreferences) => {
  try {
    const matchingUsers = await DogMatch.find({
      user: { $ne: newUserPreferences.user }, // Exclude self
      isActive: true,
      neutered: newUserPreferences.neutered,
      temperament: { $in: newUserPreferences.temperament },
      socialize: newUserPreferences.socialize,
      size: newUserPreferences.size,
      age: newUserPreferences.age,
      time: { $in: newUserPreferences.time },
      location: newUserPreferences.location,
    });

    return matchingUsers;
  } catch (error) {
    console.log(
      "Error finding matching users for notification:",
      error.message
    );
    return [];
  }
};

// New API: Deactivate dog match preferences
const deactivateDogMatchPreferences = async (req, res) => {
  try {
    const { user } = req.body;

    const preferences = await DogMatch.findOneAndUpdate(
      { user },
      { isActive: false },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontraron preferencias de dog match para este usuario",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferencias de dog match desactivadas correctamente",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
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
  update_pet,
  // New dog match APIs
  createDogMatchPreferences,
  getDogMatchPreferences,
  getAllDogMatches,
  deactivateDogMatchPreferences,
};
