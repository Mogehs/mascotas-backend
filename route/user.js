const express = require("express");
const router = express.Router();
const{login,registeruser,registerowner,fetchUsers,badge,business,checkEmail,resetPassword,userDetails,deleteDeviceToken,filterUsers} = require("../controller/user")
router.post("/register",registeruser);
 router.post("/login",login);
 router.post("/registerowner",registerowner);
 router.get("/fetch-users",fetchUsers);
router.post("/badge",badge);
router.post("/business",business);
router.post("/checkEmail",checkEmail);
router.post("/forgotPassword",resetPassword)
router.post("/owner",userDetails);
router.post("/logout",deleteDeviceToken);
router.post("/filter-users",filterUsers);


 module.exports = router