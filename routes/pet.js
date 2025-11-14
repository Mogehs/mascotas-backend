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
  update_pet,
  // New dog match APIs
  createDogMatchPreferences,
  getDogMatchPreferences,
  getAllDogMatches,
  deactivateDogMatchPreferences,
  // New badge management APIs
  updateAllUserPetBadges,
  updatePetBadge,
} = require("../controller/pet");

const upload = require("../config/multer");

router.post("/register_pet", pet_register);
router.post("/pets", get_pet);
router.post("/like", postFavorite);
router.post("/match", dogmatch);
router.post("/delete", deletePet);
router.post("/discard", discard);
router.post("/:id", get_pet_id);
router.put("/:id", update_pet);

// New dog match routes
router.post("/dogmatch/preferences", createDogMatchPreferences);
router.post("/dogmatch/preferences/get", getDogMatchPreferences);
router.post("/dogmatch/preferences/all", getAllDogMatches);
router.post("/dogmatch/preferences/deactivate", deactivateDogMatchPreferences);

// New badge management routes
router.post("/badge/update-user-badges", updateAllUserPetBadges);
router.post("/badge/update-pet-badge", updatePetBadge);

module.exports = router;
