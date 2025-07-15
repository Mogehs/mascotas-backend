const cron = require("node-cron");
const moment = require("moment");
const Medical = require("../model/medicalhistory");
const { sendPushNotification } = require("../service/notification.service");
const { expireSubscriptionsHelper } = require("../controller/business");

const startCronJob = () => {
  // Medical reminders cron job - runs daily at 9 AM
  const medicalReminderTask = cron.schedule(
    "0 9 * * *",
    async () => {
      try {
        const todayFormatted = moment().format("YYYY-MM-DD");
        const data = await Medical.find()
          .populate("user", "device_token")
          .populate("pet", "pet_name");

        const notificationPromises = data.map(async (medical) => {
          if (medical.pet_vaccine_date != "N/A") {
            const vaccineReminderDate = moment(medical.pet_vaccine_date)
              .subtract(1, "day")
              .format("YYYY-MM-DD");

            if (todayFormatted === vaccineReminderDate) {
              let notification = {
                title: `Recordatorio de desparasitación para: ${medical.pet.pet_name}`,
                body: `Tu mascota ${medical.pet.pet_name} tiene una vacuna programada para mañana(${medical.pet_vaccine_date}). ¡No lo olvides!`,
              };

              if (medical.user?.device_token !== "") {
                console.log(medical.user?.device_token);
                sendPushNotification(medical.user?.device_token, notification);
              }
            }
          } else if (medical.pet_deworming_date != "N/A") {
            if (todayFormatted === medical.pet_deworming_date) {
              let notification = {
                title: `Recordatorio de vacunas para: ${medical.pet.pet_name}`,
                body: `Tu mascota ${medical.pet.pet_name} tiene una desparasitación programada para mañana(${medical.pet_vaccine_date}). ¡No lo olvides!`,
              };

              if (medical.user?.device_token !== "") {
                console.log(medical.user?.device_token);
                sendPushNotification(medical.user?.device_token, notification);
              }
            }
          }
          return null;
        });

        await Promise.all(notificationPromises.filter((p) => p !== null));
        console.log(
          "Medical reminder task completed successfully at:",
          new Date().toISOString()
        );
      } catch (error) {
        console.error("Error in medical reminder scheduled task:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Madrid",
    }
  );

  // Subscription expiration cron job - runs daily at 12:01 AM
  const subscriptionExpirationTask = cron.schedule(
    "1 0 * * *",
    async () => {
      try {
        console.log("Starting subscription expiration check...");
        const result = await expireSubscriptionsHelper();

        console.log(
          "Subscription expiration task completed successfully at:",
          new Date().toISOString(),
          "- Expired subscriptions:",
          result.expired_count
        );
      } catch (error) {
        console.error(
          "Error in subscription expiration scheduled task:",
          error
        );
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Madrid",
    }
  );

  medicalReminderTask.start();
  subscriptionExpirationTask.start();

  console.log("Cron jobs scheduled:");
  console.log("- Medical reminders: Every day at 9:00 AM");
  console.log("- Subscription expiration check: Every day at 12:01 AM");
};

module.exports = {
  startCronJob,
};
