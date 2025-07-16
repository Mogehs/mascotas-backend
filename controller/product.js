const cloudinary = require("cloudinary").v2;
const Product = require("../model/product");
const Business = require("../model/business");
const Analytics = require("../model/analytics");

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
    if (!business || !business.features.can_showcase_products) {
      return res.status(403).json({
        success: false,
        message:
          "Business does not have permission to showcase products. Please upgrade to PetPro.",
      });
    }

    // Check product limit
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

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "petpro_products",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto:good" },
          ],
        });
        imageUrls.push(result.secure_url);
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
      specifications: specifications
        ? new Map(Object.entries(specifications))
        : new Map(),
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
    if (is_featured !== undefined) query.is_featured = is_featured === "true";

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

    // Increment view count
    await Product.findByIdAndUpdate(product_id, { $inc: { views: 1 } });

    // Track analytics
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
      sort_by = "relevance",
      availability_status,
    } = req.query;

    // Only show products from active PetPro businesses
    let query = {
      is_available: true,
    };
    let sort = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Availability filter
    if (availability_status) {
      query.availability_status = availability_status;
    }

    // Price range filter
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    // Sorting
    switch (sort_by) {
      case "price_low":
        sort = { price: 1 };
        break;
      case "price_high":
        sort = { price: -1 };
        break;
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "popular":
        sort = { views: -1 };
        break;
      case "featured":
        sort = { is_featured: -1, createdAt: -1 };
        break;
      default:
        sort = q ? { score: { $meta: "textScore" } } : { createdAt: -1 };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: {
        path: "business_id",
        select:
          "company_name company_logo physical_address phone email petpro_subscription",
        match: { "petpro_subscription.is_active": true },
      },
    };

    const products = await paginate(Product, query, options);

    products.docs = products.docs.filter(
      (product) => product.business_id !== null
    );

    res.status(200).json({
      success: true,
      data: products,
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
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "petpro_products",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto:good" },
          ],
        });
        newImageUrls.push(result.secure_url);
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
    if (updateData.tags && typeof updateData.tags === "string") {
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
};
