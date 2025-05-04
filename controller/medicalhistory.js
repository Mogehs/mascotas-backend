const Medical = require("../model/medicalhistory");
const petvaccine = async (req, res) => {
    try {
      const  {id,vaccine,vaccine_date,vaccine_reminder,vaccine_price,veterinary_managed} = req.body
        const data = await Medical.create({
              "pet_vaccine": vaccine,
              "pet_vaccine_date": vaccine_date,
              "pet_vaccine_reminder_date": vaccine_reminder,
              "pet_vaccine_price": vaccine_price,
              "veterinary_managed": veterinary_managed,
              "pet": id
        });
        res.status(200).json({ success: true,message: "Vacuna añadida con éxito", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatevaccine = async (req, res) => {
    try {
      const  {id,vaccine,vaccine_date,vaccine_reminder,vaccine_price,veterinary_managed} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "pet_vaccine": vaccine,
              "pet_vaccine_date": vaccine_date,
              "pet_vaccine_reminder_date": vaccine_reminder,
              "pet_vaccine_price": vaccine_price,
              "veterinary_managed": veterinary_managed,
            },
          },
          { new: true }
        );

        res.status(200).json({ success: true,message: "Los datos de la vacuna han sido editados", id: data._id }); 
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const fetchMedicalHistory = async(req,res)=>{
    try {
      const { id} = req.body;
      console.log(req.body.id);
      let data = await Medical.find({ pet: id }).populate('pet', '_id pet_name pet_image')
      console.log(data);
      res.json({ success: true, message: "Pet information fetched successfully", data: data});
      
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  }
  const petdeworming = async (req, res) => {
    try {
      const  {id,type,method,deworming_date,deworming_reminder,deworming_price,used_product} = req.body
        const data = await Medical.create({
          "pet_deworming_type": type,
          "pet_deworming_method": method,
          "pet_deworming_date": deworming_date,
          "pet_deworming_reminder_date": deworming_reminder,
          "used_product_in_deworming": used_product,
           "pet_deworming_price":deworming_price,
           "pet": id
        });
        res.status(200).json({ success: true,message: "Desparasitación añadida con éxito", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatedeworming = async (req, res) => {
    try {
      const  {id,type,method,deworming_date,deworming_reminder,deworming_price,used_product} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
          { _id: check._id },
          {
            $set: {
              "pet_deworming_type": type,
              "pet_deworming_method": method,
              "pet_deworming_date": deworming_date,
              "pet_deworming_reminder_date": deworming_reminder,
              "used_product_in_deworming": used_product,
               "pet_deworming_price":deworming_price
            },
          },
          { new: true }
        );
        res.status(200).json({ success: true, message: "Desparasitación añadida con éxito", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petdisease = async (req, res) => {
    try {
      const  {id,name,title,description,diagnosis_date,start_date,end_date,reminder_date,diagnosis,price} = req.body
        const data = await Medical.create({
             "pet_disease_name": name,
              "pet_disease_title":title,
              "pet_disease_description": description,
              "pet_date_diagnosis": diagnosis_date,
              "pet_treatment_start_date": start_date,
              "pet_treatment_end_date": end_date,
              "pet_treatment_remider_date": reminder_date,
              "pet_veterinarian_diagnosis": diagnosis,
              "pet_treatment_price": price,
              "pet": id
        });
        res.status(200).json({ success: true,message: "Enfermedad agregada exitosamente", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatedisease = async (req, res) => {
    try {
      const  {id,name,title,description,diagnosis_date,start_date,end_date,reminder_date,diagnosis,price} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "Enfermedad agregada exitosamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petsurgery = async (req, res) => {
    try {
      const  {id,type,date,description,name,reminder_date,price} = req.body
        const data = await Medical.create({
          "pet_surgery_type": type,
          "pet_date_surgery":date,
          "pet_description_surgery": description,
          "veterinarian_name": name,
          "post_operation_reminder": reminder_date,
          "surgery_price": price,
              "pet": id
        });
        res.status(200).json({ success: true,message: "Información de cirugía agregada exitosamente.", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatesurgery = async (req, res) => {
    try {
      const  {id,type,date,description,name,reminder_date,price} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "Información de cirugía agregada exitosamente.", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petmedicalcheckup = async (req, res) => {
    try {
      const  {id,date,results,name,reminder_date,price} = req.body
        const data = await Medical.create({
          "medical_check_up_date": date,
          "check_results": results,
          "veterinarian": name,
          "next_check_up_reminder": reminder_date,
          "check_up_price": price,
              "pet": id
        });
        res.status(200).json({ success: true,message: "Información de chequeo médico regular guardada exitosamente", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatemedicalcheckup = async (req, res) => {
    try {
      const  {id,date,results,name,reminder_date,price} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.json({ success: true, message: "Información de chequeo médico regular guardada exitosamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  }
  const petallergy = async (req, res) => {
    try {
      const  {id,type,title,symptoms,reminder_date} = req.body
        const data = await Medical.create({
          "allergy_type": type,
              "allergy_title": title,
              "allergy_symptoms": symptoms,
              "allergy_reminder_date": reminder_date,
              "pet": id
        });
        res.status(200).json({ success: true,message: "Información sobre alergias guardada correctamente", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updateallergy = async (req, res) => {
    try {
      const  {id,type,title,symptoms,reminder_date} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "Información sobre alergias guardada correctamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petdose = async (req, res) => {
    try {
      const  {id,name,dose,frequency,reminder_date,start_date,end_date,price} = req.body
        const data = await Medical.create({
          "drug_name": name,
              "dosage": dose,
              "frequency": frequency,
              "dose_start_date": start_date,
              "dose_end_date": end_date,
              "dose_reminder": reminder_date,
              "dose_price": price,
              "pet": id
        });
        res.status(200).json({ success: true,message: "La información de la dosis se guardó correctamente", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatedose = async (req, res) => {
    try {
      console.log(req.body);
      const  {id,name,dose,frequency,reminder_date,start_date,end_date,price} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "La información de la dosis se guardó correctamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petdiet = async (req, res) => {
    try {
      const  {id,name,description,recommend,price,date} = req.body
        const data = await Medical.create({
          "diet_name": name,
          "diet_description": description,
          "recommend": recommend,
          "diet_price": price,
          "diet_review_date": date,
              "pet": id
        });
        res.status(200).json({ success: true,message: "La información de la dieta se guardó correctamente.", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatediet = async (req, res) => {
    try {
      const  {id,name,description,recommend,price,date} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "La información de la dieta se guardó correctamente.", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petactivity = async (req, res) => {
    try {
      const  {id,type,description,date,duration,travelled,altitude,location,difficult,fun} = req.body
        const data = await Medical.create({
          "activity_type": type,
              "activity_description": description,
              "activity_date": date,
              "activity_duration": duration,
              "distance_traveled": travelled,
              "altitude_reached": altitude,
              "activity_location": location,
              "difficulty": difficult,
              "fun_level": fun,
              "pet": id
        });
        res.status(200).json({ success: true,message: "Información de actividades y ocio guardada correctamente", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updateactivity = async (req, res) => {
    try {
      const  {id,type,description,date,duration,travelled,altitude,location,difficult,fun} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "Información de actividades y ocio guardada correctamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const pethair = async (req, res) => {
    try {
      const  {id,service,description,date,price} = req.body
        const data = await Medical.create({
          "hair_service": service,
              "hair_description": description,
              "date_served": date,
              "hair_price": price,
              "pet": id
        });
        res.status(200).json({ success: true,message: "La información del pelo de la mascota se guardó correctamente", id: data._id }); 
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const updatehair = async (req, res) => {
    try {
      const  {id,service,description,date,price} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "La información del pelo de la mascota se guardó correctamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const petEmergency = async (req, res) => {
    try {
      const  {id,name,phone,email,address} = req.body
      const check = await Medical.findOne({ pet: id });
      if (check) {
        const data = await Medical.findByIdAndUpdate(
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
        res.status(200).json({ success: true, message: "Contacto de emergencia guardado exitosamente", pet_details: data })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const fetchMedicalDetails = async(req,res)=>{
    try {
      const { id} = req.body;
      console.log(req.body.id);
      let data = await Medical.findOne({ pet: id }).populate('pet', '_id pet_name pet_image')
      console.log(data);
      res.json({ success: true, message: "Pet information fetched successfully", details: data});
      
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  }

  const deleteMedical = async (req, res) => {
    try {
      const  {id} = req.body
      console.log(id);
      const check = await Medical.findByIdAndDelete({_id: id});
        res.status(200).json({ success: true,message: "Los registros han sido eliminados" }); 
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  module.exports = {
    petvaccine,
    fetchMedicalHistory,
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
    updatevaccine,
    updateactivity,
    updateallergy,
    updatedeworming,
    updatedisease,
    updatediet,
    updatedose,
    updatemedicalcheckup,
    updatehair,
    updatesurgery,
    fetchMedicalDetails,
    deleteMedical
  }