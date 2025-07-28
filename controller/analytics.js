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

    // Get business and check subscription status
    const business = await Business.findById(business_id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if business has active premium subscription
    if (!business.petpro_subscription.is_active) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required to access analytics. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: false,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required: "Subscribe to Premium to access detailed business analytics and insights."
      });
    }

    // Check if subscription is expired
    const subscriptionCheckDate = new Date();
    const isExpired = business.petpro_subscription.end_date &&
                     business.petpro_subscription.end_date < subscriptionCheckDate;

    if (isExpired) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew to continue accessing analytics.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: true,
          end_date: business.petpro_subscription.end_date,
        },
        action_required: "Renew your Premium subscription to continue accessing analytics."
      });
    }

    // Check if business has analytics access
    if (!business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Analytics access requires Premium subscription. Please subscribe to unlock this feature.",
        current_limits: {
          analytics_access: business.features.analytics_access,
          subscription_type: business.petpro_subscription.subscription_type,
        }
      });
    }

    // Get real-time overview data instead of cached
    const overviewDate = new Date();
    const monthStart = new Date(
      overviewDate.getFullYear(),
      overviewDate.getMonth(),
      1
    );

    const [
      totalAnalyticsStats,
      monthlyAnalyticsStats,
      productOverviewStats,
      adOverviewStats,
      promotionOverviewStats,
    ] = await Promise.all([
      // Total analytics tracking
      Analytics.aggregate([
        {
          $match: { business_id: business._id },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly analytics tracking
      Analytics.aggregate([
        {
          $match: {
            business_id: business._id,
            date: { $gte: monthStart, $lte: overviewDate },
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]),

      // Product totals from Product model
      Product.aggregate([
        {
          $match: { business_id: business._id, is_available: true },
        },
        {
          $group: {
            _id: null,
            total_views: { $sum: "$views" },
            total_inquiries: { $sum: "$inquiries" },
            total_contact_clicks: { $sum: "$contact_clicks" },
          },
        },
      ]),

      // Ad totals from Ads model
      Ads.aggregate([
        {
          $match: { business_id: business._id, is_available: true },
        },
        {
          $group: {
            _id: null,
            total_views: { $sum: "$views" },
            total_clicks: { $sum: "$clicks" },
          },
        },
      ]),

      // Promotion totals from Promotion model
      Promotion.aggregate([
        {
          $match: { business_id: business._id, is_active: true },
        },
        {
          $group: {
            _id: null,
            total_views: { $sum: "$views" },
            total_clicks: { $sum: "$clicks" },
          },
        },
      ]),
    ]);

    // Combine real-time overview data
    const productViewsTotal = productOverviewStats[0]?.total_views || 0;
    const productInquiries = productOverviewStats[0]?.total_inquiries || 0;
    const productContactClicks =
      productOverviewStats[0]?.total_contact_clicks || 0;

    const adViewsTotal = adOverviewStats[0]?.total_views || 0;
    const adClicksTotal = adOverviewStats[0]?.total_clicks || 0;

    const promotionViewsTotal = promotionOverviewStats[0]?.total_views || 0;
    const promotionClicksTotal = promotionOverviewStats[0]?.total_clicks || 0;

    const analyticsViews = totalAnalyticsStats
      .filter((stat) => stat._id.includes("_view"))
      .reduce((total, stat) => total + stat.count, 0);

    const analyticsClicks = totalAnalyticsStats
      .filter((stat) => stat._id.includes("_click"))
      .reduce((total, stat) => total + stat.count, 0);

    const monthlyAnalyticsViews = monthlyAnalyticsStats
      .filter((stat) => stat._id.includes("_view"))
      .reduce((total, stat) => total + stat.count, 0);

    const monthlyAnalyticsClicks = monthlyAnalyticsStats
      .filter((stat) => stat._id.includes("_click"))
      .reduce((total, stat) => total + stat.count, 0);

    const overviewData = {
      total_views:
        productViewsTotal + adViewsTotal + promotionViewsTotal + analyticsViews,
      total_clicks:
        productInquiries +
        productContactClicks +
        adClicksTotal +
        promotionClicksTotal +
        analyticsClicks,
      monthly_views: monthlyAnalyticsViews,
      monthly_clicks: monthlyAnalyticsClicks,
      last_stats_update: overviewDate,
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

    // Get business and check subscription status
    const business = await Business.findById(business_id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if business has active premium subscription
    if (!business.petpro_subscription.is_active) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required to access product analytics. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: false,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required: "Subscribe to Premium to access detailed product analytics and insights."
      });
    }

    // Check if subscription is expired
    const subscriptionCheckDate = new Date();
    const isExpired = business.petpro_subscription.end_date &&
                     business.petpro_subscription.end_date < subscriptionCheckDate;

    if (isExpired) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew to continue accessing analytics.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: true,
          end_date: business.petpro_subscription.end_date,
        },
        action_required: "Renew your Premium subscription to continue accessing analytics."
      });
    }

    // Check if business has analytics access
    if (!business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Analytics access requires Premium subscription. Please subscribe to unlock this feature.",
        current_limits: {
          analytics_access: business.features.analytics_access,
          subscription_type: business.petpro_subscription.subscription_type,
        }
      });
    }

    // Calculate date range for clicks analytics
    const currentDate = new Date();
    const daysBack =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get products with their actual views from Product model and clicks from Analytics
    const products = await Product.find({
      business_id,
      is_available: true,
    }).select("name price images category views inquiries contact_clicks");

    // Get clicks data from Analytics for the period
    const clicksData = await Analytics.aggregate([
      {
        $match: {
          business_id: business._id,
          resource_type: "product",
          type: { $in: ["product_click", "product_contact"] },
          date: { $gte: startDate, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: "$resource_id",
          clicks: { $sum: 1 },
        },
      },
    ]);

    // Combine product data with analytics
    const productAnalytics = products.map((product) => {
      const clickStats = clicksData.find(
        (c) => c._id.toString() === product._id.toString()
      );
      const clicks = clickStats ? clickStats.clicks : 0;
      const views = product.views || 0;

      return {
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          category: product.category,
        },
        analytics: {
          views: views,
          clicks: clicks,
          inquiries: product.inquiries || 0,
          contact_clicks: product.contact_clicks || 0,
          ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00",
        },
      };
    });

    // Sort by views (descending) and limit
    productAnalytics.sort((a, b) => b.analytics.views - a.analytics.views);
    const limitedResults = productAnalytics.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: limitedResults,
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

    // Get business and check subscription status
    const business = await Business.findById(business_id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if business has active premium subscription
    if (!business.petpro_subscription.is_active) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required to access promotion analytics. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: false,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required: "Subscribe to Premium to access detailed promotion analytics and insights."
      });
    }

    // Check if subscription is expired
    const subscriptionCheckDate = new Date();
    const isExpired = business.petpro_subscription.end_date &&
                     business.petpro_subscription.end_date < subscriptionCheckDate;

    if (isExpired) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew to continue accessing analytics.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: true,
          end_date: business.petpro_subscription.end_date,
        },
        action_required: "Renew your Premium subscription to continue accessing analytics."
      });
    }

    // Check if business has analytics access
    if (!business.features.analytics_access) {
      return res.status(403).json({
        success: false,
        message: "Analytics access requires Premium subscription. Please subscribe to unlock this feature.",
        current_limits: {
          analytics_access: business.features.analytics_access,
          subscription_type: business.petpro_subscription.subscription_type,
        }
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
      }
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

    // Get business and check subscription status
    const business = await Business.findById(business_id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if business has active premium subscription
    if (!business.petpro_subscription.is_active || 
        !business.features.analytics_access ||
        business.petpro_subscription.subscription_type !== "premium") {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required to access ad analytics. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required: "Subscribe to Premium to access detailed ad analytics and insights."
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

// Get quick business statistics (real-time data)
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

    const currentDate = new Date();
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get real-time total statistics
    const [totalStats, monthlyStats, productViews, adViews, promotionViews] =
      await Promise.all([
        // Total views and clicks from Analytics
        Analytics.aggregate([
          {
            $match: { business_id: business._id },
          },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ]),

        // Monthly views and clicks from Analytics
        Analytics.aggregate([
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
        ]),

        // Product views from Product model
        Product.aggregate([
          {
            $match: { business_id: business._id, is_available: true },
          },
          {
            $group: {
              _id: null,
              total_views: { $sum: "$views" },
              total_inquiries: { $sum: "$inquiries" },
              total_contact_clicks: { $sum: "$contact_clicks" },
            },
          },
        ]),

        // Ad views from Ads model
        Ads.aggregate([
          {
            $match: { business_id: business._id, is_available: true },
          },
          {
            $group: {
              _id: null,
              total_views: { $sum: "$views" },
              total_clicks: { $sum: "$clicks" },
            },
          },
        ]),

        // Promotion views from Promotion model
        Promotion.aggregate([
          {
            $match: { business_id: business._id, is_active: true },
          },
          {
            $group: {
              _id: null,
              total_views: { $sum: "$views" },
              total_clicks: { $sum: "$clicks" },
            },
          },
        ]),
      ]);

    // Calculate analytics views and clicks
    const analyticsViews = totalStats
      .filter((stat) => stat._id.includes("_view"))
      .reduce((total, stat) => total + stat.count, 0);

    const analyticsClicks = totalStats
      .filter((stat) => stat._id.includes("_click"))
      .reduce((total, stat) => total + stat.count, 0);

    const monthlyAnalyticsViews = monthlyStats
      .filter((stat) => stat._id.includes("_view"))
      .reduce((total, stat) => total + stat.count, 0);

    const monthlyAnalyticsClicks = monthlyStats
      .filter((stat) => stat._id.includes("_click"))
      .reduce((total, stat) => total + stat.count, 0);

    // Get actual views from models
    const productViewsTotal = productViews[0]?.total_views || 0;
    const productInquiries = productViews[0]?.total_inquiries || 0;
    const productContactClicks = productViews[0]?.total_contact_clicks || 0;

    const adViewsTotal = adViews[0]?.total_views || 0;
    const adClicksTotal = adViews[0]?.total_clicks || 0;

    const promotionViewsTotal = promotionViews[0]?.total_views || 0;
    const promotionClicksTotal = promotionViews[0]?.total_clicks || 0;

    // Combine totals (using actual model data + analytics tracking)
    const totalViewsCombined =
      productViewsTotal + adViewsTotal + promotionViewsTotal + analyticsViews;
    const totalClicksCombined =
      productInquiries +
      productContactClicks +
      adClicksTotal +
      promotionClicksTotal +
      analyticsClicks;

    // For monthly, we'll use analytics data since model views are cumulative
    const monthlyViews = monthlyAnalyticsViews;
    const monthlyClicks = monthlyAnalyticsClicks;

    const stats = {
      total_views: totalViewsCombined,
      total_clicks: totalClicksCombined,
      monthly_views: monthlyViews,
      monthly_clicks: monthlyClicks,
      overall_ctr:
        totalViewsCombined > 0
          ? ((totalClicksCombined / totalViewsCombined) * 100).toFixed(2)
          : "0.00",
      monthly_ctr:
        monthlyViews > 0
          ? ((monthlyClicks / monthlyViews) * 100).toFixed(2)
          : "0.00",
      last_stats_update: currentDate,
      breakdown: {
        products: {
          views: productViewsTotal,
          inquiries: productInquiries,
          contact_clicks: productContactClicks,
        },
        ads: {
          views: adViewsTotal,
          clicks: adClicksTotal,
        },
        promotions: {
          views: promotionViewsTotal,
          clicks: promotionClicksTotal,
        },
        analytics_tracking: {
          views: analyticsViews,
          clicks: analyticsClicks,
        },
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "Real-time statistics calculated",
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
  getQuickBusinessStats,
  getAdminAnalytics,
};
