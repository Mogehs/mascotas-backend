const Analytics = require("../model/analytics");
const Business = require("../model/business");
const Product = require("../model/product");
const Promotion = require("../model/promotion");
const Ads = require("../model/ads");
const QRCode = require("../model/qrcode");
const User = require("../model/user");
const Pet = require("../model/pet");

// Get business analytics overview
const getBusinessAnalytics = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { period = "30d", start_date, end_date } = req.query;

    // Verify business has analytics access
    const business = await Business.findById(business_id);
    if (!business || !business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message:
          "Business does not have access to analytics. Please upgrade to PetPro.",
      });
    }

    // For cached overview data, use the stored statistics
    let overviewData = {
      total_views: business.statistics.total_views,
      total_clicks: business.statistics.total_clicks,
      monthly_views: business.statistics.monthly_views,
      monthly_clicks: business.statistics.monthly_clicks,
      last_stats_update: business.statistics.last_stats_update,
    };

    // Calculate CTR from cached data
    const overallCTR =
      overviewData.total_views > 0
        ? (
            (overviewData.total_clicks / overviewData.total_views) *
            100
          ).toFixed(2)
        : 0;

    const monthlyCTR =
      overviewData.monthly_views > 0
        ? (
            (overviewData.monthly_clicks / overviewData.monthly_views) *
            100
          ).toFixed(2)
        : 0;

    // For detailed analytics (if needed), calculate date range
    let dateRange = {};
    const currentDate = new Date();

    if (start_date && end_date) {
      dateRange = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    } else {
      const daysBack =
        period === "7d"
          ? 7
          : period === "30d"
          ? 30
          : period === "90d"
          ? 90
          : 365;
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - daysBack);
      dateRange = {
        $gte: startDate,
        $lte: currentDate,
      };
    }

    // Get detailed performance breakdown and daily stats (still from Analytics for detailed view)
    const [adStats, productStats, promotionStats, dailyStats] =
      await Promise.all([
        // Ad performance
        Analytics.aggregate([
          {
            $match: {
              business_id: business._id,
              date: dateRange,
              resource_type: "ad",
            },
          },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ]),

        // Product performance
        Analytics.aggregate([
          {
            $match: {
              business_id: business._id,
              date: dateRange,
              resource_type: "product",
            },
          },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ]),

        // Promotion performance
        Analytics.aggregate([
          {
            $match: {
              business_id: business._id,
              date: dateRange,
              resource_type: "promotion",
            },
          },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ]),

        // Daily breakdown
        Analytics.aggregate([
          {
            $match: {
              business_id: business._id,
              date: dateRange,
            },
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                type: "$type",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.date": 1 },
          },
        ]),
      ]);

    // Format ad stats
    const adViewsCount =
      adStats.find((stat) => stat._id === "ad_view")?.count || 0;
    const adClicksCount =
      adStats.find((stat) => stat._id === "ad_click")?.count || 0;
    const adCTR =
      adViewsCount > 0 ? ((adClicksCount / adViewsCount) * 100).toFixed(2) : 0;

    // Format product stats
    const productViewsCount =
      productStats.find((stat) => stat._id === "product_view")?.count || 0;
    const productClicksCount =
      productStats.find((stat) => stat._id === "product_click")?.count || 0;
    const productCTR =
      productViewsCount > 0
        ? ((productClicksCount / productViewsCount) * 100).toFixed(2)
        : 0;

    // Format promotion stats
    const promotionViewsCount =
      promotionStats.find((stat) => stat._id === "promotion_view")?.count || 0;
    const promotionClicksCount =
      promotionStats.find((stat) => stat._id === "promotion_click")?.count || 0;
    const promotionCTR =
      promotionViewsCount > 0
        ? ((promotionClicksCount / promotionViewsCount) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total_views: overviewData.total_views,
          total_clicks: overviewData.total_clicks,
          monthly_views: overviewData.monthly_views,
          monthly_clicks: overviewData.monthly_clicks,
          overall_ctr: overallCTR,
          monthly_ctr: monthlyCTR,
          last_stats_update: overviewData.last_stats_update,
          period,
        },
        performance: {
          ads: {
            views: adViewsCount,
            clicks: adClicksCount,
            ctr: adCTR,
          },
          products: {
            views: productViewsCount,
            clicks: productClicksCount,
            ctr: productCTR,
          },
          promotions: {
            views: promotionViewsCount,
            clicks: promotionClicksCount,
            ctr: promotionCTR,
          },
        },
        daily_stats: dailyStats,
      },
    });
  } catch (error) {
    console.error("Get business analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

// Get product performance analytics
const getProductAnalytics = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { period = "30d", limit = 10 } = req.query;

    // Verify business has analytics access
    const business = await Business.findById(business_id);
    if (!business || !business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Business does not have access to analytics",
      });
    }

    // Calculate date range
    const currentDate = new Date();
    const daysBack =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get top performing products
    const topProducts = await Analytics.aggregate([
      {
        $match: {
          business_id: business._id,
          resource_type: "product",
          date: { $gte: startDate, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            product_id: "$resource_id",
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.product_id",
          views: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "product_view"] }, "$count", 0],
            },
          },
          clicks: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "product_click"] }, "$count", 0],
            },
          },
        },
      },
      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ["$views", 0] },
              { $multiply: [{ $divide: ["$clicks", "$views"] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    // Populate product details
    const productIds = topProducts.map((p) => p._id);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name price images category"
    );

    // Combine analytics with product details
    const productAnalytics = topProducts.map((analytics) => {
      const product = products.find(
        (p) => p._id.toString() === analytics._id.toString()
      );
      return {
        product,
        analytics: {
          views: analytics.views,
          clicks: analytics.clicks,
          ctr: analytics.ctr.toFixed(2),
        },
      };
    });

    res.status(200).json({
      success: true,
      data: productAnalytics,
    });
  } catch (error) {
    console.error("Get product analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product analytics",
      error: error.message,
    });
  }
};

