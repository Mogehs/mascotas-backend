const express = require("express");
const router = express.Router();

const {
  businessRegister,
  uploadBusinessImage,
  uploadLatlng,
  getBusiness,
  updateBusiness,
} = require("../controller/business");

router.post("/register", businessRegister);
router.post("/image", uploadBusinessImage);
router.post("/latlng", uploadLatlng);
router.get("/", getBusiness);
router.post("/updateBusiness", updateBusiness);

module.exports = router;
