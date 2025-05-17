const express = require("express");
const router = express.Router();
const{petvaccine,fetchMedicalHistory,petdeworming,petdisease,petsurgery,petmedicalcheckup,petallergy,petdose,petdiet,petactivity,pethair,petEmergency,updatevaccine,updatedeworming,updatedisease,updatesurgery,updatemedicalcheckup,updateallergy,updatedose,updatediet,updatehair,updateactivity,fetchMedicalDetails,deleteMedical,registration} = require("../controller/medicalhistory")

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
router.post("/update-deworming",updatedeworming)
router.post("/update-diagnosis",updatedisease)
router.post("/update-surgery",updatesurgery)
router.post("/update-medicalcheckup",updatemedicalcheckup)
router.post("/update-allergy",updateallergy)
router.post("/update-dose",updatedose)
router.post("/update-vaccine",updatevaccine)
router.post("/update-diet",updatediet)
router.post("/update-activity",updateactivity)
router.post("/update-hair",updatehair)
router.post("/veterinary-card",fetchMedicalDetails)
router.post("/delete-medical",deleteMedical)
router.post("/personal",registration)


 module.exports = router