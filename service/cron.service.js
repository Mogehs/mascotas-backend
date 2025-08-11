const cron = require("node-cron");
const moment = require("moment");
const Medical = require("../model/medicalhistory");
const Product = require("../model/product");
const Business = require("../model/business");
const Analytics = require("../model/analytics");
const { sendMedicalReminder } = require("../service/notification.service");
const { expireSubscriptionsHelper } = require("../controller/business");

// Helper function to expire featured products (duplicated here to avoid circular imports)
const expireFeaturedProducts = async () => {
  try {
    const now = new Date();
    const result = await Product.updateMany(
      {
        is_featured: true,
        featured_until: { $lt: now },
      },
      {
        is_featured: false,
        featured_until: null,
      }
    );

    return {
      success: true,
      expired_count: result.modifiedCount,
      message: `${result.modifiedCount} featured products expired`,
    };
  } catch (error) {
    console.error("Expire featured products error:", error);
    return {
      success: false,
      error: error.message,
      expired_count: 0,
    };
  }
};

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
          const promises = [];

          // Check for vaccine reminders (1 day before)
          if (medical.pet_vaccine_date != "N/A") {
            const vaccineReminderDate = moment(medical.pet_vaccine_date)
              .subtract(1, "day")
              .format("YYYY-MM-DD");

            if (todayFormatted === vaccineReminderDate) {
              if (
                medical.user?.device_token &&
                medical.user.device_token !== ""
              ) {
                console.log(
                  `Sending vaccine reminder to: ${medical.user.device_token} for pet: ${medical.pet.pet_name}`
                );
                promises.push(
                  sendMedicalReminder(
                    medical.user.device_token,
                    medical.pet.pet_name,
                    "vacunas",
                    medical.pet_vaccine_date
                  ).catch((error) => {
                    console.error(
                      `Failed to send vaccine reminder for ${medical.pet.pet_name}:`,
                      error
                    );
                    return null;
                  })
                );
              }
            }
          }

          // Check for deworming reminders (same day)
          if (medical.pet_deworming_date != "N/A") {
            if (todayFormatted === medical.pet_deworming_date) {
              if (
                medical.user?.device_token &&
                medical.user.device_token !== ""
              ) {
                console.log(
                  `Sending deworming reminder to: ${medical.user.device_token} for pet: ${medical.pet.pet_name}`
                );
                promises.push(
                  sendMedicalReminder(
                    medical.user.device_token,
                    medical.pet.pet_name,
                    "desparasitación",
                    medical.pet_deworming_date
                  ).catch((error) => {
                    console.error(
                      `Failed to send deworming reminder for ${medical.pet.pet_name}:`,
                      error
                    );
                    return null;
                  })
                );
              }
            }
          }

          return Promise.all(promises);
        });

        await Promise.all(notificationPromises);

        // Count successful notifications
        const sentNotifications = data.filter((medical) => {
          const todayFormatted = moment().format("YYYY-MM-DD");
          const hasVaccineReminder =
            medical.pet_vaccine_date != "N/A" &&
            todayFormatted ===
              moment(medical.pet_vaccine_date)
                .subtract(1, "day")
                .format("YYYY-MM-DD") &&
            medical.user?.device_token &&
            medical.user.device_token !== "";
          const hasDewormingReminder =
            medical.pet_deworming_date != "N/A" &&
            todayFormatted === medical.pet_deworming_date &&
            medical.user?.device_token &&
            medical.user.device_token !== "";
          return hasVaccineReminder || hasDewormingReminder;
        }).length;

        console.log(
          "Medical reminder task completed successfully at:",
          new Date().toISOString(),
          `- Notifications sent: ${sentNotifications}`
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

  // Medical checkup reminders cron job - runs hourly to catch specific times
  const medicalCheckupReminderTask = cron.schedule(
    "* * * * *", // Run every hour
    async () => {
      try {
        const now = moment();
        const currentDate = now.format("YYYY-MM-DD");
        const currentHour = now.format("HH");

        console.log(
          `Running medical checkup reminder check at ${now.format(
            "YYYY-MM-DD HH:mm:ss"
          )}`
        );

        const data = await Medical.find({
          next_check_up_reminder: { $ne: "N/A" },
        })
          .populate("user", "device_token")
          .populate("pet", "pet_name");

        const notificationPromises = data.map(async (medical) => {
          // Skip records without reminder date or device token
          if (false) {
            console.log(
              `Skipping reminder for pet ${medical.pet.pet_name}: no valid reminder date or device token.`
            );
            return null;
          }
          console.log(
            `Processing reminder for pet ${medical.pet.pet_name}: ${medical.next_check_up_reminder}`
          );

          try {
            // Parse the reminder datetime (could be just date or date with time)
            let reminderMoment;

            // Try different date formats
            if (medical.next_check_up_reminder.includes(":")) {
              // Format with time (YYYY-MM-DD HH:mm)
              reminderMoment = moment(medical.next_check_up_reminder, [
                "YYYY-MM-DD HH:mm",
                "DD-MM-YYYY HH:mm",
                "MM/DD/YYYY HH:mm",
                "YYYY/MM/DD HH:mm",
              ]);
            } else {
              // Format without time (YYYY-MM-DD)
              reminderMoment = moment(medical.next_check_up_reminder, [
                "YYYY-MM-DD",
                "DD-MM-YYYY",
                "MM/DD/YYYY",
                "YYYY/MM/DD",
              ]);

              // Default to 9 AM for date-only reminders
              reminderMoment.hour(9).minute(0).second(0);
            }

            console.log(
              `Reminder set for pet ${
                medical.pet.pet_name
              }: ${reminderMoment.format("YYYY-MM-DD HH:mm")}`
            );

            console.log(
              `Checking if it's time to send reminder for pet ${reminderMoment.format(
                "YYYY-MM-DD"
              )}...${reminderMoment.format("HH")}`
            );

            console.log(
              `Checking if it's time to send reminder for pet ${currentDate}...${currentHour}`
            );
            // Check if this is the right time to send the reminder
            if (
              reminderMoment.isValid() &&
              reminderMoment.format("YYYY-MM-DD") === currentDate &&
              reminderMoment.format("HH") === currentHour &&
              reminderMoment.format("mm") === now.format("mm")
            ) {
              console.log(
                `Sending medical checkup reminder to: ${medical.user.device_token} for pet: ${medical.pet.pet_name}`
              );

              return sendMedicalReminder(
                medical.user.device_token,
                medical.pet.pet_name,
                "chequeo médico",
                medical.next_check_up_reminder
              ).catch((error) => {
                console.error(
                  `Failed to send medical checkup reminder for ${medical.pet.pet_name}:`,
                  error
                );
                return null;
              });
            }
          } catch (error) {
            console.error(
              `Error processing reminder for pet ${
                medical.pet?._id || "unknown"
              }:`,
              error
            );
          }

          return null;
        });

        const results = await Promise.all(
          notificationPromises.filter((p) => p !== null)
        );
        const sentCount = results.filter((r) => r !== null).length;

        console.log(
          "Medical checkup reminder task completed at:",
          new Date().toISOString(),
          `- Notifications sent: ${sentCount}`
        );
      } catch (error) {
        console.error(
          "Error in medical checkup reminder scheduled task:",
          error
        );
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

  // Featured products expiration cron job - runs daily at 12:05 AM
  const featuredProductsExpirationTask = cron.schedule(
    "5 0 * * *",
    async () => {
      try {
        console.log("Starting featured products expiration check...");
        const result = await expireFeaturedProducts();

        console.log(
          "Featured products expiration task completed successfully at:",
          new Date().toISOString(),
          "- Expired featured products:",
          result.expired_count
        );
      } catch (error) {
        console.error(
          "Error in featured products expiration scheduled task:",
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
  medicalCheckupReminderTask.start(); // Start the new medical checkup reminder task
  subscriptionExpirationTask.start();
  featuredProductsExpirationTask.start();

  console.log("Cron jobs scheduled:");
  console.log("- Medical reminders: Every day at 9:00 AM");
  console.log("- Medical checkup reminders: Every hour");
  console.log("- Subscription expiration check: Every day at 12:01 AM");
  console.log("- Featured products expiration check: Every day at 12:05 AM");
};

module.exports = {
  startCronJob,
};
