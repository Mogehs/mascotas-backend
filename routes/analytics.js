const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics");
const {
  checkActiveSubscription,
  checkAnalyticsAccess,
} = require("../middleware/subscription");

// Get business analytics overview
router.get(
  "/business/:business_id/overview",
  checkActiveSubscription,
  checkAnalyticsAccess,
  analyticsController.getBusinessAnalytics
);

// Get product performance analytics
router.get(
  "/business/:business_id/products",
  checkActiveSubscription,
  checkAnalyticsAccess,
  analyticsController.getProductAnalytics
);

// Get promotion performance analytics
router.get(
  "/business/:business_id/promotions",
  checkActiveSubscription,
  checkAnalyticsAccess,
  analyticsController.getPromotionAnalytics
);

// Get ad performance analytics
router.get(
  "/business/:business_id/ads",
  checkActiveSubscription,
  checkAnalyticsAccess,
  analyticsController.getAdAnalytics
);

// Get geographic analytics
router.get(
  "/business/:business_id/geographic",
  checkActiveSubscription,
  checkAnalyticsAccess,
  analyticsController.getGeographicAnalytics
);

// Update business statistics (internal/cron use)
router.post("/update-statistics", analyticsController.updateBusinessStatistics);

// Get quick business statistics (cached data)
router.get(
  "/business/:business_id/quick-stats",
  checkActiveSubscription,
  checkAnalyticsAccess,
  analyticsController.getQuickBusinessStats
);

// Admin analytics overview
router.get("/admin/overview", analyticsController.getAdminAnalytics);

module.exports = router;
