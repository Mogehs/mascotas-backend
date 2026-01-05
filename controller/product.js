const Product = require("../model/product");
const Business = require("../model/business");
const Analytics = require("../model/analytics");
const { saveFile } = require("../utils/fileUpload.helper");

// Helper function for pagination
const paginate = async (model, query, options) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  let mongoQuery = model.find(query).skip(skip).limit(limit);

  if (options.sort) {
    mongoQuery = mongoQuery.sort(options.sort);
  }

  if (options.populate) {
    mongoQuery = mongoQuery.populate(options.populate);
  }

  const docs = await mongoQuery.exec();
  const totalDocs = await model.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limit);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

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

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      business_id,
      name,
      description,
      category,
      price,
      availability_status,
      specifications,
      tags,
      weight,
      dimensions,
      brand,
      model,
      contact_preference,
    } = req.body;

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
          "Active subscription required to showcase products. Please subscribe to unlock this feature.",
        subscription_status: {
          is_active: false,
          subscription_type: business.petpro_subscription.subscription_type,
        },
        action_required:
          "Subscribe to start showcasing your products and reach more customers.",
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
          "Your subscription has expired. Please renew to continue showcasing products.",
        subscription_status: {
          is_active: business.petpro_subscription.is_active,
          subscription_type: business.petpro_subscription.subscription_type,
          is_expired: true,
          end_date: business.petpro_subscription.end_date,
        },
        action_required:
          "Renew your subscription to continue showcasing products.",
      });
    }

    // Check if business can showcase products
    if (!business.features.can_showcase_products) {
      return res.status(403).json({
        success: false,
        message:
          "Product showcase not allowed with current subscription. Please upgrade your subscription.",
        current_limits: {
          max_products: business.features.max_products,
          subscription_type: business.petpro_subscription.subscription_type,
        },
      });
    }

    if (business.is_blocked) {
      return res.status(403).json({
        success: false,
        message: "Business is blocked by admin from showcasing products.",
      });
    }

    // Check product limit (only if not unlimited)
    if (business.features.max_products !== -1) {
      const currentProductCount = await Product.countDocuments({
        business_id,
        is_available: true,
      });
      if (currentProductCount >= business.features.max_products) {
        return res.status(403).json({
          success: false,
          message: `Product showcase limit reached. Current plan allows ${business.features.max_products} products.`,
        });
      }
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const uploadResult = await saveFile(file, "products");
        if (uploadResult.success) {
          imageUrls.push(uploadResult.url);
        }
      }
    }
    let parsedSpecifications = new Map();
    if (specifications) {
      try {
        // If it's already an object
        if (typeof specifications === "object") {
          parsedSpecifications = new Map(Object.entries(specifications));
        }
        // If it's a string (e.g. '{"color":"red","size":"M"}')
        else if (typeof specifications === "string") {
          const specObj = JSON.parse(specifications);
          parsedSpecifications = new Map(Object.entries(specObj));
        }
      } catch (err) {
        console.warn("Invalid specifications format:", specifications);
      }
    }

    const product = await Product.create({
      business_id,
      name,
      description,
      category,
      price,
      availability_status: availability_status || "in_stock",
      images: imageUrls,
      specifications: parsedSpecifications,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      weight,
      dimensions,
      brand,
      model,
      contact_preference: contact_preference || "both",
    });

    res.status(201).json({
      success: true,
      message: "Product showcase created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product showcase",
      error: error.message,
    });
  }
};

