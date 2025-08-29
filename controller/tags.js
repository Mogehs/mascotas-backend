const Tag = require("../model/tags");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Helper function to parse stringified JSON data
const parseStringifiedData = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return data; // Return as is if not valid JSON
    }
  }
  return data;
};

// Create a new tag
const createTag = async (req, res) => {
  try {
    // Parse body data in case it's stringified
    const title = parseStringifiedData(req.body.title);
    const description = parseStringifiedData(req.body.description);
    const price = parseStringifiedData(req.body.price);

    // Validate required fields
    if (!title || !description || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and price are required",
      });
    }

    // Validate price
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Check if icon images are uploaded
    if (!req?.files?.icons) {
      return res.status(400).json({
        success: false,
        message: "At least one icon image is required",
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

    // Handle multiple icon files
    const iconFiles = Array.isArray(req.files.icons)
      ? req.files.icons
      : [req.files.icons];

    const uploadedIcons = [];

    // Upload all icons to Cloudinary
    for (const file of iconFiles) {
      try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "tags/icons",
          width: 300,
          height: 300,
          crop: "fit", // Maintains aspect ratio, no cropping
          quality: "auto:good", // Better quality setting
          format: "auto", // Optimal format selection
          fetch_format: "auto",
          resource_type: "image",
          flags: "preserve_transparency", // Preserve PNG transparency
        });

        uploadedIcons.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } finally {
        // Always cleanup temp file
        fs.unlinkSync(file.tempFilePath);
      }
    }

    const newTag = new Tag({
      title: title.toString().trim(),
      description: description.toString().trim(),
      price: numericPrice,
      icons: uploadedIcons,
    });

    const savedTag = await newTag.save();

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

    const tag = await Tag.findById(id);

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

// Update tag
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse body data in case it's stringified
    const title = parseStringifiedData(req.body.title);
    const description = parseStringifiedData(req.body.description);
    const price = parseStringifiedData(req.body.price);
    const isActive = parseStringifiedData(req.body.isActive);

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

    // Validate price if provided
    if (price !== undefined && price !== null) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid positive number",
        });
      }
    }

    // Update fields
    if (title) tag.title = title.toString().trim();
    if (description) tag.description = description.toString().trim();
    if (price !== undefined && price !== null) tag.price = parseFloat(price);
    if (isActive !== undefined) tag.isActive = isActive;

    // Handle icons update if new images are uploaded
    if (req?.files?.icons) {
      // Delete old icons from Cloudinary
      if (tag.icons && tag.icons.length > 0) {
        for (const icon of tag.icons) {
          if (icon.public_id) {
            try {
              await cloudinary.uploader.destroy(icon.public_id);
            } catch (error) {
              console.error("Error deleting old icon:", error);
            }
          }
        }
      }

      // Handle multiple new icon files
      const iconFiles = Array.isArray(req.files.icons)
        ? req.files.icons
        : [req.files.icons];

      const uploadedIcons = [];

      // Upload all new icons to Cloudinary
      for (const file of iconFiles) {
        try {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "tags/icons",
            width: 300,
            height: 300,
            crop: "fit", // Maintains aspect ratio, no cropping
            quality: "auto:good", // Better quality setting
            format: "auto", // Optimal format selection
            fetch_format: "auto",
            resource_type: "image",
            flags: "preserve_transparency", // Preserve PNG transparency
          });

          uploadedIcons.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
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

      // Update icons in database
      tag.icons = uploadedIcons;
    }

    const updatedTag = await tag.save();

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

// Delete tag
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

    // Delete all icons from Cloudinary
    if (tag.icons && tag.icons.length > 0) {
      for (const icon of tag.icons) {
        if (icon.public_id) {
          try {
            await cloudinary.uploader.destroy(icon.public_id);
          } catch (cloudinaryError) {
            console.error(
              "Error deleting icon from Cloudinary:",
              cloudinaryError
            );
            // Continue with tag deletion even if Cloudinary deletion fails
          }
        }
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

    const recentTags = await Tag.find().sort({ createdAt: -1 }).limit(5);

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
