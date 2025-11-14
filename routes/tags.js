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

// Public routes (no authentication required)
// Users can view active tags
router.get("/", getAllTags);
router.get("/admin/stats", getTagsStats);
router.get("/:id", getTagById);

// Protected routes (authentication required)
// Admin routes for managing tags
router.post("/", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);
router.patch("/:id/toggle-status", toggleTagStatus);

module.exports = router;
