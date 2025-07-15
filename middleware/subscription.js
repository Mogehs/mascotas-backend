const Business = require("../model/business");

/**
 * Middleware to check if a business has an active subscription
 * Use this middleware on routes that require premium features
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
          "Premium subscription required. Please activate or renew your PetPro subscription.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          is_expired: isExpired,
          end_date: business.petpro_subscription.end_date,
        },
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
          "Featured ads creation not allowed with current subscription plan",
      });
    }

    // Check if they've reached their limit
    // You might want to add a count check here based on existing featured ads
    // This would require querying your ads collection

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
        message: "Product showcase not allowed with current subscription plan",
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
          "Promotions creation not allowed with current subscription plan",
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
const checkAnalyticsAccess = async (req, res, next) => {
  try {
    const business = req.business; // Should be set by checkActiveSubscription

    if (!business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Analytics access not allowed with current subscription plan",
      });
    }

    next();
  } catch (error) {
    console.error("Analytics access check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking analytics access",
      error: error.message,
    });
  }
};

module.exports = {
  checkActiveSubscription,
  checkFeaturedAdsPermission,
  checkProductsPermission,
  checkPromotionsPermission,
  checkAnalyticsAccess,
};
