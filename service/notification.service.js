const { JWT } = require("google-auth-library");
const axios = require("axios");

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// Define notification types for frontend navigation
const NOTIFICATION_TYPES = {
  // Medical related notifications
  MEDICAL_REMINDER: "medical_reminder",
  VACCINE_REMINDER: "vaccine_reminder",
  DEWORMING_REMINDER: "deworming_reminder",
  TREATMENT_REMINDER: "treatment_reminder",
  POST_OPERATION_REMINDER: "post_operation_reminder",
  CHECKUP_REMINDER: "checkup_reminder",

  // Lost pet notifications
  LOST_PET_ALERT: "lost_pet_alert",
  LOST_PET_FOUND: "lost_pet_found",

  // Business notifications
  BUSINESS_ORDER: "business_order",
  BUSINESS_APPROVED: "business_approved",
  BUSINESS_BLOCKED: "business_blocked",
  BUSINESS_PROMOTION: "business_promotion",

  // Admin notifications
  ADMIN_ANNOUNCEMENT: "admin_announcement",
  ADMIN_NOTIFICATION: "admin_notification",
  SYSTEM_UPDATE: "system_update",

  // QR Code notifications
  QR_CODE_SCANNED: "qr_code_scanned",
  QR_CODE_ACTIVATED: "qr_code_activated",

  // Payment notifications
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  SUBSCRIPTION_EXPIRED: "subscription_expired",

  // General notifications
  GENERAL: "general",
  WELCOME: "welcome",
};

// Navigation routes for different notification types
const NAVIGATION_ROUTES = {
  [NOTIFICATION_TYPES.MEDICAL_REMINDER]: "/medical-history",
  [NOTIFICATION_TYPES.VACCINE_REMINDER]: "/medical-history",
  [NOTIFICATION_TYPES.DEWORMING_REMINDER]: "/medical-history",
  [NOTIFICATION_TYPES.TREATMENT_REMINDER]: "/medical-history",
  [NOTIFICATION_TYPES.POST_OPERATION_REMINDER]: "/medical-history",
  [NOTIFICATION_TYPES.CHECKUP_REMINDER]: "/medical-history",
  [NOTIFICATION_TYPES.LOST_PET_ALERT]: "/lost-pets",
  [NOTIFICATION_TYPES.LOST_PET_FOUND]: "/lost-pets",
  [NOTIFICATION_TYPES.BUSINESS_ORDER]: "/business/orders",
  [NOTIFICATION_TYPES.BUSINESS_APPROVED]: "/business/profile",
  [NOTIFICATION_TYPES.BUSINESS_BLOCKED]: "/business/profile",
  [NOTIFICATION_TYPES.BUSINESS_PROMOTION]: "/business/promotions",
  [NOTIFICATION_TYPES.QR_CODE_SCANNED]: "/qr-codes",
  [NOTIFICATION_TYPES.QR_CODE_ACTIVATED]: "/qr-codes",
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: "/subscription",
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: "/subscription",
  [NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRED]: "/subscription",
  [NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT]: "/home",
  [NOTIFICATION_TYPES.ADMIN_NOTIFICATION]: "/home",
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: "/home",
  [NOTIFICATION_TYPES.GENERAL]: "/home",
  [NOTIFICATION_TYPES.WELCOME]: "/home",
};

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

