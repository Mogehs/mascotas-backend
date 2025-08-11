const { JWT } = require("google-auth-library");
const axios = require("axios");

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// Validate required environment variables
if (
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_PROJECT_ID
) {
  console.error("Missing required Firebase environment variables");
  console.error(
    "Please set FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_PROJECT_ID"
  );
  throw new Error("Firebase credentials not configured properly");
}

const client = new JWT({
  email: process.env.FIREBASE_CLIENT_EMAIL,
  key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle escaped newlines
  scopes: SCOPES,
});

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

// Universal push notification function
const sendPushNotification = async (
  deviceToken,
  notification,
  additionalData = {}
) => {
  try {
    // Validate device token
    if (!deviceToken) {
      throw new Error("Device token is required");
    }

    const tokens = await client.authorize();

    if (!tokens.access_token) {
      throw new Error("Failed to obtain access token from Firebase");
    }

    const message = {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: additionalData.type || "general",
        ...additionalData,
      },
    };

    const headers = {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      { message },
      { headers }
    );

    console.log("Notification sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending notification:",
      error.response?.data || error.message
    );

    // More specific error handling
    if (error.message.includes("invalid_grant")) {
      console.error(
        "Firebase service account credentials are invalid or expired"
      );
      console.error(
        "Please check your FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables"
      );
    }

    throw error;
  }
};

// Specific notification functions for different purposes
const sendMedicalReminder = async (
  deviceToken,
  petName,
  reminderType,
  date
) => {
  const notification = {
    title: `Recordatorio de ${reminderType} para: ${petName}`,
    body: `Tu mascota ${petName} tiene ${reminderType} programada para ${date}. ¡No lo olvides!`,
  };

  const additionalData = {
    type: "medical_reminder",
    pet_name: petName,
    reminder_type: reminderType,
    date: date,
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

const sendLostPetAlert = async (deviceToken, petData) => {
  const { name, contact, location, time, image, date, details } = petData;

  const notification = {
    title: `Mascota perdida: ${name}`,
    body: `Teléfono: ${contact}\nUbicación: ${location}\nTiempo perdido: ${time}`,
  };

  const additionalData = {
    type: "lost_pet",
    pet_name: name,
    contact: contact,
    location: location,
    time: time,
    image: image,
    date: date,
    details: details,
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

const sendGeneralNotification = async (
  deviceToken,
  title,
  body,
  type = "general",
  extraData = {}
) => {
  const notification = { title, body };
  const additionalData = { type, ...extraData };

  return sendPushNotification(deviceToken, notification, additionalData);
};

module.exports = {
  sendPushNotification,
  sendMedicalReminder,
  sendLostPetAlert,
  sendGeneralNotification,
};
