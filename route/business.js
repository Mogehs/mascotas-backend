const express = require("express");
const router = express.Router();
const{businessRegister,uploadBusinessImage,uploadLatlng,getBusiness} = require("../controller/business")
router.post("/register",businessRegister);
router.post("/image",uploadBusinessImage)
router.post("/latlng",uploadLatlng);
router.get("/",getBusiness);

 module.exports = router