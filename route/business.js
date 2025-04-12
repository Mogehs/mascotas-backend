const express = require("express");
const router = express.Router();
const{businessRegister} = require("../controller/business")
router.post("/register",businessRegister);

 module.exports = router