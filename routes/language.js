const express = require("express");
const router = express.Router();
const { add, get } = require("../controller/language");

router.post("/add", add);
router.get("/get", get);

module.exports = router;
