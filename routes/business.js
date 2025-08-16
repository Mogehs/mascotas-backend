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
  getBusinessById,
} = require("../controller/business");

// Existing routes
router.post("/register", businessRegister);
router.post("/image", uploadBusinessImage);
router.post("/latlng", uploadLatlng);
router.get("/", getBusiness);

// Location-based routes for map functionality (must come before parameterized routes)
router.get("/map-business/nearby", getBusinessesByLocation);
router.get("/map-business/map", getBusinessesForMap);

// Parameterized routes (must come after specific routes)
router.get("/:business_id", getBusinessById);
router.get("/user/:user_id", getBusinessByUserId);
router.post("/updateBusiness", updateBusiness);

// PetPro Subscription routes
router.post("/petpro/activate", activatePetProSubscription);
router.get("/petpro/status/:business_id", checkSubscriptionStatus);
router.post("/petpro/renew/:business_id", renewSubscription);
router.post("/petpro/cancel/:business_id", cancelSubscription);
router.post("/petpro/upgrade/:business_id", upgradeSubscription);
router.post("/petpro/expire-subscriptions", expireSubscriptions);

module.exports = router;
