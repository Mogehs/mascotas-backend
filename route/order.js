const express = require("express");
const router = express.Router();

const { createOrder } = require("../controller/order");

router.post("/create", createOrder);

module.exports = router;
