const express = require("express");
const router = express.Router();
const {
  adsRegister,
  findAds,
  getAd,
  trackAdClick,
  makeAdFeatured,
  updateAd,
  toggleAdStatus,
} = require("../controller/ads");
const {
  checkActiveSubscription,
  checkFeaturedAdsPermission,
} = require("../middleware/subscription");

// Existing routes
router.post("/ad-register", checkActiveSubscription, adsRegister);
router.get("/", findAds);

// New enhanced routes
router.get("/:ad_id", getAd);
router.post("/:ad_id/click", trackAdClick);
router.post(
  "/:ad_id/feature",
  checkActiveSubscription,
  checkFeaturedAdsPermission,
  makeAdFeatured
);
router.put("/:ad_id", checkActiveSubscription, updateAd);
router.post("/:ad_id/toggle-status", checkActiveSubscription, toggleAdStatus);

module.exports = router;
