const express = require("express");
const aiController = require("../controller/ai");
const router = express.Router();

router.post("/veterinary", aiController.getVeterinaryAdvice);
router.post("/trainer", aiController.getTrainingAdvice);

module.exports = router;
