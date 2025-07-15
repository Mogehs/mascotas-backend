const express = require("express");
const router = express.Router();
const productController = require("../controller/product");
const auth = require("../middleware/jwt");
const upload = require("../config/multer");

// Create product showcase (multiple images)
router.post(
  "/create",
  auth,
  upload.array("images", 5),
  productController.createProduct
);

// Get all products for a business
router.get("/business/:business_id", productController.getBusinessProducts);

// Search products (with active subscription filter)
router.get("/search", productController.searchProducts);

// Get single product with view tracking
router.get("/:product_id", productController.getProduct);

// Update product
router.put(
  "/:product_id",
  auth,
  upload.array("images", 5),
  productController.updateProduct
);

// Make product featured
router.post(
  "/:product_id/feature",
  auth,
  productController.makeProductFeatured
);

// Track product interest (general click)
router.post("/:product_id/interest", productController.trackProductClick);

// Track contact interaction (phone/email click)
router.post("/:product_id/contact", productController.trackContactClick);

// Delete product (soft delete)
router.delete("/:product_id", auth, productController.deleteProduct);

module.exports = router;