// Get promotion performance analytics
const getPromotionAnalytics = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { period = "30d" } = req.query;

    // Verify business has analytics access
    const business = await Business.findById(business_id);
    if (!business || !business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Business does not have access to analytics.",
      });
    }

    // Calculate date range
    const currentDate = new Date();
    const daysBack =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get promotion performance
    const promotionStats = await Promotion.find({
      business_id,
      createdAt: { $gte: startDate, $lte: currentDate },
    }).select(
      "title views clicks conversions usage_count type value start_date end_date is_active"
    );

    // Calculate conversion rates
    const promotionAnalytics = promotionStats.map((promotion) => ({
      promotion: {
        id: promotion._id,
        title: promotion.title,
        type: promotion.type,
        value: promotion.value,
        is_active: promotion.is_active,
      },
      analytics: {
        views: promotion.views,
        clicks: promotion.clicks,
        conversions: promotion.conversions,
        usage_count: promotion.usage_count,
        ctr:
          promotion.views > 0
            ? ((promotion.clicks / promotion.views) * 100).toFixed(2)
            : 0,
        conversion_rate:
          promotion.clicks > 0
            ? ((promotion.conversions / promotion.clicks) * 100).toFixed(2)
            : 0,
      },
    }));

    res.status(200).json({
      success: true,
      data: promotionAnalytics,
    });
  } catch (error) {
    console.error("Get promotion analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotion analytics",
      error: error.message,
    });
  }
};

// Get ad performance analytics
const getAdAnalytics = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { period = "30d" } = req.query;

    // Verify business has analytics access
    const business = await Business.findById(business_id);
    if (!business || !business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Business does not have access to analytics.",
      });
    }

    // Calculate date range
    const currentDate = new Date();
    const daysBack =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get ad performance from analytics
    const adStats = await Analytics.aggregate([
      {
        $match: {
          business_id: business._id,
          resource_type: "ad",
          date: { $gte: startDate, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            ad_id: "$resource_id",
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.ad_id",
          views: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "ad_view"] }, "$count", 0],
            },
          },
          clicks: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "ad_click"] }, "$count", 0],
            },
          },
        },
      },
      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ["$views", 0] },
              { $multiply: [{ $divide: ["$clicks", "$views"] }, 100] },
              0,
            ],
          },
        },
      },
    ]);

    // Get ad details
    const adIds = adStats.map((stat) => stat._id);
    const ads = await Ads.find({ _id: { $in: adIds } }).select(
      "title content category is_featured status"
    );

    // Combine analytics with ad details
    const adAnalytics = adStats.map((analytics) => {
      const ad = ads.find((a) => a._id.toString() === analytics._id.toString());
      return {
        ad,
        analytics: {
          views: analytics.views,
          clicks: analytics.clicks,
          ctr: analytics.ctr.toFixed(2),
        },
      };
    });

    res.status(200).json({
      success: true,
      data: adAnalytics,
    });
  } catch (error) {
    console.error("Get ad analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ad analytics",
      error: error.message,
    });
  }
};

