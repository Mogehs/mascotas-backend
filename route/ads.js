const express = require("express");
const router = express.Router();
const{adsRegister,findAds} = require("../controller/ads")
router.post("/ad-register",adsRegister);
router.post("/",findAds);

 module.exports = router