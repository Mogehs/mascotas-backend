const cloudinary = require("cloudinary").v2;

const QRCode = require("qrcode");
const QRCodeModel = require("../model/qrcode");
const Pet = require("../model/pet");
const User = require("../model/user");

const generateBulkQRCodes = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona una cantidad válida (número positivo)",
      });
    }

    if (quantity > 1000) {
      return res.status(400).json({
        success: false,
        message: "La cantidad máxima permitida es 1000",
      });
    }

    const promises = [];
    for (let i = 0; i < quantity; i++) {
      promises.push(generateSingleQRCode());
    }

    const qrCodes = await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: `Se generaron exitosamente ${quantity} códigos QR`,
      data: {
        count: qrCodes.length,
        qrCodes: qrCodes,
      },
    });
  } catch (error) {
    console.error("Error generating bulk QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al generar códigos QR",
      error: error.message,
    });
  }
};

const generateSingleQRCode = async () => {
  try {
    const qrCodeData = {
      petId: null,
      userId: null,
      isActive: true,
    };

    const savedQRCode = await QRCodeModel.create(qrCodeData);

    const redirectURL = `${"https://mactos-pet-page.vercel.app"}/qr/${
      savedQRCode._id
    }`;

    const qrCodeDataURL = await QRCode.toDataURL(redirectURL, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    });

    const updatedQRCode = await QRCodeModel.findByIdAndUpdate(
      savedQRCode._id,
      {
        url: redirectURL,
        qrCodeImage: qrCodeDataURL,
      },
      { new: true }
    );

    return {
      id: updatedQRCode._id,
      petId: updatedQRCode.petId,
      userId: updatedQRCode.userId,
      url: updatedQRCode.url,
      qrCodeImage: updatedQRCode.qrCodeImage,
      isActive: updatedQRCode.isActive,
      createdAt: updatedQRCode.createdAt,
      updatedAt: updatedQRCode.updatedAt,
    };
  } catch (error) {
    throw new Error(`Error al generar código QR: ${error.message}`);
  }
};

const generateSingleQRCodeEndpoint = async (req, res) => {
  try {
    const qrCode = await generateSingleQRCode();

    res.status(200).json({
      success: true,
      message: "Código QR generado exitosamente",
      data: qrCode,
    });
  } catch (error) {
    console.error("Error generating single QR code:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al generar código QR",
      error: error.message,
    });
  }
};

const getQRCodeInfo = async (req, res) => {
  try {
    const { qrId } = req.params;

    if (!qrId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del código QR",
      });
    }

    const qrCode = await QRCodeModel.findById(qrId).populate({
      path: "petId",
      populate: {
        path: "user",
        select: "firstname lastname email phone",
      },
    });
    console.log(qrCode);

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "Código QR no encontrado",
      });
    }

    const pet = qrCode.petId;
    const petOwner = pet ? pet.user : null;

    // Check if the pet has an active badge subscription
    const currentDate = new Date();
    const isBadgeExpired =
      pet &&
      pet.badge_subscription_end_date &&
      new Date(pet.badge_subscription_end_date) < currentDate;

    if (pet && (!pet.badge_subscription || isBadgeExpired)) {
      console.log({
        id: qrCode._id,
        url: null,
        qrCodeImage: null,
        isActive: false,
        subscriptionStatus:
          pet.badge_subscription && !isBadgeExpired ? "active" : "expired",
        isAssigned: !!pet,
        pet: null,
        owner: null,
        whatsappMessage: null,
        message:
          "Este código QR no está activo. La suscripción de la placa de la mascota ha expirado. Por favor contacta al dueño para renovar su suscripción.",
      });
      return res.status(200).json({
        success: true,
        message:
          "El código QR está actualmente inactivo debido a que la suscripción de la placa ha expirado.",
        data: {
          id: qrCode._id,
          url: null,
          qrCodeImage: null,
          isActive: false,
          subscriptionStatus: "expired",
          isAssigned: !!pet,
          pet: null,
          owner: null,
          whatsappMessage: null,
          message:
            "Este código QR no está activo. La suscripción de la placa de la mascota ha expirado. Por favor contacta al dueño para renovar su suscripción.",
        },
      });
    }

    // Check if QR code is assigned but no pet owner found (edge case)
    if (pet && !petOwner) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontró información del dueño de la mascota para este código QR.",
      });
    }

    // Build WhatsApp-style message (just text)
    let whatsappMessage = `Hola, encontré a tu mascota.`;

    if (pet) {
      whatsappMessage = `Hola, encontré a tu mascota ${pet.pet_name || ""}${
        pet.pet_color ? ", color " + pet.pet_color : ""
      }${pet.pet_race ? ", raza " + pet.pet_race : ""}. Por favor contáctame.`;
    }

    const responseData = {
      id: qrCode._id,
      url: qrCode.url,
      qrCodeImage: qrCode.qrCodeImage,
      isActive: qrCode.isActive,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
      isAssigned: !!pet,
      pet: pet || null,
      owner: petOwner || null,
      whatsappMessage,
    };

    if (!pet) {
      responseData.message =
        "El código QR no está asignado a ninguna mascota. Puedes proceder a registrar una mascota.";
    }

    res.status(200).json({
      success: true,
      message: "Información del código QR obtenida exitosamente",
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving QR code info:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener el código QR",
      error: error.message,
    });
  }
};

