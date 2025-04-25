const express = require("express");
const router = express.Router();
const{adsRegister,findAds} = require("../controller/ads")
router.post("/ad-register",adsRegister);
router.get("/",findAds);

 module.exports = router