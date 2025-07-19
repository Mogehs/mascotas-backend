const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics");

router.get(
  "/business/:business_id/overview",

  analyticsController.getBusinessAnalytics
);

router.get(
  "/business/:business_id/products",

  analyticsController.getProductAnalytics
);

router.get(
  "/business/:business_id/promotions",

  analyticsController.getPromotionAnalytics
);

router.get(
  "/business/:business_id/ads",

  analyticsController.getAdAnalytics
);

router.get(
  "/business/:business_id/geographic",

  analyticsController.getGeographicAnalytics
);

router.post("/update-statistics", analyticsController.updateBusinessStatistics);

router.get(
  "/business/:business_id/quick-stats",

  analyticsController.getQuickBusinessStats
);

router.get("/admin/overview", analyticsController.getAdminAnalytics);

module.exports = router;
