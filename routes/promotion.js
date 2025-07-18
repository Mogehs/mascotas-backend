const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion");
const {
  checkActiveSubscription,
  checkPromotionsPermission,
} = require("../middleware/subscription");

// Create promotion
router.post(
  "/create",
  checkActiveSubscription,
  checkPromotionsPermission,
  promotionController.createPromotion
);

// Get all promotions for a business
router.get("/business/:business_id", promotionController.getBusinessPromotions);

// Get active promotions for customers
router.get("/active", promotionController.getActivePromotions);

// Get single promotion with view tracking
router.get("/:promotion_id", promotionController.getPromotion);

// Update promotion
router.put(
  "/:promotion_id",
  checkActiveSubscription,
  checkPromotionsPermission,
  promotionController.updatePromotion
);

// Track promotion click
router.post("/:promotion_id/click", promotionController.trackPromotionClick);

// Delete promotion (deactivate)
router.delete(
  "/:promotion_id",
  checkActiveSubscription,
  checkPromotionsPermission,
  promotionController.deletePromotion
);

module.exports = router;
