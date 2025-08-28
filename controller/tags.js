const Tag = require("../model/tags");
const User = require("../model/user");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Create a new tag (Admin only)
const createTag = async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    // Validate required fields
    if (!title || !description || !userId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and userId are required",
      });
    }

    // Check if icon image is uploaded
    if (!req?.files?.icon) {
      return res.status(400).json({
        success: false,
        message: "Icon image is required",
      });
    }

    // Check if tag with same title already exists
    const existingTag = await Tag.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: "Tag with this title already exists",
      });
    }

    // Upload icon to Cloudinary
    const file = req.files.icon;
    let result;
    try {
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "tags/icons",
        width: 100,
        height: 100,
        crop: "fill",
        quality: "auto",
        resource_type: "image",
      });
    } finally {
      // Always cleanup temp file
      fs.unlinkSync(file.tempFilePath);
    }

    const newTag = new Tag({
      title: title.trim(),
      description: description.trim(),
      icon: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      createdBy: userId,
    });

    const savedTag = await newTag.save();

    await savedTag.populate("createdBy", "username email");

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: savedTag,
    });
  } catch (error) {
    console.error("Error creating tag:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating tag",
      error: error.message,
    });
  }
};

// Get all tags (Public - for users to see)
const getAllTags = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    } else {
      // Default to showing only active tags for regular users
      filter.isActive = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tags = await Tag.find(filter)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tag.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Tags retrieved successfully",
      data: {
        tags,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tags",
      error: error.message,
    });
  }
};

// Get single tag by ID
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id).populate("createdBy", "username email");

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tag retrieved successfully",
      data: tag,
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tag",
      error: error.message,
    });
  }
};

// Update tag (Admin only)
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    // Check if title is being changed and if new title already exists
    if (title && title !== tag.title) {
      const existingTag = await Tag.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });

      if (existingTag) {
        return res.status(409).json({
          success: false,
          message: "Tag with this title already exists",
        });
      }
    }

    // Update fields
    if (title) tag.title = title.trim();
    if (description) tag.description = description.trim();
    if (isActive !== undefined) tag.isActive = isActive;

    // Handle icon update if new image is uploaded
    if (req?.files?.icon) {
      const file = req.files.icon;
      let result;

      try {
        // Delete old icon from Cloudinary
        if (tag.icon && tag.icon.public_id) {
          await cloudinary.uploader.destroy(tag.icon.public_id);
        }

        // Upload new icon to Cloudinary
        result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "tags/icons",
          width: 100,
          height: 100,
          crop: "fill",
          quality: "auto",
          resource_type: "image",
        });

        // Update icon in database
        tag.icon = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } catch (uploadError) {
        console.error("Error uploading new icon:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading icon image",
          error: uploadError.message,
        });
      } finally {
        // Always cleanup temp file
        fs.unlinkSync(file.tempFilePath);
      }
    }

    const updatedTag = await tag.save();
    await updatedTag.populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      data: updatedTag,
    });
  } catch (error) {
    console.error("Error updating tag:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating tag",
      error: error.message,
    });
  }
};

// Delete tag (Admin only)
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    // Delete icon from Cloudinary
    if (tag.icon && tag.icon.public_id) {
      try {
        await cloudinary.uploader.destroy(tag.icon.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting icon from Cloudinary:", cloudinaryError);
        // Continue with tag deletion even if Cloudinary deletion fails
      }
    }

    await Tag.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting tag",
      error: error.message,
    });
  }
};

// Toggle tag status (Admin only)
const toggleTagStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    tag.isActive = !tag.isActive;
    const updatedTag = await tag.save();
    await updatedTag.populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: `Tag ${
        updatedTag.isActive ? "activated" : "deactivated"
      } successfully`,
      data: updatedTag,
    });
  } catch (error) {
    console.error("Error toggling tag status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while toggling tag status",
      error: error.message,
    });
  }
};

// Get tags stats (Admin only)
const getTagsStats = async (req, res) => {
  try {
    const totalTags = await Tag.countDocuments();
    const activeTags = await Tag.countDocuments({ isActive: true });
    const inactiveTags = await Tag.countDocuments({ isActive: false });

    const recentTags = await Tag.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: "Tags statistics retrieved successfully",
      data: {
        stats: {
          total: totalTags,
          active: activeTags,
          inactive: inactiveTags,
        },
        recentTags,
      },
    });
  } catch (error) {
    console.error("Error fetching tags stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tags statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  toggleTagStatus,
  getTagsStats,
};
