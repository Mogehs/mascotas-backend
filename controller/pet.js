const Pet = require("../model/pet");
const Lost = require("../model/lost");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

  const get_pet = async(req,res)=>{
    try {
      const { user} = req.body;
      console.log(req.body);
      let data = await Pet.find({ user: user });
      res.json({ success: true, message: "Pet information fetched successfully", pets_list: data});
      
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  }
  const petvaccine = async (req, res) => {
    try {
      const  {id,vaccine,vaccine_date,vaccine_reminder,vaccine_price,veterinary_managed} = req.body
   

      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: { 
             "pet_vaccine": vaccine,
              "pet_vaccine_date": vaccine_date,
              "pet_vaccine_reminder_date": vaccine_reminder,
              "pet_vaccine_price": vaccine_price,
              "veterinary_managed": veterinary_managed
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true,message: "Vaccine added successfully", pet_details: data });
      }
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const getVaccineReminder = async(req,res)=>{
    try {
      
      const vaccine = await Pet.findOne({ _id:req.body.id });
      res.status(200).json({success: true, message: "vaccine reminder fetched successfully",data: vaccine});
    } catch (error) {
      console.error('Error fetching pets:', error);
      res.status(500).json({success:false,  message: error.message });
    }
  }
  const petdeworming = async (req, res) => {
    try {
      const  {id,type,method,deworming_date,deworming_reminder,deworming_price,used_product} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "pet_deworming_type": type,
              "pet_deworming_method": method,
              "pet_deworming_date": deworming_date,
              "pet_deworming_reminder_date": deworming_reminder,
              "used_product_in_deworming": used_product,
               "pet_deworming_price":deworming_price,
            
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Deworming added successfully", pet_details: data })
      }
  
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petdisease = async (req, res) => {
    try {
      const  {id,name,title,description,diagnosis_date,start_date,end_date,reminder_date,diagnosis,price} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "pet_disease_name": name,
              "pet_disease_title":title,
              "pet_disease_description": description,
              "pet_date_diagnosis": diagnosis_date,
              "pet_treatment_start_date": start_date,
              "pet_treatment_end_date": end_date,
              "pet_treatment_remider_date": reminder_date,
              "pet_veterinarian_diagnosis": diagnosis,
              "pet_treatment_price": price
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Disease added successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petsurgery = async (req, res) => {
    try {
      const  {id,type,date,description,name,reminder_date,price} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "pet_surgery_type": type,
              "pet_date_surgery":date,
              "pet_description_surgery": description,
              "veterinarian_name": name,
              "post_operation_reminder": reminder_date,
              "surgery_price": price
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Surgery information added successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petmedicalcheckup = async (req, res) => {
    try {
      const  {id,date,results,name,reminder_date,price} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "medical_check_up_date": date,
              "check_results": results,
              "veterinarian": name,
              "next_check_up_reminder": reminder_date,
              "check_up_price": price,
             
            },
          },
          { new: true }
        );
        res.json({ success: true, message: "Regular medical checkup information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  }
  const petallergy = async (req, res) => {
    try {
      const  {id,type,title,symptoms,reminder_date} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "allergy_type": type,
              "allergy_title": title,
              "allergy_symptoms": symptoms,
              "allergy_reminder_date": reminder_date
             
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Allergy information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petdose = async (req, res) => {
    try {
      console.log(req.body);
      const  {id,name,dose,frequency,reminder_date,start_date,end_date,price} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "drug_name": name,
              "dosage": dose,
              "frequency": frequency,
              "dose_start_date": start_date,
              "dose_end_date": end_date,
              "dose_reminder": reminder_date,
              "dose_price": price
             
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Dose information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petdiet = async (req, res) => {
    try {
      const  {id,name,description,recommend,price,date} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "diet_name": name,
              "diet_description": description,
              "recommend": recommend,
              "diet_price": price,
              "diet_review_date": date
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Diet information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petactivity = async (req, res) => {
    try {
      const  {id,type,description,date,duration,travelled,altitude,location,difficult,fun} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "activity_type": type,
              "activity_description": description,
              "activity_date": date,
              "activity_duration": duration,
              "distance_traveled": travelled,
              "altitude_reached": altitude,
              "activity_location": location,
              "difficulty": difficult,
              "fun_level": fun
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Activity & Leisure information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const pethair = async (req, res) => {
    try {
      const  {id,service,description,date,price} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "hair_service": service,
              "hair_description": description,
              "date_served": date,
              "hair_price": price
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Pet hair information saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petEmergency = async (req, res) => {
    try {
      const  {id,name,phone,email,address} = req.body
      const check = await Pet.findOne({ _id: id });
      if (check) {
        const data = await Pet.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "emergency_veterinarian_name": name,
              "emergency_phone": phone,
              "emergency_email": email,
              "emergency_address": address
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Emergency contact saved successfully", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }


const postFavorite = async (req, res) => {
  try {
    const {id} = req.body;
    const data = await Pet.findOne({ _id: id });
    if (!data) {
      return res.status(400).json({ success: false, message: "Pet not found" })
    }
    const favExists = data.likes.some(fav => fav.id.equals(id));
    if (favExists) {
 const doc = await Pet.findByIdAndUpdate(
      data._id,
      { $unset: { likes: "" } },
      { new: true }
    );
     res.status(200).json({ success: true, message: "You removed from the favorite" });
  
    }else{
    data.likes.push(req.body);
    await data.save();
    return res.status(200).json({ success: true, message: "You favorite the pet." });
    }
   
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};



const pet_register = async (req, res) => {
  try {
      const {user,name,gender,dob,weight,height,microchip_number,race,description,color,pet} = req.body
      console.log(req.body)
      if (!req?.files?.picture)
        return res.status(400).json({success: false, message: "Please upload the ad image image."});
      const file = req.files.picture;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: file.name,
        resource_type: "image",
        folder: "mascotas",
      });
      if(result){
        const data = await Pet.create({
          user: user,
          pet_name: name,
          pet_gender: gender,
          pet_dob: dob,
          pet: pet,
          pet_race: race,
          pet_height: height,
          pet_weight: weight,
          pet_microchip_number: microchip_number,
          pet_description: description,
          pet_color:color,
          pet_image:  result.secure_url
         });
            res.json({ success: true, message: "Pet information saved successfully", data})
      }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};


  module.exports = {
    pet_register,
    get_pet,
    petvaccine,
    petdeworming,
    petdisease,
    petsurgery,
    petmedicalcheckup,
    petallergy,
    petdose,
    petdiet,
    petactivity,
    pethair,
    petEmergency,
    postFavorite,
    getVaccineReminder
  }