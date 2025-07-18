const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllBusinessProfiles,
  toggleBusinessStatus,
  toggleUserStatus,
} = require("../controller/superadmin");

// Get all users
router.post("/users", getAllUsers);

// Get all business profiles
router.post("/businesses", getAllBusinessProfiles);

// Block/Unblock business profile
router.post("/business/toggle-status", toggleBusinessStatus);

// Block/Unblock user
router.post("/user/toggle-status", toggleUserStatus);

module.exports = router;
