const express = require("express");
const router = express.Router();
const{pet_register,get_pet,petvaccine,petdeworming,petdisease,petsurgery,petmedicalcheckup,petallergy,petdose,petdiet,petactivity,pethair,petEmergency,postFavorite,getVaccineReminder} = require("../controller/pet")
const  upload = require('../config/multer');
router.post("/register_pet",pet_register);
router.post("/pets",get_pet);
router.post("/add_vaccine",petvaccine);
router.post("/add_deworming",petdeworming);
router.post("/add_diagnosis",petdisease)
router.post("/add_surgery",petsurgery)
router.post("/add_medical_checkup",petmedicalcheckup)
router.post("/add_allergy",petallergy)
router.post("/add_dose",petdose)
router.post('/add_diet',petdiet)
router.post("/add_activity",petactivity)
router.post("/add_hair",pethair)
router.post("/add_emergency",petEmergency)
router.post("/like",postFavorite);
router.post("/reminder",getVaccineReminder)


 module.exports = router