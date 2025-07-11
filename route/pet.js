const express = require("express");
const router = express.Router();

const {
  pet_register,
  get_pet,
  postFavorite,
  dogmatch,
  deletePet,
  discard,
  get_pet_id,
} = require("../controller/pet");

const upload = require("../config/multer");

router.post("/register_pet", pet_register);
router.post("/pets", get_pet);
router.post("/:id", get_pet_id);
router.post("/like", postFavorite);
router.post("/match", dogmatch);
router.post("/delete", deletePet);
router.post("/discard", discard);

module.exports = router;