const assignPetToQRCode = async (req, res) => {
  try {
    const {
      user,
      pet_name,
      pet_gender,
      pet_dob,
      pet_weight,
      pet_height,
      pet_microchip_number,
      pet_race,
      pet_description,
      pet_color,
      pet,
    } = req.body;

    let { qrId } = req.query;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario",
      });
    }

    let qrCode;

    if (qrId) {
      qrCode = await QRCodeModel.findById(qrId);
      if (!qrCode) {
        return res.status(404).json({
          success: false,
          message: "Código QR no encontrado",
        });
      }

      if (qrCode.petId) {
        return res.status(400).json({
          success: false,
          message: "El código QR ya está asignado a una mascota",
        });
      }
    } else {
      qrCode = await generateSingleQRCode();
      qrId = qrCode.id;
    }

    // Handle pet image upload
    let petImageUrl = "";
    if (req.files && req.files.pet_image) {
      const file = req.files.pet_image;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "petpro_pets",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto:good" },
        ],
      });
      petImageUrl = result.secure_url;
    }

    // Create new pet
    const newPet = await Pet.create({
      user,
      pet_name,
      pet_gender,
      pet_dob,
      pet,
      pet_race,
      pet_height,
      pet_weight,
      pet_microchip_number: pet_microchip_number || "N/A",
      pet_description,
      pet_color,
      pet_image: petImageUrl || "",
    });

    // Assign pet to QR code
    const updatedQRCode = await QRCodeModel.findByIdAndUpdate(
      qrId,
      {
        petId: newPet._id,
        userId: user,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("petId userId");

    res.status(200).json({
      success: true,
      message: "Mascota creada y asignada al código QR exitosamente",
      data: {
        qrCode: updatedQRCode,
        pet: newPet,
      },
    });
  } catch (error) {
    console.error("Error assigning pet to QR code:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al asignar mascota al código QR",
      error: error.message,
    });
  }
};

const getAllQRCodes = async (req, res) => {
  try {
    const { page = 1, limit = 50, assigned } = req.query;

    let filter = {};
    if (assigned === "true") {
      filter.petId = { $ne: null };
    } else if (assigned === "false") {
      filter.petId = null;
    }

    const qrCodes = await QRCodeModel.find(filter)
      .populate("petId", "pet_name pet_gender pet_race")
      .populate("userId", "firstname lastname email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QRCodeModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Códigos QR obtenidos exitosamente",
      data: {
        qrCodes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalQRCodes: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener códigos QR",
      error: error.message,
    });
  }
};

module.exports = {
  generateBulkQRCodes,
  generateSingleQRCodeEndpoint,
  getQRCodeInfo,
  assignPetToQRCode,
  getAllQRCodes,
};
