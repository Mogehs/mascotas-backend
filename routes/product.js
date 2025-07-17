const express = require("express");
const router = express.Router();
const productController = require("../controller/product");

router.post("/create", productController.createProduct);

router.get("/business/:business_id", productController.getBusinessProducts);

router.get("/search", productController.searchProducts);

router.post("/expire-featured", productController.expireFeaturedProducts);

router.get("/:product_id", productController.getProduct);

router.put("/:product_id", productController.updateProduct);

router.post("/:product_id/feature", productController.makeProductFeatured);

router.post("/:product_id/interest", productController.trackProductClick);

router.post("/:product_id/contact", productController.trackContactClick);

router.delete("/:product_id", productController.deleteProduct);

module.exports = router;
