const express = require("express");
const router  = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getOrderStats,
} = require("../controller/order");

// User-facing
router.post("/create",           createOrder);
router.get("/user/:user_id",     getUserOrders);

// Admin-facing
router.get("/",                  getAllOrders);       // GET /api/order?status=pending&page=1
router.get("/stats",             getOrderStats);     // GET /api/order/stats
router.get("/:id",               getOrderById);      // GET /api/order/:id
router.patch("/:id/status",      updateOrderStatus); // PATCH /api/order/:id/status

module.exports = router;
