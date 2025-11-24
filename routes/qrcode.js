const express = require("express");
const router = express.Router();
const {
  generateBulkQRCodes,
  generateSingleQRCodeEndpoint,
  getQRCodeInfo,
  assignPetToQRCode,
  getAllQRCodes,
  updateQRCodeSaleInfo,
  updateQRCodeStatus,
} = require("../controller/qrcode");

router.post("/bulk", generateBulkQRCodes);

router.post("/single", generateSingleQRCodeEndpoint);

router.get("/all", getAllQRCodes);

router.get("/:qrId", getQRCodeInfo);

router.post("/assign-pet", assignPetToQRCode);

router.put("/:qrId/sale-info", updateQRCodeSaleInfo);

router.put("/:qrId/status", updateQRCodeStatus);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "QR Code service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
