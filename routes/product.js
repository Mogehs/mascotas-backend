const express = require("express");
const router = express.Router();
const productController = require("../controller/product");
const {
  checkActiveSubscription,
  checkProductsPermission,
} = require("../middleware/subscription");

router.post(
  "/create",
  checkActiveSubscription,
  checkProductsPermission,
  productController.createProduct
);

router.get("/business/:business_id", productController.getBusinessProducts);

router.get("/search", productController.searchProducts);

router.post("/expire-featured", productController.expireFeaturedProducts);

router.get("/:product_id", productController.getProduct);

router.put(
  "/:product_id",
  checkActiveSubscription,
  checkProductsPermission,
  productController.updateProduct
);

router.post(
  "/:product_id/feature",
  checkActiveSubscription,
  checkProductsPermission,
  productController.makeProductFeatured
);

router.post("/:product_id/interest", productController.trackProductClick);

router.post("/:product_id/contact", productController.trackContactClick);

router.delete(
  "/:product_id",
  checkActiveSubscription,
  checkProductsPermission,
  productController.deleteProduct
);

module.exports = router;