// Enhanced universal push notification function
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

    // Get notification type and navigation route
    const notificationType = additionalData.type || NOTIFICATION_TYPES.GENERAL;
    const navigationRoute = NAVIGATION_ROUTES[notificationType] || "/home";

    const message = {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: notificationType,
        navigation_route: navigationRoute,
        click_action: navigationRoute,
        timestamp: new Date().toISOString(),
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

// Enhanced medical reminder function
const sendMedicalReminder = async (
  deviceToken,
  petName,
  reminderType,
  date,
  petId = null,
  recordId = null
) => {
  const notification = {
    title: `Recordatorio de ${reminderType} para: ${petName}`,
    body: `Tu mascota ${petName} tiene ${reminderType} programada para ${date}. ¡No lo olvides!`,
  };

  // Determine specific medical notification type
  let notificationType = NOTIFICATION_TYPES.MEDICAL_REMINDER;
  if (reminderType.toLowerCase().includes("vacuna")) {
    notificationType = NOTIFICATION_TYPES.VACCINE_REMINDER;
  } else if (reminderType.toLowerCase().includes("desparasitación")) {
    notificationType = NOTIFICATION_TYPES.DEWORMING_REMINDER;
  } else if (reminderType.toLowerCase().includes("tratamiento")) {
    notificationType = NOTIFICATION_TYPES.TREATMENT_REMINDER;
  } else if (reminderType.toLowerCase().includes("operación")) {
    notificationType = NOTIFICATION_TYPES.POST_OPERATION_REMINDER;
  } else if (
    reminderType.toLowerCase().includes("revisión") ||
    reminderType.toLowerCase().includes("chequeo")
  ) {
    notificationType = NOTIFICATION_TYPES.CHECKUP_REMINDER;
  } else if (
    reminderType.toLowerCase().includes("medicación") ||
    reminderType.toLowerCase().includes("dosis")
  ) {
    notificationType = NOTIFICATION_TYPES.MEDICAL_REMINDER;
  } else if (reminderType.toLowerCase().includes("alergia")) {
    notificationType = NOTIFICATION_TYPES.MEDICAL_REMINDER;
  } else if (reminderType.toLowerCase().includes("dieta")) {
    notificationType = NOTIFICATION_TYPES.MEDICAL_REMINDER;
  } else if (
    reminderType.toLowerCase().includes("actividad") ||
    reminderType.toLowerCase().includes("ejercicio")
  ) {
    notificationType = NOTIFICATION_TYPES.MEDICAL_REMINDER;
  } else if (
    reminderType.toLowerCase().includes("pelo") ||
    reminderType.toLowerCase().includes("grooming")
  ) {
    notificationType = NOTIFICATION_TYPES.MEDICAL_REMINDER;
  }

  const additionalData = {
    type: notificationType,
    pet_name: petName,
    pet_id: petId,
    reminder_type: reminderType,
    date: date,
    record_id: recordId,
    category: "medical",
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

const sendLostPetAlert = async (deviceToken, petData, lostPetId = null) => {
  const { name, contact, location, time, image, date, details } = petData;

  const notification = {
    title: `Mascota perdida: ${name}`,
    body: `Teléfono: ${contact}\nUbicación: ${location}\nTiempo perdido: ${time}`,
  };

  const additionalData = {
    type: NOTIFICATION_TYPES.LOST_PET_ALERT,
    pet_name: name,
    contact: contact,
    location: location,
    time: time,
    image: image,
    date: date,
    details: details,
    lost_pet_id: lostPetId,
    category: "lost_pet",
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

// Enhanced general notification function
const sendGeneralNotification = async (
  deviceToken,
  title,
  body,
  type = NOTIFICATION_TYPES.GENERAL,
  extraData = {}
) => {
  const notification = { title, body };

  // Ensure the type is valid
  const notificationType = Object.values(NOTIFICATION_TYPES).includes(type)
    ? type
    : NOTIFICATION_TYPES.GENERAL;

  const additionalData = {
    type: notificationType,
    category: extraData.category || "general",
    ...extraData,
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

// New specific notification functions

const sendBusinessNotification = async (
  deviceToken,
  title,
  body,
  businessType,
  businessData = {}
) => {
  const notification = { title, body };

  const additionalData = {
    type: businessType,
    category: "business",
    business_id: businessData.business_id,
    order_id: businessData.order_id,
    ...businessData,
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

const sendPaymentNotification = async (
  deviceToken,
  title,
  body,
  paymentType,
  paymentData = {}
) => {
  const notification = { title, body };

  const additionalData = {
    type: paymentType,
    category: "payment",
    amount: paymentData.amount,
    transaction_id: paymentData.transaction_id,
    subscription_type: paymentData.subscription_type,
    ...paymentData,
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

const sendQRCodeNotification = async (
  deviceToken,
  title,
  body,
  qrCodeType,
  qrCodeData = {}
) => {
  const notification = { title, body };

  const additionalData = {
    type: qrCodeType,
    category: "qr_code",
    qr_code_id: qrCodeData.qr_code_id,
    pet_id: qrCodeData.pet_id,
    scanner_contact: qrCodeData.scanner_contact,
    ...qrCodeData,
  };

  return sendPushNotification(deviceToken, notification, additionalData);
};

module.exports = {
  sendPushNotification,
  sendMedicalReminder,
  sendLostPetAlert,
  sendGeneralNotification,
  sendBusinessNotification,
  sendPaymentNotification,
  sendQRCodeNotification,
  NOTIFICATION_TYPES,
  NAVIGATION_ROUTES,
};
