const express = require("express");
const router = express.Router();

const {
  businessRegister,
  uploadBusinessImage,
  uploadLatlng,
  getBusiness,
  getBusinessByUserId,
  updateBusiness,
  activatePetProSubscription,
  checkSubscriptionStatus,
  renewSubscription,
  cancelSubscription,
  upgradeSubscription,
  expireSubscriptions,
  getBusinessesByLocation,
  getBusinessesForMap,
} = require("../controller/business");

// Existing routes
router.post("/register", businessRegister);
router.post("/image", uploadBusinessImage);
router.post("/latlng", uploadLatlng);
router.get("/", getBusiness);
router.get("/user/:user_id", getBusinessByUserId);
router.post("/updateBusiness", updateBusiness);

// Location-based routes for map functionality
router.get("/nearby", getBusinessesByLocation);
router.get("/map", getBusinessesForMap);

// PetPro Subscription routes
router.post("/petpro/activate", activatePetProSubscription);
router.get("/petpro/status/:business_id", checkSubscriptionStatus);
router.post("/petpro/renew/:business_id", renewSubscription);
router.post("/petpro/cancel/:business_id", cancelSubscription);
router.post("/petpro/upgrade/:business_id", upgradeSubscription);
router.post("/petpro/expire-subscriptions", expireSubscriptions);

module.exports = router;
