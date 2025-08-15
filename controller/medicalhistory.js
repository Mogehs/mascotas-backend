const Medical = require("../model/medicalhistory");
const cronService = require("../service/cron.service");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_APP_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to schedule multiple reminders
const scheduleMultipleReminders = async (
  medicalRecordId,
  reminderFieldType,
  reminderTimes
) => {
  try {
    console.log(`scheduleMultipleReminders called with:`, {
      medicalRecordId,
      reminderFieldType,
      reminderTimes: JSON.stringify(reminderTimes, null, 2),
    });

    for (const reminderDay of reminderTimes) {
      const { date, times } = reminderDay;

      if (times && Array.isArray(times)) {
        for (const time of times) {
          let fullDateTime;

          // Handle different input formats
          if (time.includes("T") || time.includes("Z")) {
            // If time is already an ISO string, use it directly
            fullDateTime = time;
          } else {
            // Combine date and time into a full datetime string
            fullDateTime = `${date} ${time}`;
          }

          console.log(
            `Scheduling reminder: ${fullDateTime} for record ${medicalRecordId}`
          );

          // Schedule individual reminder
          const scheduled = await cronService.scheduleSpecificReminder(
            medicalRecordId,
            reminderFieldType,
            fullDateTime
          );

          if (!scheduled) {
            console.error(`Failed to schedule reminder: ${fullDateTime}`);
          } else {
            console.log(`Successfully scheduled reminder: ${fullDateTime}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling multiple reminders:", error);
  }
};
const petvaccine = async (req, res) => {
  try {
    const {
      id,
      vaccine,
      vaccine_date,
      vaccine_reminder,
      vaccine_reminder_times, // New field for multiple reminder times
      vaccine_price,
      veterinary_managed,
      user,
    } = req.body;

    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image image." });
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if (result) {
      // Create medical record data
      const medicalData = {
        pet_vaccine: vaccine,
        pet_vaccine_date: vaccine_date,
        pet_vaccine_reminder_date: vaccine_reminder,
        pet_vaccine_price: vaccine_price,
        veterinary_managed: veterinary_managed,
        pet_vaccine_image: result.secure_url,
        pet: id,
        user: user,
      };

      // Add multiple reminder times if provided
      if (
        vaccine_reminder_times &&
        Array.isArray(vaccine_reminder_times) &&
        vaccine_reminder_times.length > 0
      ) {
        medicalData.pet_vaccine_reminder_times = vaccine_reminder_times;
      }

      const data = await Medical.create(medicalData);

      // Schedule reminders for multiple times if provided
      if (vaccine_reminder_times && Array.isArray(vaccine_reminder_times)) {
        await scheduleMultipleReminders(
          data._id,
          "pet_vaccine_reminder_times",
          vaccine_reminder_times
        );
      } else if (vaccine_reminder && vaccine_reminder !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          data._id,
          "pet_vaccine_reminder_date",
          vaccine_reminder
        );
      }

      res.status(200).json({
        success: true,
        message: "Vacuna añadida con éxito",
        id: data._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatevaccine = async (req, res) => {
  try {
    const {
      id,
      vaccine,
      vaccine_date,
      vaccine_reminder,
      vaccine_reminder_times, // New field for multiple reminder times
      vaccine_price,
      veterinary_managed,
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        pet_vaccine: vaccine,
        pet_vaccine_date: vaccine_date,
        pet_vaccine_reminder_date: vaccine_reminder,
        pet_vaccine_price: vaccine_price,
        veterinary_managed: veterinary_managed,
      };

      // Add multiple reminder times if provided
      if (
        vaccine_reminder_times &&
        Array.isArray(vaccine_reminder_times) &&
        vaccine_reminder_times.length > 0
      ) {
        updateData.pet_vaccine_reminder_times = vaccine_reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (vaccine_reminder_times && Array.isArray(vaccine_reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "pet_vaccine_reminder_times",
          vaccine_reminder_times
        );
      } else if (vaccine_reminder && vaccine_reminder !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "pet_vaccine_reminder_date",
          vaccine_reminder
        );
      }

      res.status(200).json({
        success: true,
        message: "Los datos de la vacuna han sido editados",
        id: data._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const fetchMedicalHistory = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body.id);
    let data = await Medical.find({ pet: id }).populate(
      "pet",
      "_id pet_name pet_image"
    );
    console.log(data);
    res.json({
      success: true,
      message: "Pet information fetched successfully",
      data: data,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
const petdeworming = async (req, res) => {
  try {
    const {
      id,
      type,
      method,
      deworming_date,
      deworming_reminder,
      deworming_reminder_times, // New field for multiple reminder times
      deworming_price,
      used_product,
      user,
    } = req.body;
    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image image." });
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if (result) {
      // Create medical record data
      const medicalData = {
        pet_deworming_type: type,
        pet_deworming_method: method,
        pet_deworming_date: deworming_date,
        pet_deworming_reminder_date: deworming_reminder,
        used_product_in_deworming: used_product,
        pet_deworming_price: deworming_price,
        pet_deworming_image: result.secure_url,
        pet: id,
        user: user,
      };

      // Add multiple reminder times if provided
      if (
        deworming_reminder_times &&
        Array.isArray(deworming_reminder_times) &&
        deworming_reminder_times.length > 0
      ) {
        medicalData.pet_deworming_reminder_times = deworming_reminder_times;
      }

      const data = await Medical.create(medicalData);

      // Schedule reminders for multiple times if provided
      if (deworming_reminder_times && Array.isArray(deworming_reminder_times)) {
        await scheduleMultipleReminders(
          data._id,
          "pet_deworming_reminder_times",
          deworming_reminder_times
        );
      } else if (deworming_reminder && deworming_reminder !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          data._id,
          "pet_deworming_reminder_date",
          deworming_reminder
        );
      }

      res.status(200).json({
        success: true,
        message: "Desparasitación añadida con éxito",
        id: data._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatedeworming = async (req, res) => {
  try {
    const {
      id,
      type,
      method,
      deworming_date,
      deworming_reminder,
      deworming_reminder_times, // New field for multiple reminder times
      deworming_price,
      used_product,
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        pet_deworming_type: type,
        pet_deworming_method: method,
        pet_deworming_date: deworming_date,
        pet_deworming_reminder_date: deworming_reminder,
        used_product_in_deworming: used_product,
        pet_deworming_price: deworming_price,
      };

      // Add multiple reminder times if provided
      if (
        deworming_reminder_times &&
        Array.isArray(deworming_reminder_times) &&
        deworming_reminder_times.length > 0
      ) {
        updateData.pet_deworming_reminder_times = deworming_reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (deworming_reminder_times && Array.isArray(deworming_reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "pet_deworming_reminder_times",
          deworming_reminder_times
        );
      } else if (deworming_reminder && deworming_reminder !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "pet_deworming_reminder_date",
          deworming_reminder
        );
      }

      res.status(200).json({
        success: true,
        message: "Desparasitación añadida con éxito",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petdisease = async (req, res) => {
  try {
    const {
      id,
      name,
      title,
      description,
      diagnosis_date,
      start_date,
      end_date,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      diagnosis,
      price,
      user,
    } = req.body;

    // Create medical record data
    const medicalData = {
      pet_disease_name: name,
      pet_disease_title: title,
      pet_disease_description: description,
      pet_date_diagnosis: diagnosis_date,
      pet_treatment_start_date: start_date,
      pet_treatment_end_date: end_date,
      pet_treatment_remider_date: reminder_date,
      pet_veterinarian_diagnosis: diagnosis,
      pet_treatment_price: price,
      pet: id,
      user: user,
    };

    // Add multiple reminder times if provided
    if (
      reminder_times &&
      Array.isArray(reminder_times) &&
      reminder_times.length > 0
    ) {
      medicalData.pet_treatment_reminder_times = reminder_times;
    }

    const data = await Medical.create(medicalData);

    // Schedule reminders for multiple times if provided
    if (reminder_times && Array.isArray(reminder_times)) {
      await scheduleMultipleReminders(
        data._id,
        "pet_treatment_reminder_times",
        reminder_times
      );
    } else if (reminder_date && reminder_date !== "N/A") {
      // Fallback to single reminder
      cronService.scheduleSpecificReminder(
        data._id,
        "pet_treatment_remider_date",
        reminder_date
      );
    }

    res.status(200).json({
      success: true,
      message: "Enfermedad agregada exitosamente",
      id: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatedisease = async (req, res) => {
  try {
    const {
      id,
      name,
      title,
      description,
      diagnosis_date,
      start_date,
      end_date,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      diagnosis,
      price,
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        pet_disease_name: name,
        pet_disease_title: title,
        pet_disease_description: description,
        pet_date_diagnosis: diagnosis_date,
        pet_treatment_start_date: start_date,
        pet_treatment_end_date: end_date,
        pet_treatment_remider_date: reminder_date,
        pet_veterinarian_diagnosis: diagnosis,
        pet_treatment_price: price,
      };

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.pet_treatment_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "pet_treatment_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "pet_treatment_remider_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "Enfermedad agregada exitosamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petsurgery = async (req, res) => {
  try {
    const {
      id,
      type,
      date,
      description,
      name,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      price,
      user,
    } = req.body;

    // Create medical record data
    const medicalData = {
      pet_surgery_type: type,
      pet_date_surgery: date,
      pet_description_surgery: description,
      veterinarian_name: name,
      post_operation_reminder: reminder_date,
      surgery_price: price,
      pet: id,
      user: user,
    };

    // Add multiple reminder times if provided
    if (
      reminder_times &&
      Array.isArray(reminder_times) &&
      reminder_times.length > 0
    ) {
      medicalData.post_operation_reminder_times = reminder_times;
    }

    const data = await Medical.create(medicalData);

    // Schedule reminders for multiple times if provided
    if (reminder_times && Array.isArray(reminder_times)) {
      await scheduleMultipleReminders(
        data._id,
        "post_operation_reminder_times",
        reminder_times
      );
    } else if (reminder_date && reminder_date !== "N/A") {
      // Fallback to single reminder
      cronService.scheduleSpecificReminder(
        data._id,
        "post_operation_reminder",
        reminder_date
      );
    }

    res.status(200).json({
      success: true,
      message: "Información de cirugía agregada exitosamente.",
      id: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatesurgery = async (req, res) => {
  try {
    const {
      id,
      type,
      date,
      description,
      name,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      price,
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        pet_surgery_type: type,
        pet_date_surgery: date,
        pet_description_surgery: description,
        veterinarian_name: name,
        post_operation_reminder: reminder_date,
        surgery_price: price,
      };

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.post_operation_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "post_operation_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "post_operation_reminder",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "Información de cirugía agregada exitosamente.",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petmedicalcheckup = async (req, res) => {
  try {
    const {
      id,
      date,
      results,
      name,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      price,
      user,
    } = req.body;

    // Create medical record data
    const medicalData = {
      medical_check_up_date: date,
      check_results: results,
      veterinarian: name,
      next_check_up_reminder: reminder_date,
      check_up_price: price,
      pet: id,
      user: user,
    };

    // Add multiple reminder times if provided
    if (
      reminder_times &&
      Array.isArray(reminder_times) &&
      reminder_times.length > 0
    ) {
      medicalData.next_check_up_reminder_times = reminder_times;
    }

    const data = await Medical.create(medicalData);

    // Schedule reminders for multiple times if provided
    if (reminder_times && Array.isArray(reminder_times)) {
      await scheduleMultipleReminders(
        data._id,
        "next_check_up_reminder_times",
        reminder_times
      );
    } else if (reminder_date && reminder_date !== "N/A") {
      // Fallback to single reminder
      cronService.scheduleSpecificReminder(
        data._id,
        "next_check_up_reminder",
        reminder_date
      );
    }

    res.status(200).json({
      success: true,
      message: "Información de chequeo médico regular guardada exitosamente",
      id: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatemedicalcheckup = async (req, res) => {
  try {
    const {
      id,
      date,
      results,
      name,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      price,
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        medical_check_up_date: date,
        check_results: results,
        veterinarian: name,
        next_check_up_reminder: reminder_date,
        check_up_price: price,
      };

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.next_check_up_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "next_check_up_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "next_check_up_reminder",
          reminder_date
        );
      }

      res.json({
        success: true,
        message: "Información de chequeo médico regular guardada exitosamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
const petallergy = async (req, res) => {
  try {
    const {
      id,
      type,
      title,
      symptoms,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      user,
    } = req.body;

    // Create medical record data
    const medicalData = {
      allergy_type: type,
      allergy_title: title,
      allergy_symptoms: symptoms,
      allergy_reminder_date: reminder_date,
      pet: id,
      user: user,
    };

    // Add multiple reminder times if provided
    if (
      reminder_times &&
      Array.isArray(reminder_times) &&
      reminder_times.length > 0
    ) {
      medicalData.allergy_reminder_times = reminder_times;
    }

    const data = await Medical.create(medicalData);

    // Schedule reminders for multiple times if provided
    if (reminder_times && Array.isArray(reminder_times)) {
      await scheduleMultipleReminders(
        data._id,
        "allergy_reminder_times",
        reminder_times
      );
    } else if (reminder_date && reminder_date !== "N/A") {
      // Fallback to single reminder
      cronService.scheduleSpecificReminder(
        data._id,
        "allergy_reminder_date",
        reminder_date
      );
    }

    res.status(200).json({
      success: true,
      message: "Información sobre alergias guardada correctamente",
      id: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateallergy = async (req, res) => {
  try {
    const {
      id,
      type,
      title,
      symptoms,
      reminder_date,
      reminder_times, // New field for multiple reminder times
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        allergy_type: type,
        allergy_title: title,
        allergy_symptoms: symptoms,
        allergy_reminder_date: reminder_date,
      };

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.allergy_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "allergy_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "allergy_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "Información sobre alergias guardada correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petdose = async (req, res) => {
  try {
    const {
      id,
      name,
      dose,
      frequency,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      start_date,
      end_date,
      price,
      user,
    } = req.body;

    // Create medical record data
    const medicalData = {
      drug_name: name,
      dosage: dose,
      frequency: frequency,
      dose_start_date: start_date,
      dose_end_date: end_date,
      dose_reminder: reminder_date,
      dose_price: price,
      pet: id,
      user: user,
    };

    // Add multiple reminder times if provided
    if (
      reminder_times &&
      Array.isArray(reminder_times) &&
      reminder_times.length > 0
    ) {
      medicalData.dose_reminder_times = reminder_times;
    }

    const data = await Medical.create(medicalData);

    // Schedule reminders for multiple times if provided
    if (reminder_times && Array.isArray(reminder_times)) {
      await scheduleMultipleReminders(
        data._id,
        "dose_reminder_times",
        reminder_times
      );
    } else if (reminder_date && reminder_date !== "N/A") {
      // Fallback to single reminder
      cronService.scheduleSpecificReminder(
        data._id,
        "dose_reminder",
        reminder_date
      );
    }

    res.status(200).json({
      success: true,
      message: "La información de la dosis se guardó correctamente",
      id: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatedose = async (req, res) => {
  try {
    console.log(req.body);
    const {
      id,
      name,
      dose,
      frequency,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      start_date,
      end_date,
      price,
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        drug_name: name,
        dosage: dose,
        frequency: frequency,
        dose_start_date: start_date,
        dose_end_date: end_date,
        dose_reminder: reminder_date,
        dose_price: price,
      };

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.dose_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "dose_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "dose_reminder",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "La información de la dosis se guardó correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petdiet = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      recommend,
      price,
      date,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      user,
    } = req.body;

    // Create medical record data
    const medicalData = {
      diet_name: name,
      diet_description: description,
      recommend: recommend,
      diet_price: price,
      diet_review_date: date,
      pet: id,
      user: user,
    };

    // Add single reminder date if provided
    if (reminder_date && reminder_date !== "N/A") {
      medicalData.diet_reminder_date = reminder_date;
    }

    // Add multiple reminder times if provided
    if (
      reminder_times &&
      Array.isArray(reminder_times) &&
      reminder_times.length > 0
    ) {
      medicalData.diet_reminder_times = reminder_times;
    }

    const data = await Medical.create(medicalData);

    // Schedule reminders for multiple times if provided
    if (reminder_times && Array.isArray(reminder_times)) {
      await scheduleMultipleReminders(
        data._id,
        "diet_reminder_times",
        reminder_times
      );
    } else if (reminder_date && reminder_date !== "N/A") {
      // Fallback to single reminder
      cronService.scheduleSpecificReminder(
        data._id,
        "diet_reminder_date",
        reminder_date
      );
    }

    res.status(200).json({
      success: true,
      message: "La información de la dieta se guardó correctamente.",
      id: data._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatediet = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      recommend,
      price,
      date,
      reminder_date,
      reminder_times, // New field for multiple reminder times
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        diet_name: name,
        diet_description: description,
        recommend: recommend,
        diet_price: price,
        diet_review_date: date,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        updateData.diet_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.diet_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "diet_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "diet_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "La información de la dieta se guardó correctamente.",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petactivity = async (req, res) => {
  try {
    const {
      id,
      type,
      description,
      date,
      duration,
      travelled,
      altitude,
      location,
      difficult,
      fun,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      user,
    } = req.body;

    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image image." });
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if (result) {
      // Create medical record data
      const medicalData = {
        activity_type: type,
        activity_description: description,
        activity_date: date,
        activity_duration: duration,
        distance_traveled: travelled,
        altitude_reached: altitude,
        activity_location: location,
        difficulty: difficult,
        fun_level: fun,
        activity_image: result.secure_url,
        pet: id,
        user: user,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        medicalData.activity_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        medicalData.activity_reminder_times = reminder_times;
      }

      const data = await Medical.create(medicalData);

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          data._id,
          "activity_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          data._id,
          "activity_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "Información de actividades y ocio guardada correctamente",
        id: data._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateactivity = async (req, res) => {
  try {
    const {
      id,
      type,
      description,
      date,
      duration,
      travelled,
      altitude,
      location,
      difficult,
      fun,
      reminder_date,
      reminder_times, // New field for multiple reminder times
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        activity_type: type,
        activity_description: description,
        activity_date: date,
        activity_duration: duration,
        distance_traveled: travelled,
        altitude_reached: altitude,
        activity_location: location,
        difficulty: difficult,
        fun_level: fun,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        updateData.activity_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.activity_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "activity_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "activity_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message: "Información de actividades y ocio guardada correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const pethair = async (req, res) => {
  try {
    const {
      id,
      service,
      description,
      date,
      price,
      reminder_date,
      reminder_times, // New field for multiple reminder times
      user,
    } = req.body;

    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image image." });
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if (result) {
      // Create medical record data
      const medicalData = {
        hair_service: service,
        hair_description: description,
        date_served: date,
        hair_price: price,
        hair_image: result.secure_url,
        pet: id,
        user: user,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        medicalData.hair_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        medicalData.hair_reminder_times = reminder_times;
      }

      const data = await Medical.create(medicalData);

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          data._id,
          "hair_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          data._id,
          "hair_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message:
          "La información del pelo de la mascota se guardó correctamente",
        id: data._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatehair = async (req, res) => {
  try {
    const {
      id,
      service,
      description,
      date,
      price,
      reminder_date,
      reminder_times, // New field for multiple reminder times
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        hair_service: service,
        hair_description: description,
        date_served: date,
        hair_price: price,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        updateData.hair_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.hair_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "hair_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "hair_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message:
          "La información del pelo de la mascota se guardó correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const petEmergency = async (req, res) => {
  try {
    const { id, name, phone, email, address } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        {
          $set: {
            emergency_veterinarian_name: name,
            emergency_phone: phone,
            emergency_email: email,
            emergency_address: address,
          },
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "Contacto de emergencia guardado exitosamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchMedicalDetails = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body.id);
    let data = await Medical.findOne({ pet: id }).populate(
      "pet",
      "_id pet_name pet_image"
    );
    console.log(data);
    res.json({
      success: true,
      message: "Pet information fetched successfully",
      details: data,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

const deleteMedical = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const check = await Medical.findByIdAndDelete({ _id: id });
    res
      .status(200)
      .json({ success: true, message: "Los registros han sido eliminados" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const registration = async (req, res) => {
  try {
    const {
      id,
      type,
      description,
      date,
      duration,
      travelled,
      location,
      fun,
      reminder_date,
      reminder_times, // New field for multiple reminder times
    } = req.body;

    if (!req?.files?.picture)
      return res
        .status(400)
        .json({ success: false, message: "Please upload the ad image image." });
    const file = req.files.picture;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "mascotas",
    });
    if (result) {
      // Create medical record data
      const medicalData = {
        personal_type: type,
        personal_description: description,
        personal_date: date,
        personal_duration: duration,
        personal_location: location,
        personal_travelled: travelled,
        personal_fun: fun,
        personal_image: result.secure_url,
        pet: id,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        medicalData.personal_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        medicalData.personal_reminder_times = reminder_times;
      }

      const data = await Medical.create(medicalData);

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          data._id,
          "personal_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          data._id,
          "personal_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message:
          "Información de Registro personal y ocio guardada correctamente",
        id: data._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateRegistration = async (req, res) => {
  try {
    const {
      id,
      type,
      description,
      date,
      duration,
      travelled,
      location,
      fun,
      reminder_date,
      reminder_times, // New field for multiple reminder times
    } = req.body;
    const check = await Medical.findOne({ pet: id });
    if (check) {
      // Create update data
      const updateData = {
        personal_type: type,
        personal_description: description,
        personal_date: date,
        personal_duration: duration,
        personal_location: location,
        personal_travelled: travelled,
        personal_fun: fun,
      };

      // Add single reminder date if provided
      if (reminder_date && reminder_date !== "N/A") {
        updateData.personal_reminder_date = reminder_date;
      }

      // Add multiple reminder times if provided
      if (
        reminder_times &&
        Array.isArray(reminder_times) &&
        reminder_times.length > 0
      ) {
        updateData.personal_reminder_times = reminder_times;
      }

      const data = await Medical.findByIdAndUpdate(
        { _id: check._id },
        { $set: updateData },
        { new: true }
      );

      // Schedule reminders for multiple times if provided
      if (reminder_times && Array.isArray(reminder_times)) {
        await scheduleMultipleReminders(
          check._id,
          "personal_reminder_times",
          reminder_times
        );
      } else if (reminder_date && reminder_date !== "N/A") {
        // Fallback to single reminder
        cronService.scheduleSpecificReminder(
          check._id,
          "personal_reminder_date",
          reminder_date
        );
      }

      res.status(200).json({
        success: true,
        message:
          "La información del pelo de la mascota se guardó correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
  deleteMedical,
  registration,
  updateRegistration,
};