// Get geographic analytics
const getGeographicAnalytics = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { period = "30d" } = req.query;

    // Verify business has analytics access
    const business = await Business.findById(business_id);
    if (!business || !business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Business does not have access to analytics.",
      });
    }

    // Calculate date range
    const currentDate = new Date();
    const daysBack =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get geographic distribution
    const geoStats = await Analytics.aggregate([
      {
        $match: {
          business_id: business._id,
          date: { $gte: startDate, $lte: currentDate },
          "user_location.city": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            city: "$user_location.city",
            country: "$user_location.country",
          },
          views: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$type",
                    [
                      "ad_view",
                      "product_view",
                      "promotion_view",
                      "profile_view",
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          clicks: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$type",
                    ["ad_click", "product_click", "promotion_click"],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    res.status(200).json({
      success: true,
      data: geoStats,
    });
  } catch (error) {
    console.error("Get geographic analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching geographic analytics",
      error: error.message,
    });
  }
};

// Update business statistics (cron job helper)
const updateBusinessStatistics = async (req, res) => {
  try {
    const businesses = await Business.find({
      "petpro_subscription.is_active": true,
    });

    for (const business of businesses) {
      const currentDate = new Date();
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      // Get monthly stats
      const monthlyStats = await Analytics.aggregate([
        {
          $match: {
            business_id: business._id,
            date: { $gte: monthStart, $lte: currentDate },
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      const monthlyViews = monthlyStats
        .filter((stat) => stat._id.includes("_view"))
        .reduce((total, stat) => total + stat.count, 0);

      const monthlyClicks = monthlyStats
        .filter((stat) => stat._id.includes("_click"))
        .reduce((total, stat) => total + stat.count, 0);

      // Get total stats
      const totalStats = await Analytics.aggregate([
        {
          $match: { business_id: business._id },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      const totalViews = totalStats
        .filter((stat) => stat._id.includes("_view"))
        .reduce((total, stat) => total + stat.count, 0);

      const totalClicks = totalStats
        .filter((stat) => stat._id.includes("_click"))
        .reduce((total, stat) => total + stat.count, 0);

      // Update business statistics
      await Business.findByIdAndUpdate(business._id, {
        "statistics.monthly_views": monthlyViews,
        "statistics.monthly_clicks": monthlyClicks,
        "statistics.total_views": totalViews,
        "statistics.total_clicks": totalClicks,
        "statistics.last_stats_update": currentDate,
      });
    }

    // Only send response if this is called as HTTP endpoint
    if (res) {
      res.status(200).json({
        success: true,
        message: `Updated statistics for ${businesses.length} businesses`,
      });
    }

    return {
      success: true,
      updated_count: businesses.length,
      message: `Updated statistics for ${businesses.length} businesses`,
    };
  } catch (error) {
    console.error("Update business statistics error:", error);

    // Only send response if this is called as HTTP endpoint
    if (res) {
      res.status(500).json({
        success: false,
        message: "Error updating business statistics",
        error: error.message,
      });
    }

    return {
      success: false,
      error: error.message,
      updated_count: 0,
    };
  }
};

// Get quick business statistics (cached data)
const getQuickBusinessStats = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Verify business has analytics access
    const business = await Business.findById(business_id);
    if (!business || !business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Business does not have access to analytics.",
      });
    }

    // Return cached statistics from Business model
    const stats = {
      total_views: business.statistics.total_views,
      total_clicks: business.statistics.total_clicks,
      monthly_views: business.statistics.monthly_views,
      monthly_clicks: business.statistics.monthly_clicks,
      overall_ctr:
        business.statistics.total_views > 0
          ? (
              (business.statistics.total_clicks /
                business.statistics.total_views) *
              100
            ).toFixed(2)
          : 0,
      monthly_ctr:
        business.statistics.monthly_views > 0
          ? (
              (business.statistics.monthly_clicks /
                business.statistics.monthly_views) *
              100
            ).toFixed(2)
          : 0,
      last_stats_update: business.statistics.last_stats_update,
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "Quick statistics retrieved from cached data",
    });
  } catch (error) {
    console.error("Get quick business stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quick statistics",
      error: error.message,
    });
  }
};

// Get admin analytics overview
const getAdminAnalytics = async (req, res) => {
  try {
    // Get total QR codes
    const totalQR = await QRCode.countDocuments();

    // Get assigned QR codes (QR codes with petId)
    const assignedQR = await QRCode.countDocuments({ petId: { $ne: null } });

    // Get not assigned QR codes
    const notAssignedQR = totalQR - assignedQR;

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total pets
    const totalPets = await Pet.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalQR,
        assignedQR,
        notAssignedQR,
        totalUsers,
        totalPets,
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getBusinessAnalytics,
  getProductAnalytics,
  getPromotionAnalytics,
  getAdAnalytics,
  getGeographicAnalytics,
  updateBusinessStatistics,
  getQuickBusinessStats,
  getAdminAnalytics,
};
