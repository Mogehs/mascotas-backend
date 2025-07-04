const cron = require("node-cron");
const moment = require("moment");
const Medical = require("../model/medicalhistory");
const { sendPushNotification } = require("../service/notification.service");

const startCronJob = () => {
  const task = cron.schedule(
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
          "Task completed successfully at:",
          new Date().toISOString()
        );
      } catch (error) {
        console.error("Error in scheduled task:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Madrid",
    }
  );

  task.start();
  console.log("Cron job scheduled to run every minute");
};

module.exports = {
  startCronJob,
};
