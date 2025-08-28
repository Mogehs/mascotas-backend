const express = require("express");
const router = express.Router();
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  toggleTagStatus,
  getTagsStats,
} = require("../controller/tags");
const { verifyToken } = require("../middleware/jwt");

// Public routes (no authentication required)
// Users can view active tags
router.get("/", getAllTags);
router.get("/admin/stats", verifyToken, getTagsStats);
router.get("/:id", getTagById);

// Protected routes (authentication required)
// Admin routes for managing tags
router.post("/", verifyToken, createTag);
router.put("/:id", verifyToken, updateTag);
router.delete("/:id", verifyToken, deleteTag);
router.patch("/:id/toggle-status", verifyToken, toggleTagStatus);

module.exports = router;
