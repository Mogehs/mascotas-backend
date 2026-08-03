require("dotenv").config();
const express = require("express");
const http = require("http");
const connectToMongo = require("./db");
const cors = require("cors");

// Import configurations and services
const { configureServer } = require("./config/server");
const { initializeSocket } = require("./config/socket");
const cronService = require("./service/cron.service");

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure server middleware
configureServer(app);

// Routess
app.get("/", async (req, res) => {
  res.send("api is working");
});

// API Routess
app.use("/api/auth/", require("./routes/user"));
app.use("/api/pet/", require("./routes/pet"));
app.use("/api/medical/", require("./routes/medicalhistory"));
app.use("/api/language/", require("./routes/language"));
app.use("/api/order/", require("./routes/order"));
app.use("/api/lost/", require("./routes/lost"));
app.use("/api/business/", require("./routes/business"));
app.use("/api/ads", require("./routes/ads"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/qrcode", require("./routes/qrcode"));

// Hour-based reminders
app.use("/api/hourly-reminders", require("./routes/hourlyreminders"));

// New PetPro features
app.use("/api/products", require("./routes/product"));
app.use("/api/promotions", require("./routes/promotion"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/payments", require("./routes/payment"));

// Super Admin routes
app.use("/api/superadmin", require("./routes/superadmin"));

// Tags routes
app.use("/api/tags", require("./routes/tags"));

// Legacy routess (keeping for backward compatibility)
app.post("/api", require("./controller/ai").getVeterinaryAdvice);
app.post("/trainer", require("./controller/ai").getTrainingAdvice);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start Medical Checkup Cron Service
cronService.start();

// Global error handler — must be registered after all routes
app.use((err, req, res, next) => {
  if (err.status === 413 || err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "Request body too large. Images must not exceed 10MB. Please compress or resize your image and try again.",
    });
  }

  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
  });
});

// Start server
server.listen(process.env.PORT, () => {
  console.log("Server is running on port:", process.env.PORT);
  console.log("Medical Checkup Cron Service initialized");
  connectToMongo();
});
