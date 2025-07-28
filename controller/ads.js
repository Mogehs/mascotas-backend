const ads = require("../model/ads");
const Business = require("../model/business");
const Analytics = require("../model/analytics");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_APP_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const adsRegister = async (req, res) => {
  try {
    const {
      id,
      business_id,
      content,
      title,
      description,
      category,
      method,
      name,
      address,
      is_featured = false,
      target_audience = {},
      schedule = {},
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
        message: "Active subscription required to create ads. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: false,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required: "Subscribe to start creating ads and reach more customers."
      });
    }

    // Check if subscription is expired
    const currentDate = new Date();
    const isExpired = business.petpro_subscription.end_date &&
                     business.petpro_subscription.end_date < currentDate;

    if (isExpired) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew to continue creating ads.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: true,
          end_date: business.petpro_subscription.end_date,
        },
        action_required: "Renew your subscription to continue creating ads."
      });
    }

    // Check if business can create featured ads (for featured ads only)
    if (is_featured) {
      if (!business.features.can_create_featured_ads) {
        return res.status(403).json({
          success: false,
          message: "Featured ads creation requires an active subscription. Please subscribe to unlock this feature.",
          current_limits: {
            max_featured_ads: business.features.max_featured_ads,
            subscription_type: business.petpro_subscription.subscription_type,
          }
        });
      }

      if (business.is_blocked) {
        return res.status(403).json({
          success: false,
          message: "Business is blocked by admin from showcasing products.",
        });
      }

      // Check featured ads limit (only if not unlimited)
      if (business.features.max_featured_ads !== -1) {
        const currentFeaturedAds = await ads.countDocuments({
          business_id,
          is_featured: true,
          status: "active",
        });

        if (currentFeaturedAds >= business.features.max_featured_ads) {
          return res.status(403).json({
            success: false,
            message: `Featured ads limit reached. Current plan allows ${business.features.max_featured_ads} featured ads. Upgrade to Premium for unlimited featured ads.`,
            current_count: currentFeaturedAds,
            max_allowed: business.features.max_featured_ads,
            upgrade_message: "Upgrade to Premium for unlimited featured ads."
          });
        }
      }
    }

    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image." });

    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas/ads",
      transformation: [
        { width: 1200, height: 800, crop: "limit" },
        { quality: "auto:good" },
      ],
    });

    // Handle multiple images if provided
    let imageUrls = [result.secure_url];
    if (req.files.additionalImages) {
      const additionalFiles = Array.isArray(req.files.additionalImages)
        ? req.files.additionalImages
        : [req.files.additionalImages];

      for (const additionalFile of additionalFiles) {
        const additionalResult = await cloudinary.uploader.upload(
          additionalFile.tempFilePath,
          {
            public_id: additionalFile.name,
            resource_type: "image",
            folder: "mascotas/ads",
            transformation: [
              { width: 1200, height: 800, crop: "limit" },
              { quality: "auto:good" },
            ],
          }
        );
        imageUrls.push(additionalResult.secure_url);
      }
    }

    if (result) {
      const adData = {
        id: id,
        business_id: business_id,
        content: content,
        title: title || content.substring(0, 50),
        description: description,
        category: category,
        add_link: result.secure_url,
        images: imageUrls,
        payment_method: method,
        billing_name: name,
        billing_address: address,
        is_featured: is_featured,
        target_audience: target_audience,
        schedule: {
          start_date: schedule.start_date
            ? new Date(schedule.start_date)
            : new Date(),
          end_date: schedule.end_date ? new Date(schedule.end_date) : null,
          time_slots: schedule.time_slots || [],
        },
        status: "active",
      };

      // Set featured duration if it's a featured ad
      if (is_featured) {
        const featured_until = new Date();
        featured_until.setDate(featured_until.getDate() + 30); // 30 days featured
        adData.featured_until = featured_until;
        adData.priority = 5; // High priority for featured ads
      }

      const data = await ads.create(adData);
      res.status(200).json({
        success: true,
        message: "Ad has been saved successfully",
        data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const findAds = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      location,
      featured_only = false,
      business_id,
    } = req.query;

    let query = { status: "active" };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by business
    if (business_id) {
      query.business_id = business_id;
    }

    // Filter featured ads only
    if (featured_only === "true") {
      query.is_featured = true;
      query.featured_until = { $gte: new Date() };
    }

    // Check if ads are within their schedule
    const currentDate = new Date();
    query.$or = [
      { "schedule.end_date": null },
      { "schedule.end_date": { $gte: currentDate } },
    ];

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: {
        is_featured: -1,
        priority: -1,
        createdAt: -1,
      },
      populate: {
        path: "business_id",
        select: "company_name company_logo physical_address phone",
      },
    };

    const data = await ads.paginate(query, options);

    res.status(200).json({
      success: true,
      message: "Ads fetched successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single ad with view tracking
const getAd = async (req, res) => {
  try {
    const { ad_id } = req.params;
    const { user_id } = req.query;

    const ad = await ads
      .findById(ad_id)
      .populate(
        "business_id",
        "company_name company_logo physical_address phone email"
      );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Increment view count
    await ads.findByIdAndUpdate(ad_id, {
      $inc: { "performance.views": 1 },
    });

    // Track analytics
    await trackAnalytics(ad.business_id._id, "ad_view", ad_id, "ad", user_id);

    res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Get ad error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ad",
      error: error.message,
    });
  }
};

// Track ad click
const trackAdClick = async (req, res) => {
  try {
    const { ad_id } = req.params;
    const { user_id } = req.body;

    const ad = await ads.findByIdAndUpdate(
      ad_id,
      { $inc: { "performance.clicks": 1 } },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Calculate CTR
    const ctr =
      ad.performance.views > 0
        ? ((ad.performance.clicks / ad.performance.views) * 100).toFixed(2)
        : 0;

    await ads.findByIdAndUpdate(ad_id, {
      "performance.ctr": ctr,
    });

    // Track analytics
    await trackAnalytics(ad.business_id, "ad_click", ad_id, "ad", user_id);

    res.status(200).json({
      success: true,
      message: "Click tracked successfully",
    });
  } catch (error) {
    console.error("Track ad click error:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking click",
      error: error.message,
    });
  }
};

// Make ad featured
const makeAdFeatured = async (req, res) => {
  try {
    const { ad_id } = req.params;
    const { duration_days = 30 } = req.body;

    const ad = await ads.findById(ad_id).populate("business_id");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check if business can create featured ads
    if (!ad.business_id.features.can_create_featured_ads) {
      return res.status(403).json({
        success: false,
        message:
          "Business does not have permission to create featured ads. Please upgrade to PetPro.",
      });
    }

    const featured_until = new Date();
    featured_until.setDate(featured_until.getDate() + parseInt(duration_days));

    await ads.findByIdAndUpdate(ad_id, {
      is_featured: true,
      featured_until,
      priority: 5,
    });

    res.status(200).json({
      success: true,
      message: "Ad is now featured",
      featured_until,
    });
  } catch (error) {
    console.error("Make ad featured error:", error);
    res.status(500).json({
      success: false,
      message: "Error making ad featured",
      error: error.message,
    });
  }
};

// Update ad
const updateAd = async (req, res) => {
  try {
    const { ad_id } = req.params;
    const updateData = req.body;

    // Handle new image uploads
    if (req.files?.picture) {
      const result = await cloudinary.uploader.upload(
        req.files.picture.tempFilePath,
        {
          public_id: req.files.picture.name,
          resource_type: "image",
          folder: "mascotas/ads",
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto:good" },
          ],
        }
      );
      updateData.add_link = result.secure_url;

      if (!updateData.images) updateData.images = [];
      updateData.images[0] = result.secure_url;
    }

    const ad = await ads
      .findByIdAndUpdate(ad_id, updateData, { new: true, runValidators: true })
      .populate("business_id", "company_name");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      data: ad,
    });
  } catch (error) {
    console.error("Update ad error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ad",
      error: error.message,
    });
  }
};

// Pause/Resume ad
const toggleAdStatus = async (req, res) => {
  try {
    const { ad_id } = req.params;
    const { action } = req.body;

    const newStatus = action === "pause" ? "paused" : "active";

    const ad = await ads.findByIdAndUpdate(
      ad_id,
      { status: newStatus },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Ad ${action}d successfully`,
      data: ad,
    });
  } catch (error) {
    console.error("Toggle ad status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ad status",
      error: error.message,
    });
  }
};

module.exports = {
  adsRegister,
  findAds,
  getAd,
  trackAdClick,
  makeAdFeatured,
  updateAd,
  toggleAdStatus,
};
