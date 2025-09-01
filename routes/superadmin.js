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
  getAllPets,
  assignPetManually,
  updateSubscriptionBadge,
} = require("../controller/superadmin");

router.get("/users", getAllUsers);

router.get("/businesses", getAllBusinessProfiles);

router.post("/business/toggle-status", toggleBusinessStatus);

router.get("/user/toggle-status", toggleUserStatus);

router.post("/send-notification", sendPushNotificationToUsers);

router.post("/update_badge", updateSubscriptionBadge);

// Analytics routes
router.get("/analytics/users", getUserAnalytics);

router.get("/analytics/sales", getSalesAnalytics);

router.get("/pets", getAllPets);

router.post("/:id/assign", assignPetManually);

module.exports = router;
