const cron = require("node-cron");
const moment = require("moment");
const MedicalHistory = require("../model/medicalhistory");
const User = require("../model/user");
const Pet = require("../model/pet");
const { sendMedicalReminder } = require("./notification.service");

class CronService {
  constructor() {
    this.scheduledJobs = new Map();
    this.isRunning = false;
  }

  // Start all cron jobs
  start() {
    if (this.isRunning) {
      console.log("Cron service is already running");
      return;
    }

    console.log("Starting Medical Checkup Cron Service...");

    // Check for medical reminders every hour
    this.scheduleHourlyReminders();

    // Check for medical reminders daily at 9 AM
    this.scheduleDailyReminders();

    // Clean up old completed reminders weekly
    this.scheduleWeeklyCleanup();

    this.isRunning = true;
    console.log("Medical Checkup Cron Service started successfully");
  }

  // Stop all cron jobs
  stop() {
    console.log("Stopping Medical Checkup Cron Service...");

    this.scheduledJobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });

    this.scheduledJobs.clear();
    this.isRunning = false;
    console.log("Medical Checkup Cron Service stopped");
  }

  // Schedule hourly check for immediate reminders (for precise timing)
  scheduleHourlyReminders() {
    const hourlyJob = cron.schedule(
      "0 * * * *",
      async () => {
        console.log("Running hourly medical reminder check...");
        await this.checkAndSendReminders("hourly");
      },
      {
        scheduled: true,
        timezone: "America/Mexico_City", // Adjust timezone as needed
      }
    );

    this.scheduledJobs.set("hourlyReminders", hourlyJob);
    console.log("Scheduled hourly medical reminder checks");
  }

  // Schedule daily check at 9 AM for all reminders
  scheduleDailyReminders() {
    const dailyJob = cron.schedule(
      "0 9 * * *",
      async () => {
        console.log("Running daily medical reminder check...");
        await this.checkAndSendReminders("daily");
      },
      {
        scheduled: true,
        timezone: "America/Mexico_City",
      }
    );

    this.scheduledJobs.set("dailyReminders", dailyJob);
    console.log("Scheduled daily medical reminder checks at 9:00 AM");
  }

  // Schedule weekly cleanup of old reminders
  scheduleWeeklyCleanup() {
    const weeklyJob = cron.schedule(
      "0 2 * * 0",
      async () => {
        console.log("Running weekly cleanup of old medical reminders...");
        await this.cleanupOldReminders();
      },
      {
        scheduled: true,
        timezone: "America/Mexico_City",
      }
    );

    this.scheduledJobs.set("weeklyCleanup", weeklyJob);
    console.log("Scheduled weekly cleanup every Sunday at 2:00 AM");
  }

  // Main function to check and send reminders
  async checkAndSendReminders(checkType = "daily") {
    try {
      console.log(`Checking medical reminders (${checkType})...`);

      const now = moment();
      const reminderTypes = [
        "pet_vaccine_reminder_date",
        "pet_deworming_reminder_date",
        "pet_treatment_remider_date",
        "post_operation_reminder",
        "next_check_up_reminder",
      ];

      for (const reminderType of reminderTypes) {
        await this.processMedicalReminders(reminderType, now, checkType);
      }

      console.log(`Medical reminder check (${checkType}) completed`);
    } catch (error) {
      console.error("Error in checkAndSendReminders:", error);
    }
  }

  // Process specific type of medical reminders
  async processMedicalReminders(reminderField, currentTime, checkType) {
    try {
      // Build query to find reminders that need to be sent
      const query = {};
      query[reminderField] = { $exists: true, $ne: "N/A" };

      const medicalRecords = await MedicalHistory.find(query)
        .populate("user", "firstname lastname device_token")
        .populate("pet", "petname");

      console.log(
        `Found ${medicalRecords.length} records for ${reminderField}`
      );

      for (const record of medicalRecords) {
        await this.processIndividualReminder(
          record,
          reminderField,
          currentTime,
          checkType
        );
      }
    } catch (error) {
      console.error(`Error processing ${reminderField}:`, error);
    }
  }

  // Process individual reminder
  async processIndividualReminder(
    record,
    reminderField,
    currentTime,
    checkType
  ) {
    try {
      const reminderDateStr = record[reminderField];

      if (!reminderDateStr || reminderDateStr === "N/A") {
        return;
      }

      // Parse the reminder date - handle multiple formats
      const reminderDate = this.parseReminderDate(reminderDateStr);

      if (!reminderDate || !reminderDate.isValid()) {
        console.log(
          `Invalid date format for ${reminderField}: ${reminderDateStr}`
        );
        return;
      }

      // Check if reminder should be sent based on check type and timing
      const shouldSend = this.shouldSendReminder(
        reminderDate,
        currentTime,
        checkType
      );

      if (!shouldSend) {
        return;
      }

      // Validate user and pet data
      if (!record.user || !record.user.device_token) {
        console.log(`No device token for user in record ${record._id}`);
        return;
      }

      if (!record.pet || !record.pet.petname) {
        console.log(`No pet data for record ${record._id}`);
        return;
      }

      // Send the reminder notification
      await this.sendReminderNotification(record, reminderField, reminderDate);
    } catch (error) {
      console.error(
        `Error processing individual reminder for record ${record._id}:`,
        error
      );
    }
  }

  // Parse reminder date from various formats
  parseReminderDate(dateStr) {
    // Try different date formats
    const formats = [
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DD",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYY",
      "MM/DD/YYYY HH:mm",
      "MM/DD/YYYY",
      "YYYY-MM-DDTHH:mm:ss.SSSZ",
      "YYYY-MM-DDTHH:mm:ssZ",
    ];

    for (const format of formats) {
      const parsed = moment(dateStr, format, true);
      if (parsed.isValid()) {
        return parsed;
      }
    }

    // Try parsing as ISO string or timestamp
    const isoDate = moment(dateStr);
    if (isoDate.isValid()) {
      return isoDate;
    }

    return null;
  }

  // Determine if reminder should be sent based on timing
  shouldSendReminder(reminderDate, currentTime, checkType) {
    const diffHours = reminderDate.diff(currentTime, "hours");
    const diffDays = reminderDate.diff(currentTime, "days");

    if (checkType === "hourly") {
      // For hourly checks, send if within the next hour
      return diffHours >= 0 && diffHours <= 1;
    } else if (checkType === "daily") {
      // For daily checks, send if today or within next 3 days
      return diffDays >= 0 && diffDays <= 3;
    }

    return false;
  }

  // Send reminder notification
  async sendReminderNotification(record, reminderField, reminderDate) {
    try {
      const reminderTypeMap = {
        pet_vaccine_reminder_date: "vacuna",
        pet_deworming_reminder_date: "desparasitación",
        pet_treatment_remider_date: "tratamiento",
        post_operation_reminder: "cuidado post-operación",
        next_check_up_reminder: "revisión médica",
      };

      const reminderType =
        reminderTypeMap[reminderField] || "recordatorio médico";
      const formattedDate = reminderDate.format("DD/MM/YYYY HH:mm");

      await sendMedicalReminder(
        record.user.device_token,
        record.pet.petname,
        reminderType,
        formattedDate,
        record.pet._id,
        record._id
      );

      console.log(
        `Medical reminder sent successfully for ${record.pet.petname} - ${reminderType}`
      );

      // Mark reminder as sent (optional - you can add a field to track this)
      // await MedicalHistory.findByIdAndUpdate(record._id, {
      //   [`${reminderField}_sent`]: true,
      //   [`${reminderField}_sent_at`]: new Date()
      // });
    } catch (error) {
      console.error(`Failed to send reminder for record ${record._id}:`, error);
    }
  }

  // Convert field name to human-readable text
  getReminderTypeText(reminderField) {
    const typeMap = {
      pet_vaccine_reminder_date: "vacunación",
      pet_deworming_reminder_date: "desparasitación",
      pet_treatment_remider_date: "tratamiento médico",
      post_operation_reminder: "seguimiento post-operatorio",
      next_check_up_reminder: "chequeo médico",
    };

    return typeMap[reminderField] || "recordatorio médico";
  }

  // Clean up old completed reminders
  async cleanupOldReminders() {
    try {
      console.log("Starting cleanup of old medical reminders...");

      const cutoffDate = moment().subtract(30, "days").format("YYYY-MM-DD");

      const reminderFields = [
        "pet_vaccine_reminder_date",
        "pet_deworming_reminder_date",
        "pet_treatment_remider_date",
        "post_operation_reminder",
        "next_check_up_reminder",
      ];

      let totalCleaned = 0;

      for (const field of reminderFields) {
        const query = {};
        query[field] = { $lt: cutoffDate, $ne: null };

        const updateQuery = {};
        updateQuery[field] = "N/A";

        const result = await MedicalHistory.updateMany(query, {
          $set: updateQuery,
        });

        console.log(`Cleaned ${result.modifiedCount} old ${field} reminders`);
        totalCleaned += result.modifiedCount;
      }

      console.log(
        `Cleanup completed. Total reminders cleaned: ${totalCleaned}`
      );
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }

  // Schedule a specific reminder (for immediate scheduling when creating a medical record)
  scheduleSpecificReminder(medicalRecordId, reminderField, reminderDateTime) {
    try {
      const reminderDate = moment(reminderDateTime);

      if (!reminderDate.isValid()) {
        console.error("Invalid reminder date:", reminderDateTime);
        return false;
      }

      // If the reminder is in the past, don't schedule it
      if (reminderDate.isBefore(moment())) {
        console.log("Reminder date is in the past, skipping scheduling");
        return false;
      }

      const cronExpression = this.generateCronExpression(reminderDate);
      const jobName = `reminder_${medicalRecordId}_${reminderField}`;

      // Remove existing job if it exists
      if (this.scheduledJobs.has(jobName)) {
        this.scheduledJobs.get(jobName).stop();
        this.scheduledJobs.delete(jobName);
      }

      // Schedule the specific reminder
      const job = cron.schedule(
        cronExpression,
        async () => {
          await this.sendSpecificReminder(medicalRecordId, reminderField);
          // Remove the job after execution
          this.scheduledJobs.delete(jobName);
        },
        {
          scheduled: true,
          timezone: "America/Mexico_City",
        }
      );

      this.scheduledJobs.set(jobName, job);
      console.log(
        `Scheduled specific reminder for ${jobName} at ${reminderDate.format()}`
      );

      return true;
    } catch (error) {
      console.error("Error scheduling specific reminder:", error);
      return false;
    }
  }

  // Generate cron expression from moment date
  generateCronExpression(momentDate) {
    const minute = momentDate.minute();
    const hour = momentDate.hour();
    const day = momentDate.date();
    const month = momentDate.month() + 1; // moment months are 0-based

    return `${minute} ${hour} ${day} ${month} *`;
  }

  // Send a specific scheduled reminder
  async sendSpecificReminder(medicalRecordId, reminderField) {
    try {
      const record = await MedicalHistory.findById(medicalRecordId)
        .populate("user", "firstname lastname device_token")
        .populate("pet", "petname");

      if (!record) {
        console.log(`Medical record ${medicalRecordId} not found`);
        return;
      }

      const reminderDateStr = record[reminderField];
      const reminderDate = this.parseReminderDate(reminderDateStr);

      if (reminderDate && reminderDate.isValid()) {
        await this.sendReminderNotification(
          record,
          reminderField,
          reminderDate
        );
      }
    } catch (error) {
      console.error(
        `Error sending specific reminder for ${medicalRecordId}:`,
        error
      );
    }
  }

  // Get status of cron service
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.scheduledJobs.keys()),
      totalJobs: this.scheduledJobs.size,
    };
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService;
