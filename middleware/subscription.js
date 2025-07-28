const Business = require("../model/business");

/**
 * Middleware to check if a business has an active subscription
 * Now checks for actual subscription instead of assuming basic plan
 */
const checkActiveSubscription = async (req, res, next) => {
  try {
    const { business_id } = req.body || req.params;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    const business = await Business.findById(business_id).select(
      "petpro_subscription features company_name"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const currentDate = new Date();
    const isExpired =
      business.petpro_subscription.end_date &&
      business.petpro_subscription.end_date < currentDate;

    // Check if subscription is active and not expired
    if (!business.petpro_subscription.is_active || isExpired) {
      return res.status(403).json({
        success: false,
        message:
          "Active subscription required. Please subscribe to access business features.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: isExpired,
          end_date: business.petpro_subscription.end_date,
        },
        action_required:
          "Please subscribe to unlock business features and start showcasing your products.",
      });
    }

    // Add business info to request for use in controller
    req.business = business;
    next();
  } catch (error) {
    console.error("Subscription check middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking subscription status",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if a business can create featured ads
 */
const checkFeaturedAdsPermission = async (req, res, next) => {
  try {
    const business = req.business; // Should be set by checkActiveSubscription

    if (!business.features.can_create_featured_ads) {
      return res.status(403).json({
        success: false,
        message:
          "Featured ads creation requires an active subscription. Please subscribe to unlock this feature.",
        current_limits: {
          max_featured_ads: business.features.max_featured_ads,
          subscription_type: business.petpro_subscription.subscription_type,
        },
      });
    }

    // Check if they've reached their limit (if not unlimited)
    if (business.features.max_featured_ads > 0) {
      // You might want to add a count check here based on existing featured ads
      // This would require querying your ads collection
    }

    next();
  } catch (error) {
    console.error("Featured ads permission check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking featured ads permission",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if a business can showcase products
 */
const checkProductsPermission = async (req, res, next) => {
  try {
    const business = req.business; // Should be set by checkActiveSubscription

    if (!business.features.can_showcase_products) {
      return res.status(403).json({
        success: false,
        message:
          "Product showcase requires an active subscription. Please subscribe to unlock this feature.",
        current_limits: {
          max_products: business.features.max_products,
          subscription_type: business.petpro_subscription.subscription_type,
        },
      });
    }

    next();
  } catch (error) {
    console.error("Products permission check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking products permission",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if a business can create promotions
 */
const checkPromotionsPermission = async (req, res, next) => {
  try {
    const business = req.business; // Should be set by checkActiveSubscription

    if (!business.features.can_create_promotions) {
      return res.status(403).json({
        success: false,
        message:
          "Promotion creation requires an active subscription. Please subscribe to unlock this feature.",
        current_limits: {
          max_promotions: business.features.max_promotions,
          subscription_type: business.petpro_subscription.subscription_type,
        },
      });
    }

    next();
  } catch (error) {
    console.error("Promotions permission check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking promotions permission",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if a business has analytics access
 */
const checkAnalyticsPermission = async (req, res, next) => {
  try {
    const business = req.business; // Should be set by checkActiveSubscription

    if (!business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message:
          "Analytics access requires an active subscription. Please subscribe to unlock this feature.",
        current_subscription: business.petpro_subscription.subscription_type,
      });
    }

    next();
  } catch (error) {
    console.error("Analytics permission check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking analytics permission",
      error: error.message,
    });
  }
};

/**
 * Middleware to get business info by user ID (for user-based routes)
 */
const getBusinessByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.body || req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const business = await Business.findOne({ id: user_id }).select(
      "petpro_subscription features company_name _id"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message:
          "No business found for this user. Please register your business first.",
      });
    }

    // Add business info to request
    req.business = business;
    req.business_id = business._id;
    next();
  } catch (error) {
    console.error("Get business by user ID middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding business for user",
      error: error.message,
    });
  }
};

module.exports = {
  checkActiveSubscription,
  checkFeaturedAdsPermission,
  checkProductsPermission,
  checkPromotionsPermission,
  checkAnalyticsPermission,
  getBusinessByUserId,
};
