const express = require("express");
const router = express.Router();
const Medical = require("../model/medicalhistory");
const cronService = require("../service/cron.service");

const scheduleMultipleReminders = async (
  medicalRecordId,
  reminderFieldType,
  reminderTimes
) => {
  try {
    for (const reminderDay of reminderTimes) {
      const { date, times } = reminderDay;

      if (times && Array.isArray(times)) {
        for (const time of times) {
          const fullDateTime = `${date} ${time}`;

          await cronService.scheduleSpecificReminder(
            medicalRecordId,
            reminderFieldType,
            fullDateTime
          );
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling multiple reminders:", error);
  }
};

router.post("/treatment/add-reminder-times", async (req, res) => {
  try {
    const { medicalRecordId, reminderTimes } = req.body;

    if (!medicalRecordId || !reminderTimes || !Array.isArray(reminderTimes)) {
      return res.status(400).json({
        success: false,
        message: "Medical record ID and reminder times are required",
      });
    }

    // Update the medical record with new reminder times
    const updatedRecord = await Medical.findByIdAndUpdate(
      medicalRecordId,
      {
        $set: {
          pet_treatment_reminder_times: reminderTimes,
        },
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Schedule all the reminders
    await scheduleMultipleReminders(
      medicalRecordId,
      "pet_treatment_reminder_times",
      reminderTimes
    );

    res.status(200).json({
      success: true,
      message: "Hourly reminders added successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error adding hourly reminders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add multiple reminder times for medication/dose
router.post("/medication/add-reminder-times", async (req, res) => {
  try {
    const { medicalRecordId, reminderTimes } = req.body;

    if (!medicalRecordId || !reminderTimes || !Array.isArray(reminderTimes)) {
      return res.status(400).json({
        success: false,
        message: "Medical record ID and reminder times are required",
      });
    }

    // Update the medical record with new reminder times
    const updatedRecord = await Medical.findByIdAndUpdate(
      medicalRecordId,
      {
        $set: {
          dose_reminder_times: reminderTimes,
        },
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Schedule all the reminders
    await scheduleMultipleReminders(
      medicalRecordId,
      "dose_reminder_times",
      reminderTimes
    );

    res.status(200).json({
      success: true,
      message: "Hourly medication reminders added successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error adding hourly medication reminders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add multiple reminder times for vaccine
router.post("/vaccine/add-reminder-times", async (req, res) => {
  try {
    const { medicalRecordId, reminderTimes } = req.body;

    if (!medicalRecordId || !reminderTimes || !Array.isArray(reminderTimes)) {
      return res.status(400).json({
        success: false,
        message: "Medical record ID and reminder times are required",
      });
    }

    // Update the medical record with new reminder times
    const updatedRecord = await Medical.findByIdAndUpdate(
      medicalRecordId,
      {
        $set: {
          pet_vaccine_reminder_times: reminderTimes,
        },
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Schedule all the reminders
    await scheduleMultipleReminders(
      medicalRecordId,
      "pet_vaccine_reminder_times",
      reminderTimes
    );

    res.status(200).json({
      success: true,
      message: "Hourly vaccine reminders added successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error adding hourly vaccine reminders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add multiple reminder times for medical checkup
router.post("/checkup/add-reminder-times", async (req, res) => {
  try {
    const { medicalRecordId, reminderTimes } = req.body;

    if (!medicalRecordId || !reminderTimes || !Array.isArray(reminderTimes)) {
      return res.status(400).json({
        success: false,
        message: "Medical record ID and reminder times are required",
      });
    }

    // Update the medical record with new reminder times
    const updatedRecord = await Medical.findByIdAndUpdate(
      medicalRecordId,
      {
        $set: {
          next_check_up_reminder_times: reminderTimes,
        },
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Schedule all the reminders
    await scheduleMultipleReminders(
      medicalRecordId,
      "next_check_up_reminder_times",
      reminderTimes
    );

    res.status(200).json({
      success: true,
      message: "Hourly checkup reminders added successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error adding hourly checkup reminders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get reminder times for a medical record
router.get("/get-reminder-times/:medicalRecordId", async (req, res) => {
  try {
    const { medicalRecordId } = req.params;

    const medicalRecord = await Medical.findById(medicalRecordId);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    const reminderTimes = {
      treatment: medicalRecord.pet_treatment_reminder_times || [],
      medication: medicalRecord.dose_reminder_times || [],
      vaccine: medicalRecord.pet_vaccine_reminder_times || [],
      deworming: medicalRecord.pet_deworming_reminder_times || [],
      postOperation: medicalRecord.post_operation_reminder_times || [],
      checkUp: medicalRecord.next_check_up_reminder_times || [],
    };

    res.status(200).json({
      success: true,
      message: "Reminder times retrieved successfully",
      data: reminderTimes,
    });
  } catch (error) {
    console.error("Error getting reminder times:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update reminder times for treatment
router.put("/treatment/update-reminder-times", async (req, res) => {
  try {
    const { medicalRecordId, reminderTimes } = req.body;

    if (!medicalRecordId || !reminderTimes || !Array.isArray(reminderTimes)) {
      return res.status(400).json({
        success: false,
        message: "Medical record ID and reminder times are required",
      });
    }

    // Update the medical record with new reminder times
    const updatedRecord = await Medical.findByIdAndUpdate(
      medicalRecordId,
      {
        $set: {
          pet_treatment_reminder_times: reminderTimes,
        },
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Cancel existing scheduled reminders for this record and field
    // Then schedule new ones
    await scheduleMultipleReminders(
      medicalRecordId,
      "pet_treatment_reminder_times",
      reminderTimes
    );

    res.status(200).json({
      success: true,
      message: "Hourly reminders updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating hourly reminders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete reminder times for a medical record
router.delete(
  "/delete-reminder-times/:medicalRecordId/:reminderType",
  async (req, res) => {
    try {
      const { medicalRecordId, reminderType } = req.params;

      const fieldMap = {
        treatment: "pet_treatment_reminder_times",
        medication: "dose_reminder_times",
        vaccine: "pet_vaccine_reminder_times",
        deworming: "pet_deworming_reminder_times",
        postOperation: "post_operation_reminder_times",
        checkUp: "next_check_up_reminder_times",
      };

      const fieldName = fieldMap[reminderType];
      if (!fieldName) {
        return res.status(400).json({
          success: false,
          message: "Invalid reminder type",
        });
      }

      // Clear reminder times from the medical record
      const updateQuery = {};
      updateQuery[fieldName] = [];

      const updatedRecord = await Medical.findByIdAndUpdate(
        medicalRecordId,
        { $set: updateQuery },
        { new: true }
      );

      if (!updatedRecord) {
        return res.status(404).json({
          success: false,
          message: "Medical record not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Reminder times deleted successfully",
        data: updatedRecord,
      });
    } catch (error) {
      console.error("Error deleting reminder times:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
