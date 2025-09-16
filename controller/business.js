const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_APP_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Business = require("../model/business");
const User = require("../model/user");

const businessRegister = async (req, res) => {
  try {
    const {
      id,
      name,
      type,
      description,
      branch,
      phone,
      email,
      website,
      address,
      operation_timings,
      tax,
      addition,
      latitude,
      longitude,
    } = req.body;

    // Basic required field validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!type || type.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company type is required",
      });
    }

    // Check if user exists
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already has a business registered
    const existingBusiness = await Business.findOne({ id: id });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "User already has a business registered",
        business_id: existingBusiness._id,
      });
    }

    // Validate coordinates if provided
    let validatedLatitude = null;
    let validatedLongitude = null;
    let geoLocation = null;

    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude. Must be between -90 and 90",
        });
      }

      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude. Must be between -180 and 180",
        });
      }

      validatedLatitude = lat;
      validatedLongitude = lon;
      geoLocation = {
        type: "Point",
        coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
      };
    }

    const data = await Business.create({
      id: id,
      company_name: name,
      company_type: type,
      company_description: description,
      branches: branch,
      phone: phone,
      email: email,
      website: website,
      additional: addition,
      physical_address: address,
      operation_timing: operation_timings,
      tax_identification_number: tax,
      latitude: validatedLatitude,
      longitude: validatedLongitude,
      location: geoLocation,
    });

    await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          company_registered: true,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Business registered successfully.",
      business: data._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadBusinessImage = async (req, res) => {
  try {
    // Validation for required fields
    if (!req.body.uid) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    if (!req?.files?.picture) {
      return res.status(400).json({
        success: false,
        message: "Please upload the business image",
      });
    }

    // Check if business exists
    const businessExists = await Business.findById(req.body.uid);
    if (!businessExists) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });

    if (result) {
      const data = await Business.findByIdAndUpdate(
        { _id: req.body.uid },
        {
          $set: {
            company_logo: result.secure_url,
          },
        },
        { new: true }
      );
      res
        .status(200)
        .json({ success: true, message: "Imagen cargada exitosamente" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadLatlng = async (req, res) => {
  try {
    // Validation for required fields
    if (!req.body.uid) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    if (!req.body.lat || !req.body.lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Validate latitude and longitude ranges
    const lat = parseFloat(req.body.lat);
    const lon = parseFloat(req.body.lon);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude. Must be between -90 and 90",
      });
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude. Must be between -180 and 180",
      });
    }

    // Check if business exists
    const businessExists = await Business.findById(req.body.uid);
    if (!businessExists) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const data = await Business.findByIdAndUpdate(
      { _id: req.body.uid },
      {
        $set: {
          latitude: lat,
          longitude: lon,
          location: {
            type: "Point",
            coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
          },
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "El formulario comercial se ha completado con éxito",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBusiness = async (req, res) => {
  try {
    const data = await Business.find();
    res
      .status(200)
      .json({ success: true, message: "Business are fetcched", data: data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const { business_id } = req.params;

    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Business details retrieved successfully",
      data: business,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBusinessByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find business by user ID and populate user details
    const business = await Business.findOne({ id: user_id }).populate(
      "id",
      "username email phone"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "No business found for this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Business details retrieved successfully",
      data: business,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBusiness = async (req, res) => {
  try {
    console.log("working");
    const {
      id,
      name,
      type,
      description,
      branch,
      phone,
      email,
      website,
      address,
      operation_timings,
      tax,
      addition,
      latitude,
      longitude,
    } = req.body;
    console.log(req.body);

    // Basic required field validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    // Check if business exists
    const businessExists = await Business.findById(id);
    if (!businessExists) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Prepare update data
    const updateData = {
      company_name: name,
      company_type: type,
      company_description: description,
      branches: branch,
      phone: phone,
      email: email,
      website: website,
      additional: addition,
      physical_address: address,
      operation_timing: operation_timings,
      tax_identification_number: tax,
    };

    // Validate and add coordinates if provided
    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude. Must be between -90 and 90",
        });
      }

      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude. Must be between -180 and 180",
        });
      }

      updateData.latitude = lat;
      updateData.longitude = lon;
      updateData.location = {
        type: "Point",
        coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
      };
    }

    const data = await Business.findByIdAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "El formulario comercial se ha completado con éxito",
      business: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Subscription Activation - Now only handles premium
const activatePetProSubscription = async (req, res) => {
  try {
    const {
      business_id,
      subscription_type = "premium",
      payment_method = "stripe",
      amount_paid = 0,
    } = req.body;

    // Basic validation
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    if (!subscription_type) {
      return res.status(400).json({
        success: false,
        message: "Subscription type is required (premium only)",
      });
    }

    // Only allow premium subscription
    if (subscription_type !== "premium") {
      return res.status(400).json({
        success: false,
        message:
          "Only premium subscription is available. Basic plan has been discontinued.",
      });
    }

    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

    // Premium plan features - unlimited everything
    const premiumFeatures = {
      can_create_featured_ads: true,
      max_featured_ads: -1, // Unlimited
      can_showcase_products: true,
      max_products: -1, // Unlimited
      can_create_promotions: true,
      max_promotions: -1, // Unlimited
      analytics_access: true,
    };

    const expectedAmount = 49; // $49 for premium

    // Validate payment amount
    if (amount_paid < expectedAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient payment. Premium plan costs $${expectedAmount}, received $${amount_paid}`,
      });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      business_id,
      {
        $set: {
          "petpro_subscription.is_active": true,
          "petpro_subscription.subscription_type": "premium",
          "petpro_subscription.start_date": currentDate,
          "petpro_subscription.end_date": endDate,
          "petpro_subscription.payment_status": "paid",
          "petpro_subscription.amount_paid": amount_paid,
          "petpro_subscription.payment_method": payment_method,
          features: premiumFeatures,
        },
      },
      { new: true }
    );

    // Update user subscription status
    await User.findByIdAndUpdate(
      { _id: business.id },
      {
        $set: {
          business_subscription: true,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Premium subscription activated successfully",
      data: {
        subscription: updatedBusiness.petpro_subscription,
        features: updatedBusiness.features,
      },
    });
  } catch (error) {
    console.error("Activate subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error activating subscription",
      error: error.message,
    });
  }
};

const checkSubscriptionStatus = async (req, res) => {
  try {
    const { business_id } = req.params;

    const business = await Business.findById(business_id).select(
      "petpro_subscription features statistics company_name"
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

    // Note: Manual expiration removed - now handled by cron job
    // The cron job automatically expires subscriptions daily at 12:01 AM

    res.status(200).json({
      success: true,
      data: {
        business_name: business.company_name,
        subscription: business.petpro_subscription,
        features: business.features,
        statistics: business.statistics,
        is_expired: isExpired,
      },
    });
  } catch (error) {
    console.error("Check subscription status error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking subscription status",
      error: error.message,
    });
  }
};

const renewSubscription = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { payment_method, amount_paid = 49 } = req.body;

    // Basic validation
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Validate amount
    if (amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid must be greater than 0",
      });
    }

    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Only allow renewal of premium subscriptions
    if (business.petpro_subscription.subscription_type !== "premium") {
      return res.status(400).json({
        success: false,
        message:
          "Only premium subscriptions can be renewed. Basic plan is permanent.",
      });
    }

    if (!business.petpro_subscription.is_active) {
      return res.status(400).json({
        success: false,
        message: "No active premium subscription to renew",
      });
    }

    const currentDate = new Date();
    const newEndDate = new Date(
      Math.max(
        currentDate.getTime(),
        business.petpro_subscription.end_date?.getTime() || 0
      )
    );
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    await Business.findByIdAndUpdate(business_id, {
      $set: {
        "petpro_subscription.is_active": true,
        "petpro_subscription.end_date": newEndDate,
        "petpro_subscription.payment_status": "paid",
        "petpro_subscription.amount_paid": amount_paid,
        "petpro_subscription.payment_method": payment_method,
      },
    });

    res.status(200).json({
      success: true,
      message: "Premium subscription renewed successfully",
      new_end_date: newEndDate,
    });
  } catch (error) {
    console.error("Renew subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error renewing subscription",
      error: error.message,
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { reason } = req.body;

    // Basic validation
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    // Check if business exists and has active subscription
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.petpro_subscription.is_active) {
      return res.status(400).json({
        success: false,
        message: "No active subscription to cancel",
      });
    }

    // Cancel premium subscription - revert to no subscription
    if (business.petpro_subscription.subscription_type === "premium") {
      await Business.findByIdAndUpdate(business_id, {
        $set: {
          "petpro_subscription.is_active": false,
          "petpro_subscription.subscription_type": "none",
          "petpro_subscription.payment_status": "cancelled",
          "petpro_subscription.amount_paid": 0,
          "petpro_subscription.payment_method": "none",
          "petpro_subscription.end_date": null,
          "features.can_create_featured_ads": false,
          "features.max_featured_ads": 0,
          "features.can_showcase_products": false,
          "features.max_products": 0,
          "features.can_create_promotions": false,
          "features.max_promotions": 0,
          "features.analytics_access": false,
        },
      });

      // Update user subscription status
      await User.findByIdAndUpdate(
        { _id: business.id },
        {
          $set: {
            business_subscription: false,
          },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message:
          "Premium subscription cancelled. All features disabled until you subscribe again.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No active premium subscription found to cancel.",
      });
    }
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling subscription",
      error: error.message,
    });
  }
};

const upgradeSubscription = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { new_subscription_type, payment_method, amount_paid } = req.body;

    // Basic validation
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    if (!new_subscription_type) {
      return res.status(400).json({
        success: false,
        message: "New subscription type is required",
      });
    }

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    if (!amount_paid || amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount paid is required",
      });
    }

    // Validate subscription type - only allow upgrade to premium
    if (new_subscription_type !== "premium") {
      return res.status(400).json({
        success: false,
        message: "Can only upgrade to premium. Basic plan is the default.",
      });
    }

    // Check if business exists and has active subscription
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.petpro_subscription.is_active) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Check if already premium
    if (business.petpro_subscription.subscription_type === "premium") {
      return res.status(400).json({
        success: false,
        message: "Business already has premium subscription",
      });
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year premium subscription

    const premiumFeatures = {
      can_create_featured_ads: true,
      max_featured_ads: 10,
      can_showcase_products: true,
      max_products: 100,
      can_create_promotions: true,
      max_promotions: 20,
      analytics_access: true,
    };

    const updatedBusiness = await Business.findByIdAndUpdate(
      business_id,
      {
        $set: {
          "petpro_subscription.subscription_type": "premium",
          "petpro_subscription.start_date": currentDate,
          "petpro_subscription.end_date": endDate,
          "petpro_subscription.payment_status": "paid",
          "petpro_subscription.payment_method": payment_method,
          "petpro_subscription.amount_paid": amount_paid,
          features: premiumFeatures,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Successfully upgraded from basic to premium",
      data: {
        subscription: updatedBusiness.petpro_subscription,
        features: updatedBusiness.features,
      },
    });
  } catch (error) {
    console.error("Upgrade subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error upgrading subscription",
      error: error.message,
    });
  }
};

// Helper function for subscription expiration (used by cron job and API)
const expireSubscriptionsHelper = async () => {
  try {
    const currentDate = new Date();

    // Find all businesses with active premium subscriptions that are expired
    const expiredBusinesses = await Business.find({
      "petpro_subscription.is_active": true,
      "petpro_subscription.subscription_type": "premium", // Only expire premium subscriptions
      "petpro_subscription.end_date": { $lt: currentDate },
    });

    console.log(
      `Found ${expiredBusinesses.length} expired premium subscriptions to process`
    );

    // Revert each premium subscription to no subscription (0 limits)
    const expiredPromises = expiredBusinesses.map(async (business) => {
      await Business.findByIdAndUpdate(business._id, {
        $set: {
          is_blocked: true,
          "petpro_subscription.is_active": false,
          "petpro_subscription.subscription_type": "none",
          "petpro_subscription.payment_status": "expired",
          "petpro_subscription.amount_paid": 0,
          "petpro_subscription.payment_method": "none",
          "petpro_subscription.end_date": null,
          "features.can_create_featured_ads": false,
          "features.max_featured_ads": 0,
          "features.can_showcase_products": false,
          "features.max_products": 0,
          "features.can_create_promotions": false,
          "features.max_promotions": 0,
          "features.analytics_access": false,
        },
      });

      await User.findByIdAndUpdate(
        { _id: business.id },
        {
          $set: {
            business_subscription: false,
          },
        },
        { new: true }
      );

      console.log(
        `Expired premium subscription for business: ${business.company_name} (ID: ${business._id}) - All features disabled`
      );
      return business._id;
    });

    const expiredIds = await Promise.all(expiredPromises);

    return {
      success: true,
      expired_count: expiredIds.length,
      expired_business_ids: expiredIds,
    };
  } catch (error) {
    console.error("Error in expireSubscriptionsHelper:", error);
    throw error;
  }
};

// Manual endpoint to expire subscriptions (for testing)
const expireSubscriptions = async (req, res) => {
  try {
    const result = await expireSubscriptionsHelper();

    res.status(200).json({
      success: true,
      message:
        "Premium subscription expiration check completed. Expired premiums reverted to basic plan.",
      data: result,
    });
  } catch (error) {
    console.error("Manual expire subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error expiring subscriptions",
      error: error.message,
    });
  }
};

// Get businesses by location radius for map display
const getBusinessesByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in kilometers, default 10km

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Validate coordinate ranges
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude. Must be between -90 and 90",
      });
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude. Must be between -180 and 180",
      });
    }

    if (isNaN(radiusKm) || radiusKm <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid radius. Must be a positive number",
      });
    }

    // Find businesses within the specified radius using GeoJSON
    const businesses = await Business.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      },
      "petpro_subscription.is_active": true, // Only show businesses with active subscriptions
      is_blocked: false, // Only show non-blocked businesses
    }).populate("id", "firstname lastname email phone");

    res.status(200).json({
      success: true,
      message: `Found ${businesses.length} businesses within ${radiusKm}km`,
      data: businesses,
      center: { latitude: lat, longitude: lon },
      radius: radiusKm,
    });
  } catch (error) {
    console.error("Get businesses by location error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching businesses by location",
      error: error.message,
    });
  }
};

// Get all businesses with valid coordinates for map display
const getBusinessesForMap = async (req, res) => {
  try {
    const businesses = await Business.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
      is_blocked: false, // Only show non-blocked businesses
    })
      .select(
        "company_name company_type physical_address latitude longitude location company_logo phone email website"
      )
      .populate("id", "firstname lastname email phone");

    res.status(200).json({
      success: true,
      message: `Found ${businesses.length} businesses with location data`,
      data: businesses,
    });
  } catch (error) {
    console.error("Get businesses for map error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching businesses for map",
      error: error.message,
    });
  }
};

module.exports = {
  businessRegister,
  uploadBusinessImage,
  uploadLatlng,
  getBusiness,
  getBusinessByUserId,
  updateBusiness,
  activatePetProSubscription,
  checkSubscriptionStatus,
  renewSubscription,
  cancelSubscription,
  upgradeSubscription,
  expireSubscriptions,
  expireSubscriptionsHelper,
  getBusinessesByLocation,
  getBusinessesForMap,
  getBusinessById,
};
