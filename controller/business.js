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
    } = req.body;
    console.log(req.body);
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
      message: "Business information saved successfully",
      business: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadBusinessImage = async (req, res) => {
  try {
    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the pet image." });
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
    const data = await Business.findByIdAndUpdate(
      { _id: req.body.uid },
      {
        $set: {
          latitude: req.body.lat,
          longitude: req.body.lon,
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
    } = req.body;
    console.log(req.body);

    const data = await Business.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
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
        },
      },
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

// PetPro Subscription Management
const activatePetProSubscription = async (req, res) => {
  try {
    const {
      business_id,
      subscription_type = "premium",
      payment_method,
      amount_paid = 49,
    } = req.body;

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

    // Define features based on subscription type
    const features =
      subscription_type === "premium"
        ? {
            can_create_featured_ads: true,
            max_featured_ads: 10,
            can_showcase_products: true,
            max_products: 100,
            can_create_promotions: true,
            max_promotions: 20,
            analytics_access: true,
          }
        : {
            can_create_featured_ads: true,
            max_featured_ads: 3,
            can_showcase_products: true,
            max_products: 25,
            can_create_promotions: true,
            max_promotions: 5,
            analytics_access: true,
          };

    const updatedBusiness = await Business.findByIdAndUpdate(
      business_id,
      {
        $set: {
          "petpro_subscription.is_active": true,
          "petpro_subscription.subscription_type": subscription_type,
          "petpro_subscription.start_date": currentDate,
          "petpro_subscription.end_date": endDate,
          "petpro_subscription.payment_status": "paid",
          "petpro_subscription.amount_paid": amount_paid,
          "petpro_subscription.payment_method": payment_method,
          features: features,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "PetPro subscription activated successfully",
      data: {
        subscription: updatedBusiness.petpro_subscription,
        features: updatedBusiness.features,
      },
    });
  } catch (error) {
    console.error("Activate PetPro subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error activating PetPro subscription",
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

    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
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
      message: "Subscription renewed successfully",
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

    await Business.findByIdAndUpdate(business_id, {
      $set: {
        "petpro_subscription.is_active": false,
        "petpro_subscription.payment_status": "cancelled",
        "petpro_subscription.auto_renewal": false,
        "features.can_create_featured_ads": false,
        "features.max_featured_ads": 0,
        "features.can_showcase_products": false,
        "features.max_products": 0,
        "features.can_create_promotions": false,
        "features.max_promotions": 0,
        "features.analytics_access": false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
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

    const features =
      new_subscription_type === "premium"
        ? {
            can_create_featured_ads: true,
            max_featured_ads: 10,
            can_showcase_products: true,
            max_products: 100,
            can_create_promotions: true,
            max_promotions: 20,
            analytics_access: true,
          }
        : {
            can_create_featured_ads: true,
            max_featured_ads: 3,
            can_showcase_products: true,
            max_products: 25,
            can_create_promotions: true,
            max_promotions: 5,
            analytics_access: true,
          };

    const updatedBusiness = await Business.findByIdAndUpdate(
      business_id,
      {
        $set: {
          "petpro_subscription.subscription_type": new_subscription_type,
          "petpro_subscription.payment_method": payment_method,
          "petpro_subscription.amount_paid": amount_paid,
          features: features,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
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

    // Find all businesses with active subscriptions that are expired
    const expiredBusinesses = await Business.find({
      "petpro_subscription.is_active": true,
      "petpro_subscription.end_date": { $lt: currentDate },
    });

    console.log(
      `Found ${expiredBusinesses.length} expired subscriptions to process`
    );

    // Expire each subscription
    const expiredPromises = expiredBusinesses.map(async (business) => {
      await Business.findByIdAndUpdate(business._id, {
        $set: {
          "petpro_subscription.is_active": false,
          "petpro_subscription.payment_status": "expired",
          "features.can_create_featured_ads": false,
          "features.max_featured_ads": 0,
          "features.can_showcase_products": false,
          "features.max_products": 0,
          "features.can_create_promotions": false,
          "features.max_promotions": 0,
          "features.analytics_access": false,
        },
      });

      console.log(
        `Expired subscription for business: ${business.company_name} (ID: ${business._id})`
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
      message: "Subscription expiration check completed",
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

module.exports = {
  businessRegister,
  uploadBusinessImage,
  uploadLatlng,
  getBusiness,
  updateBusiness,
  activatePetProSubscription,
  checkSubscriptionStatus,
  renewSubscription,
  cancelSubscription,
  upgradeSubscription,
  expireSubscriptions,
  expireSubscriptionsHelper,
};
