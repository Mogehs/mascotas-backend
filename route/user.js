const express = require("express");
const router = express.Router();
const{login,registeruser,registerowner,fetchUsers,badge,business} = require("../controller/user")
router.post("/register",registeruser);
 router.post("/login",login);
 router.post("/registerowner",registerowner);
 router.get("/fetch-users",fetchUsers);
router.post("/badge",badge);
router.post("/business",business);

 module.exports = router