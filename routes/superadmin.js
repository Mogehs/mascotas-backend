const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllBusinessProfiles,
  toggleBusinessStatus,
  toggleUserStatus,
  sendPushNotificationToUsers,
  getUserAnalytics,
  getSalesAnalytics,
} = require("../controller/superadmin");

router.post("/users", getAllUsers);

router.post("/businesses", getAllBusinessProfiles);

router.post("/business/toggle-status", toggleBusinessStatus);

router.post("/user/toggle-status", toggleUserStatus);

router.post("/send-notification", sendPushNotificationToUsers);

// Analytics routes
router.post("/analytics/users", getUserAnalytics);

router.post("/analytics/sales", getSalesAnalytics);

module.exports = router;
