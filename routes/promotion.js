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

router.get("/business/:business_id", promotionController.getBusinessPromotions);

router.get("/active", promotionController.getActivePromotions);

router.get("/:promotion_id", promotionController.getPromotion);

router.put("/:promotion_id", promotionController.updatePromotion);

router.post("/:promotion_id/click", promotionController.trackPromotionClick);

router.delete("/:promotion_id", promotionController.deletePromotion);

module.exports = router;
