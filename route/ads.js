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
const auth = require("../middleware/jwt");

// Existing routes
router.post("/ad-register", adsRegister);
router.get("/", findAds);

// New enhanced routes
router.get("/:ad_id", getAd);
router.post("/:ad_id/click", trackAdClick);
router.post("/:ad_id/feature", auth, makeAdFeatured);
router.put("/:ad_id", auth, updateAd);
router.post("/:ad_id/toggle-status", auth, toggleAdStatus);

module.exports = router;
