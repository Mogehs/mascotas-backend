const Lost = require("../model/lost");
const User = require("../model/user"); // Add User model import
const {
  sendLostPetAlert,
  sendGeneralNotification,
  NOTIFICATION_TYPES,
} = require("../service/notification.service");
const { saveFile } = require("../utils/fileUpload.helper");

const lostPet = async (req, res) => {
  try {
    const {
      user,
      name,
      location,
      date,
      time,
      contact,
      details,
      latitude,
      longitude,
    } = req.body;
    if (!req?.files?.picture)
      return res.status(400).json({
        success: false,
        message: "Por favor sube la imagen de la mascota",
      });

    const file = req.files.picture;
    const uploadResult = await saveFile(file, "lost");

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: "Error uploading image",
      });
    }

    const data = await Lost.create({
      user: user,
      pet_name: name,
      location: location,
      date: date,
      time: time,
      contact: contact,
      details: details,
      pet_image: uploadResult.url,
      latitude: latitude,
      longitude: longitude,
    });

    const allUsers = await User.find({
      _id: { $ne: req.body.user },
      device_token: { $exists: true, $ne: null, $ne: "" },
    });

    const notificationPromises = allUsers.map(async (user) => {
      if (user.device_token) {
        const petData = {
          name,
          contact,
          location,
          time,
          image: uploadResult.url,
          date,
          details,
        };
        return sendLostPetAlert(user.device_token, petData, data._id);
      }
      return null;
    });

    await Promise.all(notificationPromises.filter((p) => p !== null));

    res.json({
      success: true,
      message:
        "La información de la mascota perdida se ha guardado correctamente",
      data,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const allLostPets = async (req, res) => {
  try {
    const users = await Lost.find({ user: req.body.user });
    res.status(200).json({
      success: true,
      message: "Mascotas perdidas recuperadas con éxito",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const { id } = req.body;

    await Lost.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message:
        "La información de la mascota perdida se ha eliminado de forma permanente.",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateLostPet = async (req, res) => {
  try {
    const { name, location, date, time, contact, details, id } = req.body;
    const data = await Lost.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          pet_name: name,
          location: location,
          date: date,
          time: time,
          contact: contact,
          details: details,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Se han actualizado los detalles de la mascota perdida.",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getLostPetById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lost pet by ID and populate user information
    const lostPet = await Lost.findById(id).populate(
      "user",
      "firstname lastname phone address email device_token"
    );

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Mascota perdida no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detalles de la mascota perdida obtenidos correctamente",
      data: lostPet,
    });
  } catch (error) {
    console.error("Error fetching lost pet:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Notify pet owner when someone finds their lost pet
const notifyPetOwner = async (req, res) => {
  try {
    const {
      lostPetId,
      finderName,
      finderPhone,
      finderMessage,
      foundLocation,
      foundDate,
    } = req.body;

    // Validate required fields
    if (!lostPetId || !finderName || !finderPhone) {
      return res.status(400).json({
        success: false,
        message: "Lost pet ID, finder name, and phone number are required",
      });
    }

    // Find the lost pet and populate owner information
    const lostPet = await Lost.findById(lostPetId).populate(
      "user",
      "firstname lastname device_token"
    );

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Lost pet not found",
      });
    }

    // Check if the pet owner has a device token
    if (!lostPet.user || !lostPet.user.device_token) {
      return res.status(400).json({
        success: false,
        message: "Pet owner notification not available (no device token)",
      });
    }

    // Prepare notification content
    const title = `¡Buenas noticias! Alguien encontró a ${lostPet.pet_name}`;
    const message = `${finderName} dice que encontró a tu mascota ${
      lostPet.pet_name
    }. Teléfono: ${finderPhone}${
      finderMessage ? `. Mensaje: ${finderMessage}` : ""
    }`;

    // Prepare additional data for the notification
    const extraData = {
      pet_id: lostPet._id,
      pet_name: lostPet.pet_name,
      finder_name: finderName,
      finder_phone: finderPhone,
      finder_message: finderMessage || "",
      found_location: foundLocation || "",
      found_date: foundDate || new Date().toISOString(),
      original_lost_location: lostPet.location,
      original_lost_date: lostPet.date,
    };

    // Send notification to pet owner
    await sendGeneralNotification(
      lostPet.user.device_token,
      title,
      message,
      "pet_found",
      extraData
    );

    res.status(200).json({
      success: true,
      message: "Notification sent successfully to pet owner",
      data: {
        notified_owner: `${lostPet.user.firstname} ${lostPet.user.lastname}`,
        pet_name: lostPet.pet_name,
        finder_info: {
          name: finderName,
          phone: finderPhone,
          message: finderMessage,
          found_location: foundLocation,
          found_date: foundDate,
        },
      },
    });
  } catch (error) {
    console.error("Error notifying pet owner:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notification to pet owner",
      error: error.message,
    });
  }
};

module.exports = {
  lostPet,
  allLostPets,
  deletePet,
  updateLostPet,
  getLostPetById,
  notifyPetOwner,
};
