const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics");
const auth = require("../middleware/jwt");

// Get business analytics overview
router.get(
  "/business/:business_id/overview",
  auth,
  analyticsController.getBusinessAnalytics
);

// Get product performance analytics
router.get(
  "/business/:business_id/products",
  auth,
  analyticsController.getProductAnalytics
);

// Get promotion performance analytics
router.get(
  "/business/:business_id/promotions",
  auth,
  analyticsController.getPromotionAnalytics
);

// Get ad performance analytics
router.get(
  "/business/:business_id/ads",
  auth,
  analyticsController.getAdAnalytics
);

// Get geographic analytics
router.get(
  "/business/:business_id/geographic",
  auth,
  analyticsController.getGeographicAnalytics
);

// Update business statistics (internal/cron use)
router.post("/update-statistics", analyticsController.updateBusinessStatistics);

module.exports = router;
