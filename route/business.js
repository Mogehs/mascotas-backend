const express = require("express");
const router = express.Router();

const {
  businessRegister,
  uploadBusinessImage,
  uploadLatlng,
  getBusiness,
  updateBusiness,
  activatePetProSubscription,
  checkSubscriptionStatus,
  renewSubscription,
  cancelSubscription,
  upgradeSubscription,
} = require("../controller/business");

const auth = require("../middleware/jwt");

// Existing routes
router.post("/register", businessRegister);
router.post("/image", uploadBusinessImage);
router.post("/latlng", uploadLatlng);
router.get("/", getBusiness);
router.post("/updateBusiness", updateBusiness);

// PetPro Subscription routes
router.post("/petpro/activate", auth, activatePetProSubscription);
router.get("/petpro/status/:business_id", auth, checkSubscriptionStatus);
router.post("/petpro/renew/:business_id", auth, renewSubscription);
router.post("/petpro/cancel/:business_id", auth, cancelSubscription);
router.post("/petpro/upgrade/:business_id", auth, upgradeSubscription);

module.exports = router;
