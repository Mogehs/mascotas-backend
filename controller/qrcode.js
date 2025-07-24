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
        message: "Please provide a valid quantity (positive number)",
      });
    }

    if (quantity > 1000) {
      return res.status(400).json({
        success: false,
        message: "Maximum quantity allowed is 1000",
      });
    }

    const promises = [];
    for (let i = 0; i < quantity; i++) {
      promises.push(generateSingleQRCode());
    }

    const qrCodes = await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: `Successfully generated ${quantity} QR codes`,
      data: {
        count: qrCodes.length,
        qrCodes: qrCodes,
      },
    });
  } catch (error) {
    console.error("Error generating bulk QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating QR codes",
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
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

const generateSingleQRCodeEndpoint = async (req, res) => {
  try {
    const qrCode = await generateSingleQRCode();

    res.status(200).json({
      success: true,
      message: "QR code generated successfully",
      data: qrCode,
    });
  } catch (error) {
    console.error("Error generating single QR code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating QR code",
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
        message: "QR code ID is required",
      });
    }

    const qrCode = await QRCodeModel.findById(qrId)
      .populate({
        path: "petId",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate({
        path: "userId",
        select: "name email phone",
      });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    const pet = qrCode.petId;
    const petOwner = pet?.user || qrCode.userId;

    // Build WhatsApp-style message (just text)
    let whatsappMessage = `Hi, I found your pet.`;

    if (pet) {
      whatsappMessage = `Hi, I found your pet ${pet.pet_name || ""}${
        pet.pet_color ? ", color " + pet.pet_color : ""
      }${pet.pet_breed ? ", breed " + pet.pet_breed : ""}. Please contact me.`;
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
        "QR code is not assigned to any pet. You can proceed to register a pet.";
    }

    res.status(200).json({
      success: true,
      message: "QR code information retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving QR code info:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving QR code",
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
        message: "User ID is required",
      });
    }

    let qrCode;

    if (qrId) {
      qrCode = await QRCodeModel.findById(qrId);
      if (!qrCode) {
        return res.status(404).json({
          success: false,
          message: "QR code not found",
        });
      }

      if (qrCode.petId) {
        return res.status(400).json({
          success: false,
          message: "QR code is already assigned to a pet",
        });
      }
    } else {
      // Create new QR code if not provided
      qrCode = await QRCodeModel.create({
        userId: user,
        petId: null,
        createdAt: new Date(),
      });
      qrId = qrCode._id;
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
      message: "Pet created and assigned to QR code successfully",
      data: {
        qrCode: updatedQRCode,
        pet: newPet,
      },
    });
  } catch (error) {
    console.error("Error assigning pet to QR code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while assigning pet to QR code",
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
      message: "QR codes retrieved successfully",
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
      message: "Internal server error while retrieving QR codes",
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