// Get all products for a business
const getBusinessProducts = async (req, res) => {
  try {
    const { business_id } = req.params;
    const {
      page = 1,
      limit = 10,
      category,
      is_featured,
      sort_by = "createdAt",
    } = req.query;

    const query = { business_id, is_available: true };

    if (category) query.category = category;
    if (is_featured !== undefined) {
      if (is_featured === "true") {
        // Only show featured products that haven't expired
        query.is_featured = true;
        query.$or = [
          { featured_until: { $gte: new Date() } },
          { featured_until: null },
        ];
      } else {
        query.is_featured = false;
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: -1 },
      populate: {
        path: "business_id",
        select: "company_name company_logo",
      },
    };

    const products = await paginate(Product, query, options);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get business products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get single product with view tracking
const getProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { user_id } = req.query;

    const product = await Product.findById(product_id).populate(
      "business_id",
      "company_name company_logo physical_address phone email website"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if business subscription is active to show product
    if (!product.business_id.petpro_subscription?.is_active) {
      return res.status(403).json({
        success: false,
        message: "Product not available - business subscription expired",
      });
    }

    // Track analytics (removed view count increment)
    await trackAnalytics(
      product.business_id._id,
      "product_view",
      product_id,
      "product",
      user_id
    );

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        contact_info: {
          phone: product.business_id.phone,
          email: product.business_id.email,
          website: product.business_id.website,
          address: product.business_id.physical_address,
          contact_preference: product.contact_preference,
        },
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      min_price,
      max_price,
      location,
      radius = 50,
      page = 1,
      limit = 20,
      sort_by = "featured",
      availability_status,
    } = req.query;

    let query = {
      is_available: true,
    };

    if (q) {
      query.$text = { $search: q };
    }

    if (category) {
      query.category = category;
    }

    if (availability_status) {
      query.availability_status = availability_status;
    }

    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    const now = new Date();
    const pipeline = [
      { $match: query },

      {
        $addFields: {
          is_currently_featured: {
            $cond: [
              {
                $and: [
                  { $eq: ["$is_featured", true] },
                  {
                    $or: [
                      { $gte: ["$featured_until", now] },
                      { $eq: ["$featured_until", null] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },

      {
        $lookup: {
          from: "businesses",
          localField: "business_id",
          foreignField: "_id",
          as: "business_id",
        },
      },

      { $unwind: "$business_id" },

      {
        $match: {
          "business_id.petpro_subscription.is_active": true,
        },
      },

      ...(q ? [{ $addFields: { score: { $meta: "textScore" } } }] : []),

      {
        $sort: (() => {
          let sortObj = { is_currently_featured: -1 };

          switch (sort_by) {
            case "price_low":
              sortObj.price = 1;
              break;
            case "price_high":
              sortObj.price = -1;
              break;
            case "newest":
              sortObj.createdAt = -1;
              break;
            case "popular":
              sortObj.views = -1;
              break;
            case "featured":
              sortObj.createdAt = -1;
              break;
            default:
              if (q) {
                sortObj.score = -1;
              } else {
                sortObj.createdAt = -1;
              }
          }

          return sortObj;
        })(),
      },

      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },

      {
        $project: {
          is_currently_featured: 0,
          score: 0,
        },
      },
    ];

    const products = await Product.aggregate(pipeline);

    // Update view count for all products in search results
    if (products.length > 0) {
      const productIds = products.map((product) => product._id);
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { views: 1 } }
      );
    }

    const countPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "businesses",
          localField: "business_id",
          foreignField: "_id",
          as: "business_id",
        },
      },
      { $unwind: "$business_id" },
      {
        $match: {
          "business_id.petpro_subscription.is_active": true,
        },
      },
      { $count: "total" },
    ];

    const countResult = await Product.aggregate(countPipeline);
    const totalDocs = countResult.length > 0 ? countResult[0].total : 0;

    const totalPages = Math.ceil(totalDocs / parseInt(limit));
    const currentPage = parseInt(page);

    const paginationData = {
      docs: products,
      totalDocs,
      limit: parseInt(limit),
      page: currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
    };

    res.status(200).json({
      success: true,
      data: paginationData,
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const updateData = req.body;

    // Handle new image uploads
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      let newImageUrls = [];
      for (const file of imageFiles) {
        const uploadResult = await saveFile(file, "products");
        if (uploadResult.success) {
          newImageUrls.push(uploadResult.url);
        }
      }

      if (updateData.replace_images === "true") {
        updateData.images = newImageUrls;
      } else {
        // Append new images to existing ones
        const existingProduct = await Product.findById(product_id);
        updateData.images = [
          ...(existingProduct.images || []),
          ...newImageUrls,
        ];
      }
    }

    // Handle specifications
    if (updateData.specifications) {
      updateData.specifications = new Map(
        Object.entries(updateData.specifications)
      );
    }

    // Handle tags
    if (updateData.tags && updateData.tags instanceof Array) {
      updateData.tags = updateData.tags.map((tag) => tag.trim());
    } else if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((tag) => tag.trim());
    }

    const product = await Product.findByIdAndUpdate(product_id, updateData, {
      new: true,
      runValidators: true,
    }).populate("business_id", "company_name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Make product featured
const makeProductFeatured = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { duration_days = 30 } = req.body;

    const product = await Product.findById(product_id).populate("business_id");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if business can create featured ads
    if (!product.business_id.features.can_create_featured_ads) {
      return res.status(403).json({
        success: false,
        message:
          "Business does not have permission to create featured products. Please upgrade to PetPro.",
      });
    }

    // Check current featured products count vs limit
    const currentFeaturedCount = await Product.countDocuments({
      business_id: product.business_id._id,
      is_featured: true,
      is_available: true,
      $or: [{ featured_until: { $gte: new Date() } }, { featured_until: null }],
    });

    if (currentFeaturedCount >= product.business_id.features.max_featured_ads) {
      return res.status(403).json({
        success: false,
        message: `Featured products limit reached. Current plan allows ${product.business_id.features.max_featured_ads} featured products. You currently have ${currentFeaturedCount} featured products.`,
      });
    }

    const featured_until = new Date();
    featured_until.setDate(featured_until.getDate() + parseInt(duration_days));

    await Product.findByIdAndUpdate(product_id, {
      is_featured: true,
      featured_until,
    });

    res.status(200).json({
      success: true,
      message: "Product is now featured",
      featured_until,
      featured_count: currentFeaturedCount + 1,
      max_featured_allowed: product.business_id.features.max_featured_ads,
    });
  } catch (error) {
    console.error("Make product featured error:", error);
    res.status(500).json({
      success: false,
      message: "Error making product featured",
      error: error.message,
    });
  }
};

// Helper function to expire featured products
const expireFeaturedProducts = async () => {
  try {
    const now = new Date();
    const result = await Product.updateMany(
      {
        is_featured: true,
        featured_until: { $lt: now },
      },
      {
        is_featured: false,
        featured_until: null,
      }
    );

    return {
      success: true,
      expired_count: result.modifiedCount,
      message: `${result.modifiedCount} featured products expired`,
    };
  } catch (error) {
    console.error("Expire featured products error:", error);
    return {
      success: false,
      error: error.message,
      expired_count: 0,
    };
  }
};

// Endpoint to manually expire featured products
const expireFeaturedProductsEndpoint = async (req, res) => {
  try {
    const result = await expireFeaturedProducts();

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Expire featured products endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Error expiring featured products",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await Product.findByIdAndUpdate(
      product_id,
      { is_available: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// Track product click
const trackProductClick = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { user_id } = req.body;

    const product = await Product.findByIdAndUpdate(
      product_id,
      { $inc: { inquiries: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Track analytics
    await trackAnalytics(
      product.business_id,
      "product_click",
      product_id,
      "product",
      user_id
    );

    res.status(200).json({
      success: true,
      message: "Interest tracked successfully",
    });
  } catch (error) {
    console.error("Track product click error:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking interest",
      error: error.message,
    });
  }
};

// Track contact clicks (phone/email)
const trackContactClick = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { user_id, contact_type } = req.body; // contact_type: 'phone', 'email', 'website'

    const product = await Product.findByIdAndUpdate(
      product_id,
      { $inc: { contact_clicks: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Track analytics with contact type
    await trackAnalytics(
      product.business_id,
      "product_contact",
      product_id,
      "product",
      user_id,
      { contact_type }
    );

    res.status(200).json({
      success: true,
      message: "Contact interaction tracked successfully",
    });
  } catch (error) {
    console.error("Track contact click error:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking contact interaction",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getBusinessProducts,
  getProduct,
  searchProducts,
  updateProduct,
  makeProductFeatured,
  deleteProduct,
  trackProductClick,
  trackContactClick,
  expireFeaturedProducts: expireFeaturedProductsEndpoint,
};
