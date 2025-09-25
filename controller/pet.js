const Pet = require("../model/pet");
const fs = require("fs");
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

// Helper function to parse form data into proper objects
const parseFormData = (body) => {
  const parsed = { ...body };

  // Parse coordinates if they exist as separate fields
  if (body["coordinates[latitude]"] && body["coordinates[longitude]"]) {
    parsed.coordinates = {
      latitude: parseFloat(body["coordinates[latitude]"]),
      longitude: parseFloat(body["coordinates[longitude]"]),
    };
    // Remove the individual coordinate fields
    delete parsed["coordinates[latitude]"];
    delete parsed["coordinates[longitude]"];
  } else if (typeof body.coordinates === "string") {
    try {
      parsed.coordinates = JSON.parse(body.coordinates);
    } catch (e) {
      console.warn("Failed to parse coordinates string:", e);
    }
  }

  // Parse temperament array if it comes as string or individual fields
  if (typeof body.temperament === "string") {
    try {
      parsed.temperament = JSON.parse(body.temperament);
    } catch (e) {
      // If it's a single value string, make it an array
      parsed.temperament = [body.temperament];
    }
  } else if (Array.isArray(body.temperament)) {
    parsed.temperament = body.temperament;
  }

  // Parse time array if it comes as string or individual fields
  if (typeof body.time === "string") {
    try {
      parsed.time = JSON.parse(body.time);
    } catch (e) {
      // If it's a single value string, make it an array
      parsed.time = [body.time];
    }
  } else if (Array.isArray(body.time)) {
    parsed.time = body.time;
  }

  // Parse searchRadius as number
  if (body.searchRadius && typeof body.searchRadius === "string") {
    parsed.searchRadius = parseFloat(body.searchRadius) || 10;
  }

  return parsed;
};

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const get_pet = async (req, res) => {
  try {
    const { user } = req.body;
    let pets = await Pet.find({ user: user }).populate(
      "user",
      "firstname lastname phone address"
    );

    // Convert pets to plain objects and add QR code data and dog match preferences
    const petsWithAllData = await Promise.all(
      pets.map(async (pet) => {
        const petObj = pet.toObject();

        // Get QR code data
        const qrCode = await QRCode.findOne({ petId: pet._id });
        petObj.qrCode = qrCode ? qrCode.toObject() : null;

        // Get dog match preferences
        const dogMatchPreferences = await DogMatch.findOne({
          pet: pet._id,
          isActive: true,
        });
        petObj.dogMatchPreferences = dogMatchPreferences
          ? dogMatchPreferences.toObject()
          : null;

        return petObj;
      })
    );

    res.json({
      success: true,
      message: "Información de la mascota obtenida correctamente",
      pets_list: petsWithAllData,
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

    // Get QR code data
    const petQr = await QRCode.findOne({ petId: petId });

    // Get dog match preferences
    const dogMatchPreferences = await DogMatch.findOne({
      pet: petId,
      isActive: true,
    });

    // Convert Mongoose document to a plain JavaScript object
    const petData = data.toObject();

    // Add QR code data and dog match preferences to the response
    petData.qrCode = petQr ? petQr.toObject() : null;
    petData.dogMatchPreferences = dogMatchPreferences
      ? dogMatchPreferences.toObject()
      : null;

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
    // Parse form data to handle nested objects and arrays
    const parsedBody = parseFormData(req.body);

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
      // Dog match preferences (optional)
      neutered,
      temperament,
      socialize,
      time,
      location,
      size,
      age,
      coordinates,
      searchRadius = 10,
    } = parsedBody;

    console.log("Parsed body:", parsedBody);

    // ✅ Validate required fields
    if (!user || !name || !gender || !dob || !pet) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    if (!req?.files?.picture) {
      return res.status(400).json({
        success: false,
        message: "Please upload a pet image.",
      });
    }

    // ✅ Upload image to Cloudinary
    const file = req.files.picture;
    let result;
    try {
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${Date.now()}_${file.name}`,
        resource_type: "image",
        folder: "mascotas",
      });
    } finally {
      // ✅ Always cleanup temp file
      fs.unlinkSync(file.tempFilePath);
    }

    // ✅ Create pet in DB
    const data = await Pet.create({
      user,
      pet_name: name,
      pet_gender: gender,
      pet_dob: dob,
      pet,
      pet_race: race,
      pet_height: height,
      pet_weight: weight,
      pet_microchip_number: microchip_number,
      pet_description: description,
      pet_color: color,
      pet_image: result.secure_url,
    });

    // ✅ Create dog match preferences if provided
    let dogMatchPreferences = null;
    let notificationResults = [];

    if (
      neutered &&
      temperament &&
      socialize &&
      time &&
      location &&
      size &&
      age &&
      coordinates
    ) {
      try {
        // Validate coordinates
        if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
          console.warn(
            "Invalid coordinates provided for dog match preferences"
          );
        } else {
          // Create dog match preferences
          dogMatchPreferences = await DogMatch.create({
            user,
            pet: data._id,
            neutered,
            temperament,
            socialize,
            time,
            location,
            size,
            age,
            coordinates,
            searchRadius,
            isActive: true,
          });

          // Populate the created preferences
          dogMatchPreferences = await DogMatch.findById(dogMatchPreferences._id)
            .populate("user", "firstname lastname phone address")
            .populate(
              "pet",
              "pet_name pet_gender pet_color pet_image pet_race"
            );

          // Find matching users for notifications
          const matchingUsers = await findMatchingUsersForNotification(
            dogMatchPreferences
          );

          // Send notifications to matching users
          if (matchingUsers.length > 0) {
            try {
              notificationResults = await sendDogMatchNotificationsToUsers(
                matchingUsers,
                dogMatchPreferences,
                true // isNewPreferences
              );
              console.log(
                `Sent ${notificationResults.length} notifications for new dog match preferences`
              );
            } catch (notificationError) {
              console.error(
                "Error sending dog match notifications:",
                notificationError.message
              );
            }
          }
        }
      } catch (dogMatchError) {
        console.error(
          "Error creating dog match preferences:",
          dogMatchError.message
        );
        // Don't fail the pet creation if dog match fails
      }
    }

    const responseData = {
      success: true,
      message: "La información de la mascota se guardó correctamente",
      data,
    };

    // Add dog match info to response if created
    if (dogMatchPreferences) {
      responseData.dogMatchPreferences = dogMatchPreferences;
      responseData.matchingUsers = notificationResults.length;
      responseData.notificationsSent = notificationResults.length;
    }

    return res.status(201).json(responseData);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error en el servidor." });
  }
};

const update_pet = async (req, res) => {
  try {
    // Parse form data to handle nested objects and arrays
    const parsedBody = parseFormData(req.body);

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
      // Dog match preferences (optional)
      neutered,
      temperament,
      socialize,
      time,
      location,
      size,
      age,
      coordinates,
      searchRadius = 10,
    } = parsedBody;

    console.log("Parsed body for update:", parsedBody);

    // ✅ Check if pet exists
    const existingPet = await Pet.findById(id);
    if (!existingPet) {
      return res
        .status(404)
        .json({ success: false, message: "Mascota no encontrada" });
    }

    // ✅ Prepare update data (using undefined check, not falsy check)
    const updateData = {
      pet_name: name !== undefined ? name : existingPet.pet_name,
      pet_gender: gender !== undefined ? gender : existingPet.pet_gender,
      pet_dob: dob !== undefined ? dob : existingPet.pet_dob,
      pet: pet !== undefined ? pet : existingPet.pet,
      pet_race: race !== undefined ? race : existingPet.pet_race,
      pet_height: height !== undefined ? height : existingPet.pet_height,
      pet_weight: weight !== undefined ? weight : existingPet.pet_weight,
      pet_microchip_number:
        microchip_number !== undefined
          ? microchip_number
          : existingPet.pet_microchip_number,
      pet_description:
        description !== undefined ? description : existingPet.pet_description,
      pet_color: color !== undefined ? color : existingPet.pet_color,

      // ✅ keep user reference
      user: existingPet.user,
    };

    // ✅ Handle new image if provided
    if (req?.files?.picture) {
      const file = req.files.picture;
      let result;
      try {
        result = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: `${Date.now()}_${file.name}`,
          resource_type: "image",
          folder: "mascotas",
        });
      } finally {
        fs.unlinkSync(file.tempFilePath);
      }

      if (result) {
        updateData.pet_image = result.secure_url;

        // ✅ (Optional) Delete old image from Cloudinary
        // if (existingPet.pet_image) {
        //   const publicId = existingPet.pet_image.split("/").pop().split(".")[0];
        //   await cloudinary.uploader.destroy(`mascotas/${publicId}`);
        // }
      }
    }

    // ✅ Update pet
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("user", "firstname lastname phone address");

    // ✅ Update dog match preferences if provided
    let dogMatchPreferences = null;
    let notificationResults = [];

    if (
      neutered &&
      temperament &&
      socialize &&
      time &&
      location &&
      size &&
      age &&
      coordinates
    ) {
      try {
        // Validate coordinates
        if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
          console.warn(
            "Invalid coordinates provided for dog match preferences"
          );
        } else {
          // Check if user already has preferences for this pet
          const existingPreferences = await DogMatch.findOne({
            user: existingPet.user,
            pet: id,
          });

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
              existingPreferences.age !== age ||
              existingPreferences.coordinates.latitude !==
                coordinates.latitude ||
              existingPreferences.coordinates.longitude !==
                coordinates.longitude ||
              existingPreferences.searchRadius !== searchRadius;

            if (hasChanged) {
              isPreferencesChanged = true;
            }

            // Update existing preferences
            dogMatchPreferences = await DogMatch.findByIdAndUpdate(
              existingPreferences._id,
              {
                neutered,
                temperament,
                socialize,
                time,
                location,
                size,
                age,
                coordinates,
                searchRadius,
                isActive: true,
              },
              { new: true }
            )
              .populate("user", "firstname lastname phone address")
              .populate(
                "pet",
                "pet_name pet_gender pet_color pet_image pet_race"
              );
          } else {
            // Create new preferences
            isNewPreferences = true;
            const newPreferences = await DogMatch.create({
              user: existingPet.user,
              pet: id,
              neutered,
              temperament,
              socialize,
              time,
              location,
              size,
              age,
              coordinates,
              searchRadius,
            });

            dogMatchPreferences = await DogMatch.findById(newPreferences._id)
              .populate("user", "firstname lastname phone address")
              .populate(
                "pet",
                "pet_name pet_gender pet_color pet_image pet_race"
              );
          }

          // Find matching users for notifications
          const matchingUsers = await findMatchingUsersForNotification(
            dogMatchPreferences
          );

          const shouldSendNotifications =
            isNewPreferences || isPreferencesChanged;

          // Send notifications if needed
          if (shouldSendNotifications && matchingUsers.length > 0) {
            try {
              notificationResults = await sendDogMatchNotificationsToUsers(
                matchingUsers,
                dogMatchPreferences,
                isNewPreferences
              );
              console.log(
                `Sent ${notificationResults.length} notifications for updated dog match preferences`
              );
            } catch (notificationError) {
              console.error(
                "Error sending dog match notifications:",
                notificationError.message
              );
            }
          }
        }
      } catch (dogMatchError) {
        console.error(
          "Error updating dog match preferences:",
          dogMatchError.message
        );
        // Don't fail the pet update if dog match fails
      }
    }

    const responseData = {
      success: true,
      message: "La información de la mascota se actualizó correctamente",
      data: updatedPet,
    };

    // Add dog match info to response if updated
    if (dogMatchPreferences) {
      responseData.dogMatchPreferences = dogMatchPreferences;
      responseData.matchingUsers = notificationResults.length;
      responseData.notificationsSent = notificationResults.length;
    }

    return res.json(responseData);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error en el servidor." });
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
    const petId = req.body.id;

    // ✅ Delete the pet
    const pet = await Pet.findByIdAndDelete({ _id: petId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Mascota no encontrada.",
      });
    }

    // ✅ Delete associated dog match preferences
    try {
      const deletedDogMatch = await DogMatch.findOneAndDelete({ pet: petId });
      if (deletedDogMatch) {
        console.log(`Deleted dog match preferences for pet ${petId}`);
      }
    } catch (dogMatchError) {
      console.error(
        "Error deleting dog match preferences:",
        dogMatchError.message
      );
      // Don't fail the pet deletion if dog match deletion fails
    }

    // ✅ Delete associated QR codes
    try {
      const deletedQRCode = await QRCode.findOneAndDelete({ petId: petId });
      if (deletedQRCode) {
        console.log(`Deleted QR code for pet ${petId}`);
      }
    } catch (qrError) {
      console.error("Error deleting QR code:", qrError.message);
      // Don't fail the pet deletion if QR deletion fails
    }

    // ✅ Delete associated lost pet records
    try {
      const deletedLostRecords = await Lost.deleteMany({ pet: petId });
      if (deletedLostRecords.deletedCount > 0) {
        console.log(
          `Deleted ${deletedLostRecords.deletedCount} lost pet records for pet ${petId}`
        );
      }
    } catch (lostError) {
      console.error("Error deleting lost pet records:", lostError.message);
      // Don't fail the pet deletion if lost records deletion fails
    }

    res.status(200).json({
      success: true,
      message: "La mascota y todos sus datos asociados han sido eliminados.",
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// New API: Create or update dog match preferences
const createDogMatchPreferences = async (req, res) => {
  try {
    // Parse form data to handle nested objects and arrays
    const parsedBody = parseFormData(req.body);

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
      coordinates,
      searchRadius = 10, // Default radius in kilometers
    } = parsedBody;

    console.log("Parsed body for dog match preferences:", parsedBody);

    // Validate coordinates
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: "Coordinates (latitude and longitude) are required",
      });
    }

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
        existingPreferences.age !== age ||
        existingPreferences.coordinates.latitude !== coordinates.latitude ||
        existingPreferences.coordinates.longitude !== coordinates.longitude ||
        existingPreferences.searchRadius !== searchRadius;

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
          coordinates,
          searchRadius,
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
        coordinates,
        searchRadius,
      });

      preferencesData = await DogMatch.findById(newPreferences._id)
        .populate("user", "firstname lastname phone address")
        .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");
    }

    // Find other users with matching preferences (for notifications)
    const matchingUsers = await findMatchingUsersForNotification(
      preferencesData
    );

    // const shouldSendNotifications = isNewPreferences || isPreferencesChanged;
    const shouldSendNotifications = true;

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

// New API: Get dog match preferences by pet ID
const getDogMatchPreferences = async (req, res) => {
  try {
    const { petId } = req.body;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required",
      });
    }

    const preferences = await DogMatch.findOne({
      pet: petId,
      isActive: true,
    })
      .populate("user", "firstname lastname phone address")
      .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontraron preferencias de dog match para esta mascota",
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

function calculateMatchPercentage(userPref, otherPref) {
  let total = 0;
  let matched = 0;

  // Compare neutered
  total++;
  if (userPref.neutered === otherPref.neutered) matched++;

  // Compare temperament (arrays - count overlap)
  total++;
  const temperamentOverlap = userPref.temperament.filter((val) =>
    otherPref.temperament.includes(val)
  ).length;
  if (temperamentOverlap > 0) matched++;

  // Compare socialize
  total++;
  if (userPref.socialize === otherPref.socialize) matched++;

  // Compare time (arrays)
  total++;
  const timeOverlap = userPref.time.filter((val) =>
    otherPref.time.includes(val)
  ).length;
  if (timeOverlap > 0) matched++;

  // Compare location
  total++;
  if (userPref.location === otherPref.location) matched++;

  // Compare size
  total++;
  if (userPref.size === otherPref.size) matched++;

  // Compare age
  total++;
  if (userPref.age === otherPref.age) matched++;

  return Math.round((matched / total) * 100);
}

// New API: Get matched dogs based on pet's preferences
const getAllDogMatches = async (req, res) => {
  try {
    const { petId, userId, coordinates, radius = 10 } = req.body;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "petId is required in request body",
      });
    }

    // Validate coordinates from request
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message:
          "Coordinates (latitude and longitude) are required in request body",
      });
    }

    // Get this pet's preference for matching comparison
    const petPreference = await DogMatch.findOne({
      pet: petId,
      isActive: true,
    });

    if (!petPreference) {
      return res.status(404).json({
        success: false,
        message:
          "No preferences found for this pet. Please create preferences first.",
      });
    }

    // Get pet's coordinates and search radius from request
    const petLat = coordinates.latitude;
    const petLon = coordinates.longitude;
    const searchRadius = radius;

    // Get all preferences (excluding this pet's preferences)
    const allPreferences = await DogMatch.find({
      pet: { $ne: petId },
      user: { $ne: userId },
      isActive: true,
    })
      .populate("user", "firstname lastname phone address")
      .populate("pet", "pet_name pet_gender pet_color pet_image pet_race");

    if (!allPreferences || allPreferences.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay preferencias de dog match guardadas",
      });
    }

    // Filter by distance and calculate match percentage
    const preferencesWithMatchAndDistance = allPreferences
      .map((pref) => {
        // Check if preference has coordinates
        if (
          !pref.coordinates ||
          !pref.coordinates.latitude ||
          !pref.coordinates.longitude
        ) {
          return null; // Skip preferences without coordinates
        }

        // Calculate distance
        const distance = calculateDistance(
          petLat,
          petLon,
          pref.coordinates.latitude,
          pref.coordinates.longitude
        );

        // Only include if within search radius
        if (distance <= searchRadius) {
          const matchPercentage = calculateMatchPercentage(petPreference, pref);

          console.log(
            `Preference ${pref._id}: matchPercentage = ${matchPercentage}%`
          );

          // Only include if match percentage is greater than 0
          if (matchPercentage > 0) {
            return {
              ...pref.toObject(),
              matchPercentage,
              distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            };
          }
        }
        return null;
      })
      .filter((pref) => pref !== null); // Remove null entries

    // Sort by match percentage (highest first), then by distance (closest first)
    preferencesWithMatchAndDistance.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.distance - b.distance;
    });

    console.log(
      `Final filtered results: ${preferencesWithMatchAndDistance.length} matches`
    );
    console.log(`About to return petCoordinates: lat=${petLat}, lon=${petLon}`);

    return res.status(200).json({
      success: true,
      message:
        preferencesWithMatchAndDistance.length > 0
          ? `Se encontraron ${preferencesWithMatchAndDistance.length} preferencias de dog match dentro de ${searchRadius}km (ordenadas por similitud y distancia)`
          : `No se encontraron preferencias de dog match compatibles dentro de ${searchRadius}km`,
      preferences: preferencesWithMatchAndDistance,
      count: preferencesWithMatchAndDistance.length,
      searchRadius,
      petCoordinates: {
        latitude: petLat,
        longitude: petLon,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const findMatchingUsersForNotification = async (newUserPreferences) => {
  try {
    // Get all other active preferences
    const allOtherPreferences = await DogMatch.find({
      user: { $ne: newUserPreferences.user },
      isActive: true,
    }).populate("user", "device_token");

    // Filter by distance and matching criteria
    const matchingUsers = allOtherPreferences.filter((pref) => {
      // Calculate distance between users
      const distance = calculateDistance(
        newUserPreferences.coordinates.latitude,
        newUserPreferences.coordinates.longitude,
        pref.coordinates.latitude,
        pref.coordinates.longitude
      );

      // Check if within both users' search radius
      const withinNewUserRadius = distance <= newUserPreferences.searchRadius;
      const withinOtherUserRadius = distance <= pref.searchRadius;

      if (!withinNewUserRadius || !withinOtherUserRadius) {
        return false;
      }

      // Calculate match percentage
      const matchPercentage = calculateMatchPercentage(
        newUserPreferences,
        pref
      );

      // Only include if match percentage is exactly 100
      return matchPercentage === 100;
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
