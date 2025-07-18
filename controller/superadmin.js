const User = require("../model/user");
const Business = require("../model/business");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user is super admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all business profiles
const getAllBusinessProfiles = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user is super admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    const businesses = await Business.find({})
      .populate("id", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Business profiles fetched successfully",
      data: businesses,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Block/Unblock business profile
const toggleBusinessStatus = async (req, res) => {
  try {
    const { userId, businessId, action } = req.body;

    // Check if user is super admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    if (!businessId || !action) {
      return res.status(400).json({
        success: false,
        message: "Business ID and action are required.",
      });
    }

    if (action !== "block" && action !== "unblock") {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'block' or 'unblock'.",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found.",
      });
    }

    const isBlocked = action === "block";
    await Business.findByIdAndUpdate(businessId, { is_blocked: isBlocked });

    res.status(200).json({
      success: true,
      message: `Business profile ${action}ed successfully`,
      data: {
        businessId,
        is_blocked: isBlocked,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Block/Unblock user
const toggleUserStatus = async (req, res) => {
  try {
    const { userId, targetUserId, action } = req.body;

    // Check if user is super admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    if (!targetUserId || !action) {
      return res.status(400).json({
        success: false,
        message: "Target user ID and action are required.",
      });
    }

    if (action !== "block" && action !== "unblock") {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'block' or 'unblock'.",
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent blocking other super admins
    if (targetUser.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot block super admin users.",
      });
    }

    const isBlocked = action === "block";
    await User.findByIdAndUpdate(targetUserId, { is_blocked: isBlocked });

    res.status(200).json({
      success: true,
      message: `User ${action}ed successfully`,
      data: {
        userId: targetUserId,
        is_blocked: isBlocked,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllBusinessProfiles,
  toggleBusinessStatus,
  toggleUserStatus,
};
