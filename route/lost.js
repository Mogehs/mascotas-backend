const express = require("express");
const router = express.Router();
const {
  lostPet,
  allLostPets,
  deletePet,
  updateLostPet,
} = require("../controller/lost");

router.post("/addLost", lostPet);
router.post("/all-lost-pets", allLostPets);
router.post("/delete", deletePet);
router.post("/update", updateLostPet);

module.exports = router;
