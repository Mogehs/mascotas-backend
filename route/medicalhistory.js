const express = require("express");
const router = express.Router();
const{petvaccine,fetchMedicalHistory,petdeworming,petdisease,petsurgery,petmedicalcheckup,petallergy,petdose,petdiet,petactivity,pethair,petEmergency,updatevaccine} = require("../controller/medicalhistory")

router.post("/add_vaccine",petvaccine);
router.post("/",fetchMedicalHistory);
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
router.post("/update-vaccine",updatevaccine)



 module.exports = router