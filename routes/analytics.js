const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics");

// Get business analytics overview
router.get(
  "/business/:business_id/overview",
  analyticsController.getBusinessAnalytics
);

// Get product performance analytics
router.get(
  "/business/:business_id/products",

  analyticsController.getProductAnalytics
);

// Get promotion performance analytics
router.get(
  "/business/:business_id/promotions",

  analyticsController.getPromotionAnalytics
);

// Get ad performance analytics
router.get(
  "/business/:business_id/ads",

  analyticsController.getAdAnalytics
);

// Get geographic analytics
router.get(
  "/business/:business_id/geographic",

  analyticsController.getGeographicAnalytics
);

// Update business statistics (internal/cron use)
router.post("/update-statistics", analyticsController.updateBusinessStatistics);

// Get quick business statistics (cached data)
router.get(
  "/business/:business_id/quick-stats",
  analyticsController.getQuickBusinessStats
);

// Admin analytics overview
router.get("/admin/overview", analyticsController.getAdminAnalytics);

module.exports = router;
