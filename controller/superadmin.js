const User = require("../model/user");
const Business = require("../model/business");
const Order = require("../model/order");
const QRCode = require("../model/qrcode");
const Pet = require("../model/pet");
const Ads = require("../model/ads");
const Product = require("../model/product");
const Promotion = require("../model/promotion");
const Lost = require("../model/lost");
const MedicalHistory = require("../model/medicalhistory");
const Message = require("../model/message");
const Analytics = require("../model/analytics");
const DogMatch = require("../model/dogmatch");
const {
  sendGeneralNotification,
  NOTIFICATION_TYPES,
} = require("../service/notification.service");

// Get all users with detailed analytics
const getAllUsers = async (req, res) => {
  try {
    // Get users with their orders and QR codes (no admin validation needed)
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    // Enrich user data with subscription and order information
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get user's orders
        const orders = await Order.find({ user: user._id });

        // Get user's QR codes (tags)
        const qrCodes = await QRCode.find({ userId: user._id });

        // Get user's business profile if they have one
        const businessProfile = await Business.findOne({ id: user._id });

        return {
          ...user.toObject(),
          analytics: {
            totalOrders: orders.length,
            totalSpent: orders.reduce(
              (sum, order) => sum + parseFloat(order.amount || 0),
              0
            ),
            totalQRCodes: qrCodes.length,
            activeQRCodes: qrCodes.filter((qr) => qr.isActive).length,
            hasBusiness: !!businessProfile,
            businessSubscription: businessProfile?.petpro_subscription || null,
            registrationDate: user.createdAt,
            lastActivity: user.updatedAt,
            subscriptions: {
              business: user.business_subscription,
              badge: user.badge_subscription,
              badgeName: user.badge_name,
            },
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Users with analytics fetched successfully",
      data: enrichedUsers,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all business profiles
const getAllBusinessProfiles = async (req, res) => {
  try {
    // Get all business profiles (no admin validation needed)
    const businesses = await Business.find({})
      .populate("id")
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
    const { businessId, action } = req.body;

    // Validate required parameters
    if (!businessId || !action) {
      return res.status(400).json({
        success: false,
        message: "Business ID and action are required",
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
    const { targetUserId, action } = req.query;

    // Validate required parameters
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

// Send push notification to all users
const sendPushNotificationToUsers = async (req, res) => {
  try {
    const { title, message, notificationType, extraData } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    let results = [];

    // Get all users with device tokens (excluding blocked users and super admins)
    const targetUsers = await User.find({
      device_token: { $exists: true, $ne: null, $ne: "" },
      is_blocked: { $ne: true },
      role: { $ne: "super_admin" },
    });

    console.log(`Found ${targetUsers.length} users to send notifications to`);

    if (targetUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users available to send notifications to.",
        data: {
          totalTargeted: 0,
          sentCount: 0,
          failedCount: 0,
          results: [],
        },
      });
    }

    // Validate notification type or use default admin notification
    const validNotificationType = Object.values(NOTIFICATION_TYPES).includes(
      notificationType
    )
      ? notificationType
      : NOTIFICATION_TYPES.ADMIN_NOTIFICATION;

    // Send notifications to all users
    for (const user of targetUsers) {
      try {
        await sendGeneralNotification(
          user.device_token,
          title,
          message,
          validNotificationType,
          {
            ...extraData,
            admin_broadcast: true,
            target_audience: "all_users",
            sent_by: "super_admin",
          }
        );
        sentCount++;
        results.push({
          userId: user._id,
          username: user.username || user.firstname || user.email,
          status: "sent",
        });
      } catch (error) {
        console.error(
          `Failed to send notification to user ${user._id}:`,
          error.message
        );
        failedCount++;
        results.push({
          userId: user._id,
          username: user.username || user.firstname || user.email,
          status: "failed",
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Notification broadcast completed! ${sentCount} delivered successfully, ${failedCount} failed.`,
      data: {
        totalTargeted: targetUsers.length,
        sentCount,
        failedCount,
        notificationType: validNotificationType,
        results: results,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get user registration and subscription analytics
const getUserAnalytics = async (req, res) => {
  try {
    // Get total users count (no admin validation needed)
    const totalUsers = await User.countDocuments();

    // Get users with business subscription
    const businessSubscriptions = await User.countDocuments({
      business_subscription: true,
    });

    // Get users with badge subscription
    const badgeSubscriptions = await User.countDocuments({
      badge_subscription: true,
    });

    // Get registrations by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Get active users (logged in recently)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo },
      is_blocked: { $ne: true },
    });

    res.status(200).json({
      success: true,
      message: "User analytics fetched successfully",
      data: {
        totalUsers,
        activeUsers,
        subscriptions: {
          business: businessSubscriptions,
          badge: badgeSubscriptions,
          total: businessSubscriptions + badgeSubscriptions,
        },
        monthlyRegistrations,
        userGrowth: {
          totalUsers,
          activeUsersLast30Days: activeUsers,
          subscriptionRate:
            (
              ((businessSubscriptions + badgeSubscriptions) / totalUsers) *
              100
            ).toFixed(2) + "%",
        },
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales analytics (tags, PetPro subscriptions, orders)
const getSalesAnalytics = async (req, res) => {
  try {
    // Get QR Code (Tags) statistics (no admin validation needed)
    const totalQRCodes = await QRCode.countDocuments();
    const activeQRCodes = await QRCode.countDocuments({ isActive: true });

    // Get QR codes created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentQRCodes = await QRCode.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get PetPro subscription statistics
    const totalBusinesses = await Business.countDocuments();
    const activeSubscriptions = await Business.countDocuments({
      "petpro_subscription.is_active": true,
    });
    const paidSubscriptions = await Business.countDocuments({
      "petpro_subscription.payment_status": "paid",
    });

    // Get subscription revenue
    const subscriptionRevenue = await Business.aggregate([
      {
        $match: {
          "petpro_subscription.payment_status": "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$petpro_subscription.amount_paid" },
        },
      },
    ]);

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const orderRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]);

    // Get monthly sales data
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: { $toDouble: "$amount" } },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Sales analytics fetched successfully",
      data: {
        qrCodes: {
          total: totalQRCodes,
          active: activeQRCodes,
          recentlyCreated: recentQRCodes,
          activationRate:
            ((activeQRCodes / totalQRCodes) * 100).toFixed(2) + "%",
        },
        petProSubscriptions: {
          totalBusinesses,
          activeSubscriptions,
          paidSubscriptions,
          conversionRate:
            ((paidSubscriptions / totalBusinesses) * 100).toFixed(2) + "%",
          subscriptionRevenue: subscriptionRevenue[0]?.totalRevenue || 0,
        },
        orders: {
          totalOrders,
          orderRevenue: orderRevenue[0]?.totalRevenue || 0,
          averageOrderValue:
            totalOrders > 0
              ? ((orderRevenue[0]?.totalRevenue || 0) / totalOrders).toFixed(2)
              : 0,
        },
        monthlySales,
        totalRevenue:
          (subscriptionRevenue[0]?.totalRevenue || 0) +
          (orderRevenue[0]?.totalRevenue || 0),
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({})
      .populate("user", "_id firstname lastname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Pets fetched successfully",
      data: pets,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const assignPetManually = async (req, res) => {
  const { id } = req.params;
  const { userId, petId } = req.body;

  try {
    const qrCode = await QRCode.findById(id);
    if (!qrCode) {
      return res
        .status(404)
        .json({ success: false, message: "QR Code not found" });
    }
    if (qrCode.userId) {
      return res.status(400).json({
        success: false,
        message: "QR Code is already assigned to a user",
      });
    }
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    qrCode.userId = userId;
    qrCode.petId = petId;
    await qrCode.save();

    res.status(200).json({
      success: true,
      message: "Pet assigned successfully",
      data: qrCode,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateSubscriptionBadge = async (req, res) => {
  const { userId, isActive, badgeName } = req.body;

  // Basic validation
  if (!userId || typeof isActive === "undefined") {
    return res.status(400).json({
      success: false,
      message: "userId and isActive are required in the request body",
    });
  }

  // Normalize isActive to boolean (accepts string 'true'/'false')
  const isActiveBool =
    isActive === true ||
    isActive === "true" ||
    isActive === 1 ||
    isActive === "1";

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update fields
    user.badge_subscription = !!isActiveBool;
    if (user.badge_subscription) {
      if (typeof badgeName !== "undefined") user.badge_name = badgeName;
    } else {
      // If deactivating, clear badge name
      user.badge_name = null;
    }

    await user.save();

    // Optional: send notification to user about the change
    if (user.device_token) {
      try {
        await sendGeneralNotification(
          user.device_token,
          "Badge subscription updated",
          `Your badge subscription has been ${
            user.badge_subscription ? "activated" : "deactivated"
          }.`,
          NOTIFICATION_TYPES.ADMIN_NOTIFICATION,
          {
            badge_subscription: user.badge_subscription,
            badge_name: user.badge_name,
          }
        );
      } catch (notifyErr) {
        console.error(
          "Failed to notify user about badge update:",
          notifyErr.message
        );
        // don't fail the whole operation if notification fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: user,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle business PetPro subscription (activate/deactivate)
const toggleBusinessSubscription = async (req, res) => {
  try {
    const { businessId, isActive } = req.body;

    // Validate required parameters
    if (!businessId || typeof isActive === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Business ID and isActive are required",
      });
    }

    // Normalize isActive to boolean
    const isActiveBool =
      isActive === true ||
      isActive === "true" ||
      isActive === 1 ||
      isActive === "1";

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    // Update subscription status
    business.petpro_subscription.is_active = isActiveBool;

    if (isActiveBool) {
      // Activating subscription
      business.petpro_subscription.payment_status = "paid";
      business.petpro_subscription.subscription_type = "premium";

      // Enable premium features
      business.features.can_create_featured_ads = true;
      business.features.max_featured_ads = 10; // or whatever your limit is
      business.features.can_showcase_products = true;
      business.features.max_products = 50; // or whatever your limit is
      business.features.can_create_promotions = true;
      business.features.max_promotions = 5; // or whatever your limit is
      business.features.analytics_access = true;
    } else {
      // Deactivating subscription
      business.petpro_subscription.payment_status = "cancelled";
      business.petpro_subscription.subscription_type = "none";

      // Disable all premium features
      business.features.can_create_featured_ads = false;
      business.features.max_featured_ads = 0;
      business.features.can_showcase_products = false;
      business.features.max_products = 0;
      business.features.can_create_promotions = false;
      business.features.max_promotions = 0;
      business.features.analytics_access = false;
    }

    await business.save();

    // Optional: send notification to business owner about the change
    const businessOwner = await User.findById(business.id);
    if (businessOwner && businessOwner.device_token) {
      try {
        await sendGeneralNotification(
          businessOwner.device_token,
          `PetPro Subscription ${isActiveBool ? "Activated" : "Deactivated"}`,
          `Your PetPro subscription has been ${
            isActiveBool ? "activated" : "deactivated"
          } by admin. ${
            isActiveBool
              ? "You now have access to premium features!"
              : "Contact support for more information."
          }`,
          NOTIFICATION_TYPES.ADMIN_NOTIFICATION,
          {
            business_id: businessId,
            subscription_status: isActiveBool ? "activated" : "deactivated",
            updated_by: "super_admin",
          }
        );
      } catch (notifyErr) {
        console.error(
          "Failed to notify business owner about subscription change:",
          notifyErr.message
        );
        // don't fail the whole operation if notification fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Business subscription ${
        isActiveBool ? "activated" : "deactivated"
      } successfully`,
      data: {
        businessId,
        is_active: isActiveBool,
        payment_status: business.petpro_subscription.payment_status,
        subscription_type: business.petpro_subscription.subscription_type,
        features_enabled: isActiveBool,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user and all associated data (DANGEROUS - use with caution)
const deleteUserCompletely = async (req, res) => {
  try {
    const { userId } = req.params;
    let userDeviceToken = null;

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion of super admin users
    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin users",
      });
    }

    // Start deletion process - track what gets deleted
    const deletionResults = {
      user_data: false,
      business_profile: 0,
      pets: 0,
      orders: 0,
      qr_codes: 0,
      ads: 0,
      products: 0,
      promotions: 0,
      lost_pets: 0,
      medical_history: 0,
      messages: 0,
      analytics: 0,
      dog_matches: 0,
    };

    console.log(`Starting deletion process for user: ${userId}`);

    // 1. Find and delete business profile(s) and all business-related data
    const businessProfiles = await Business.find({ id: userId });
    for (const business of businessProfiles) {
      const businessId = business._id;

      // Delete ads created by this business
      const deletedAds = await Ads.deleteMany({ business_id: businessId });
      deletionResults.ads += deletedAds.deletedCount;

      // Delete products created by this business
      const deletedProducts = await Product.deleteMany({
        business_id: businessId,
      });
      deletionResults.products += deletedProducts.deletedCount;

      // Delete promotions created by this business
      const deletedPromotions = await Promotion.deleteMany({
        business_id: businessId,
      });
      deletionResults.promotions += deletedPromotions.deletedCount;

      // Delete analytics for this business
      const deletedAnalytics = await Analytics.deleteMany({
        business_id: businessId,
      });
      deletionResults.analytics += deletedAnalytics.deletedCount;

      // Delete the business profile itself
      await Business.findByIdAndDelete(businessId);
      deletionResults.business_profile += 1;
    }

    // 2. Delete user's pets
    const deletedPets = await Pet.deleteMany({ user: userId });
    deletionResults.pets = deletedPets.deletedCount;

    // 3. Delete user's orders
    const deletedOrders = await Order.deleteMany({ user: userId });
    deletionResults.orders = deletedOrders.deletedCount;

    // 4. Delete user's QR codes
    const deletedQRCodes = await QRCode.deleteMany({ userId: userId });
    deletionResults.qr_codes = deletedQRCodes.deletedCount;

    // 5. Delete user's lost pet reports
    const deletedLostPets = await Lost.deleteMany({ user: userId });
    deletionResults.lost_pets = deletedLostPets.deletedCount;

    // 6. Delete medical history records for user's pets
    const userPetIds = await Pet.find({ user: userId }).distinct("_id");
    const deletedMedicalHistory = await MedicalHistory.deleteMany({
      pet: { $in: userPetIds },
    });
    deletionResults.medical_history = deletedMedicalHistory.deletedCount;

    // 7. Delete user's messages (as sender)
    const deletedMessages = await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }],
    });
    deletionResults.messages = deletedMessages.deletedCount;

    // 8. Delete dog match preferences
    const deletedDogMatches = await DogMatch.deleteMany({ user: userId });
    deletionResults.dog_matches = deletedDogMatches.deletedCount;

    // 9. Send notification to user before account deletion (if they have device token)
    let notificationSent = false;
    if (user.device_token) {
      userDeviceToken = user.device_token;
    }

    // 10. Finally, delete the user account itself
    await User.findByIdAndDelete(userId);

    try {
      await sendGeneralNotification(
        userDeviceToken,
        "Account Deletion Notice",
        "Your account and all associated data have been permanently deleted by an administrator. If you believe this is an error, please contact support immediately.",
        NOTIFICATION_TYPES.DELETE_USER,
        {
          action: "account_deletion",
          deleted_by: "super_admin",
          deletion_date: new Date().toISOString(),
          support_contact: "support@mascotas.com", // Update with your actual support contact
        }
      );
      notificationSent = true;
      console.log(`Deletion notification sent to user: ${userId}`);
    } catch (notifyErr) {
      console.error(
        `Failed to send deletion notification to user ${userId}:`,
        notifyErr.message
      );
      // Don't fail the deletion if notification fails, but log it
      notificationSent = false;
    }

    deletionResults.user_data = true;

    console.log(`User deletion completed for: ${userId}`, deletionResults);

    res.status(200).json({
      success: true,
      message: "User and all associated data deleted successfully",
      deleted_user: {
        id: userId,
        username: user.username || user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
      notification_sent: notificationSent,
      notification_status: notificationSent
        ? "Deletion notification sent to user successfully"
        : user.device_token
        ? "Failed to send notification - check logs for details"
        : "No device token available - notification not sent",
      deletion_summary: deletionResults,
      warning:
        "This action was irreversible - all user data has been permanently deleted",
    });
  } catch (error) {
    console.error("Delete user completely error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user and associated data",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getAllBusinessProfiles,
  toggleBusinessStatus,
  updateSubscriptionBadge,
  toggleUserStatus,
  sendPushNotificationToUsers,
  getUserAnalytics,
  getSalesAnalytics,
  getAllPets,
  assignPetManually,
  toggleBusinessSubscription,
  deleteUserCompletely,
};
