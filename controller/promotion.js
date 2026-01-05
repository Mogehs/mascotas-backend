const Promotion = require("../model/promotion");
const Business = require("../model/business");
const Product = require("../model/product");
const Analytics = require("../model/analytics");
const { saveFile } = require("../utils/fileUpload.helper");

// Helper function to track analytics
const trackAnalytics = async (
  business_id,
  type,
  resource_id,
  resource_type,
  user_id = null,
  metadata = {}
) => {
  try {
    await Analytics.create({
      business_id,
      date: new Date(),
      type,
      resource_id,
      resource_type,
      user_id,
      metadata,
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
};

// Create a new promotion
const createPromotion = async (req, res) => {
  try {
    const {
      business_id,
      title,
      description,
      type,
      value,
      minimum_order_amount,
      applicable_products,
      applicable_categories,
      start_date,
      end_date,
      usage_limit,
      terms_conditions,
    } = req.body;

    // Get business and check subscription status
    const business = await Business.findById(business_id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if business has active subscription
    if (!business.petpro_subscription.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "Active subscription required to create promotions. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: false,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required:
          "Subscribe to start creating promotions and boost your sales.",
      });
    }

    // Check if subscription is expired
    const currentDate = new Date();
    const isExpired =
      business.petpro_subscription.end_date &&
      business.petpro_subscription.end_date < currentDate;

    if (isExpired) {
      return res.status(403).json({
        success: false,
        message:
          "Your subscription has expired. Please renew to continue creating promotions.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: true,
          end_date: business.petpro_subscription.end_date,
        },
        action_required:
          "Renew your subscription to continue creating promotions.",
      });
    }

    // Check if business can create promotions
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

    if (business.is_blocked) {
      return res.status(403).json({
        success: false,
        message: "Business is blocked by admin from creating promotions.",
      });
    }

    // Check promotion limit (only if not unlimited)
    if (business.features.max_promotions !== -1) {
      const activePromotions = await Promotion.countDocuments({
        business_id,
        is_active: true,
        end_date: { $gte: new Date() },
      });

      if (activePromotions >= business.features.max_promotions) {
        return res.status(403).json({
          success: false,
          message: `Active promotion limit reached. Current plan allows ${business.features.max_promotions} promotions. Upgrade to Premium for unlimited promotions.`,
          current_count: activePromotions,
          max_allowed: business.features.max_promotions,
          upgrade_message: "Upgrade to Premium for unlimited promotions.",
        });
      }
    }

    // Handle banner image upload
    let banner_image = null;
    if (req.files && req.files.banner_image) {
      const uploadResult = await saveFile(req.files.banner_image, "promotions");
      if (uploadResult.success) {
        banner_image = uploadResult.url;
      }
    }

    const promotion = await Promotion.create({
      business_id,
      title,
      description,
      type,
      value,
      minimum_order_amount,
      applicable_products: applicable_products || [],
      applicable_categories: applicable_categories || [],
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      usage_limit,
      banner_image,
      terms_conditions,
    });

    await promotion.populate("business_id", "company_name");

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: promotion,
    });
  } catch (error) {
    console.error("Create promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating promotion",
      error: error.message,
    });
  }
};

// Get all promotions for a business
const getBusinessPromotions = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { page = 1, limit = 10, status = "all" } = req.query;

    let query = { business_id };

    const currentDate = new Date();

    switch (status) {
      case "active":
        query.is_active = true;
        query.start_date = { $lte: currentDate };
        query.end_date = { $gte: currentDate };
        break;
      case "expired":
        query.end_date = { $lt: currentDate };
        break;
      case "upcoming":
        query.start_date = { $gt: currentDate };
        break;
      case "inactive":
        query.is_active = false;
        break;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: "business_id", select: "company_name" },
        { path: "applicable_products", select: "name price images" },
      ],
    };

    const promotions = await Promotion.paginate(query, options);

    res.status(200).json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    console.error("Get business promotions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotions",
      error: error.message,
    });
  }
};

// Get active promotions for customers
const getActivePromotions = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const currentDate = new Date();

    let query = {
      is_active: true,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    };

    if (category) {
      query.applicable_categories = category;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        {
          path: "business_id",
          select: "company_name company_logo physical_address",
        },
        { path: "applicable_products", select: "name price images" },
      ],
    };

    const promotions = await Promotion.paginate(query, options);

    res.status(200).json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    console.error("Get active promotions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active promotions",
      error: error.message,
    });
  }
};

// Get single promotion with view tracking
const getPromotion = async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const { user_id } = req.query;

    const promotion = await Promotion.findById(promotion_id)
      .populate(
        "business_id",
        "company_name company_logo physical_address phone email"
      )
      .populate("applicable_products", "name price images");

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    // Increment view count
    await Promotion.findByIdAndUpdate(promotion_id, { $inc: { views: 1 } });

    // Track analytics
    await trackAnalytics(
      promotion.business_id._id,
      "promotion_view",
      promotion_id,
      "promotion",
      user_id
    );

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error("Get promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotion",
      error: error.message,
    });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const updateData = req.body;

    // Handle banner image upload
    if (req.files && req.files.banner_image) {
      const uploadResult = await saveFile(req.files.banner_image, "promotions");
      if (uploadResult.success) {
        updateData.banner_image = uploadResult.url;
      }
    }

    // Convert date strings to Date objects
    if (updateData.start_date)
      updateData.start_date = new Date(updateData.start_date);
    if (updateData.end_date)
      updateData.end_date = new Date(updateData.end_date);

    const promotion = await Promotion.findByIdAndUpdate(
      promotion_id,
      updateData,
      { new: true, runValidators: true }
    ).populate("business_id", "company_name");

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      data: promotion,
    });
  } catch (error) {
    console.error("Update promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating promotion",
      error: error.message,
    });
  }
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    const { promotion_id } = req.params;

    const promotion = await Promotion.findByIdAndUpdate(
      promotion_id,
      { is_active: false },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promotion deactivated successfully",
    });
  } catch (error) {
    console.error("Delete promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting promotion",
      error: error.message,
    });
  }
};

// Track promotion click
const trackPromotionClick = async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const { user_id } = req.body;

    const promotion = await Promotion.findByIdAndUpdate(
      promotion_id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    // Track analytics
    await trackAnalytics(
      promotion.business_id,
      "promotion_click",
      promotion_id,
      "promotion",
      user_id
    );

    res.status(200).json({
      success: true,
      message: "Click tracked successfully",
    });
  } catch (error) {
    console.error("Track promotion click error:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking click",
      error: error.message,
    });
  }
};

module.exports = {
  createPromotion,
  getBusinessPromotions,
  getActivePromotions,
  getPromotion,
  updatePromotion,
  deletePromotion,
  trackPromotionClick,
};
