const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion");
const auth = require("../middleware/jwt");
const upload = require("../config/multer");

// Create promotion
router.post(
  "/create",
  auth,
  upload.single("banner_image"),
  promotionController.createPromotion
);

// Get all promotions for a business
router.get("/business/:business_id", promotionController.getBusinessPromotions);

// Get active promotions for customers
router.get("/active", promotionController.getActivePromotions);

// Get single promotion with view tracking
router.get("/:promotion_id", promotionController.getPromotion);

// Validate promo code
router.post("/validate-code", promotionController.validatePromoCode);

// Apply promo code (after successful order)
router.post("/apply-code", promotionController.applyPromoCode);

// Update promotion
router.put(
  "/:promotion_id",
  auth,
  upload.single("banner_image"),
  promotionController.updatePromotion
);

// Track promotion click
router.post("/:promotion_id/click", promotionController.trackPromotionClick);

// Delete promotion (deactivate)
router.delete("/:promotion_id", auth, promotionController.deletePromotion);

module.exports = router;
