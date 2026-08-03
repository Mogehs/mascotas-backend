const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
const Order = require("../model/order");
const User  = require("../model/user");
const Tag   = require("../model/tags");
const {
  sendNewOrderToAdmin,
  sendOrderConfirmationToUser,
  sendOrderStatusUpdateToUser,
  sendOrderStatusUpdateToAdmin,
} = require("../service/email.service");

const PAGE_SIZE = 20;

// ─── Create Order ─────────────────────────────────────────────────────────────

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      tag_id,
      payment_intent_id,   // required — from Stripe after Flutter confirms payment
      shipping_address,
      notes,
    } = req.body;

    if (!user_id)             return res.status(400).json({ success: false, message: "user_id is required" });
    if (!tag_id)              return res.status(400).json({ success: false, message: "tag_id is required" });
    if (!payment_intent_id)   return res.status(400).json({ success: false, message: "payment_intent_id is required" });

    // ── 1. Verify payment with Stripe ────────────────────────────────────────
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid payment_intent_id" });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Current status: ${paymentIntent.status}`,
      });
    }

    // Confirm this payment was created for the right tag and user
    const meta = paymentIntent.metadata || {};
    if (meta.type !== "tag_purchase") {
      return res.status(400).json({ success: false, message: "This payment intent is not for a tag purchase" });
    }
    if (meta.tag_id !== tag_id.toString()) {
      return res.status(400).json({ success: false, message: "Payment was not made for this tag" });
    }
    if (meta.user_id !== user_id.toString()) {
      return res.status(400).json({ success: false, message: "Payment does not belong to this user" });
    }

    // ── 2. Prevent reuse of the same payment ─────────────────────────────────
    const alreadyUsed = await Order.findOne({ payment_id: payment_intent_id });
    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: "This payment has already been used for an order" });
    }

    // ── 3. Resolve user and tag ───────────────────────────────────────────────
    const [user, tag] = await Promise.all([
      User.findById(user_id).select("firstname lastname email"),
      Tag.findById(tag_id).select("title price isActive"),
    ]);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!tag)  return res.status(404).json({ success: false, message: "Tag not found" });
    if (!tag.isActive) return res.status(400).json({ success: false, message: "This tag is no longer available" });

    // ── 4. Verify amount matches tag price ────────────────────────────────────
    const expectedCents = Math.round(tag.price * 100);
    if (paymentIntent.amount !== expectedCents) {
      return res.status(400).json({
        success: false,
        message: `Payment amount ($${paymentIntent.amount / 100}) does not match tag price ($${tag.price})`,
      });
    }

    // ── 5. Create order ───────────────────────────────────────────────────────
    const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim();

    const order = await Order.create({
      user:             user._id,
      tag:              tag._id,
      tag_title:        tag.title,
      user_name:        userName,
      user_email:       user.email || "",
      payment_id:       payment_intent_id,
      amount:           tag.price,
      shipping_address: shipping_address || "",
      notes:            notes || "",
      status:           "pending",
      status_history:   [{ status: "pending", notes: "Order placed" }],
    });

    // ── 6. Send emails in background ──────────────────────────────────────────
    const shortId = order._id.toString().slice(-8).toUpperCase();

    Promise.resolve(sendNewOrderToAdmin({
      orderId:         shortId,
      userName,
      userEmail:       user.email,
      tagTitle:        tag.title,
      amount:          tag.price,
      shippingAddress: shipping_address,
      paymentId:       payment_intent_id,
    })).catch((e) => console.error("Admin order email failed:", e.message));

    Promise.resolve(sendOrderConfirmationToUser({
      orderId:   shortId,
      userEmail: user.email,
      userName,
      tagTitle:  tag.title,
      amount:    tag.price,
    })).catch((e) => console.error("User order email failed:", e.message));

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Orders (Admin) ────────────────────────────────────────────────────

const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      page   = 1,
      limit  = PAGE_SIZE,
      search,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { user_name:  { $regex: search, $options: "i" } },
        { user_email: { $regex: search, $options: "i" } },
        { tag_title:  { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "firstname lastname email phone")
      .populate("tag",  "title price icons");

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page:  parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Order by ID ──────────────────────────────────────────────────────────

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstname lastname email phone")
      .populate("tag",  "title price icons");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Orders for a User ────────────────────────────────────────────────────

const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = PAGE_SIZE } = req.query;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments({ user: user_id });

    const orders = await Order.find({ user: user_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("tag", "title price icons");

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page:  parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getUserOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────

const VALID_STATUSES = ["pending", "processing", "on_the_way", "delivered", "cancelled"];

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a ${order.status} order`,
      });
    }

    order.status = status;
    if (notes) order.notes = notes;
    order.status_history.push({ status, notes: notes || "" });
    await order.save();

    const shortId = order._id.toString().slice(-8).toUpperCase();
    const emailPayload = {
      orderId:   shortId,
      userEmail: order.user_email,
      userName:  order.user_name,
      tagTitle:  order.tag_title,
      status,
      notes,
    };

    // Send emails in background
    Promise.resolve(sendOrderStatusUpdateToUser(emailPayload))
      .catch((e) => console.error("Status update user email failed:", e.message));
    Promise.resolve(sendOrderStatusUpdateToAdmin(emailPayload))
      .catch((e) => console.error("Status update admin email failed:", e.message));

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Order Stats (Admin) ──────────────────────────────────────────────────────

const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count:        { $sum: 1 },
          total_amount: { $sum: "$amount" },
        },
      },
    ]);

    const total = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        by_status: stats,
        total_orders: total,
        total_revenue: totalRevenue[0]?.revenue || 0,
      },
    });
  } catch (error) {
    console.error("getOrderStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getOrderStats,
};
