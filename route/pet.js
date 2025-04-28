const express = require("express");
const router = express.Router();
const{pet_register,get_pet,postFavorite} = require("../controller/pet")
const  upload = require('../config/multer');
router.post("/register_pet",pet_register);
router.post("/pets",get_pet);
router.post("/like",postFavorite);
 module.exports = router