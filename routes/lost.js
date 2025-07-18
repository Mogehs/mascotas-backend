const express = require("express");
const router = express.Router();
const {
  lostPet,
  allLostPets,
  deletePet,
  updateLostPet,
  getLostPetById,
  notifyPetOwner,
} = require("../controller/lost");

router.post("/addLost", lostPet);
router.post("/all-lost-pets", allLostPets);
router.get("/:id", getLostPetById);
router.post("/delete", deletePet);
router.post("/update", updateLostPet);
router.post("/notify-owner", notifyPetOwner);

module.exports = router;
