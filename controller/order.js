const Order = require("../model/order")
const createOrder = async(req,res)=>{
      try {
    const {user,payment_id,amount,badge} = req.body
  let check = await Order.findOne({ user: user });
  if (check) {
    return res.status(400).json({ success: false, message: "You have already placed your order." })
  } else {
    check = await Order.create({
        user: user,
        payment_id: payment_id,
        amount:amount,
        badge:badge
    });
    res.status(200).json({ success: true, message: "Your order has been placed."})
  }
} catch (error) {
  console.log(error.message);
  return res.status(500).json({ success: false, message: error.message });
}

}

module.exports = {
    createOrder
}