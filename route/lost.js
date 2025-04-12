const express = require("express");
const router = express.Router();
const{lostPet} = require("../controller/lost")
router.post("/post",lostPet);


 module.exports = router