require("dotenv").config();
const express = require("express");
const http = require("http");
const connectToMongo = require("./db");

// Import configurations and services
const configureServer = require("./config/server");
const initializeSocket = require("./config/socket");
const { startCronJob } = require("./service/cron.service");

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure server middleware
configureServer(app);

// Routes
app.get("/", async (req, res) => {
  res.send("api is working");
});

// Health check endpoint
app.get("/render-health", (req, res) => {
  res.send("Backend running well");
});

// API Routes
app.use("/api/auth/", require("./route/user"));
app.use("/api/pet/", require("./route/pet"));
app.use("/api/medical/", require("./route/medicalhistory"));
app.use("/api/language/", require("./route/language"));
app.use("/api/order/", require("./route/order"));
app.use("/api/lost/", require("./route/lost"));
app.use("/api/business/", require("./route/business"));
app.use("/api/ads", require("./route/ads"));
app.use("/api/ai", require("./route/ai"));
app.use("/api/chat", require("./route/chat"));

// Legacy routes (keeping for backward compatibility)
app.post("/api", require("./controller/ai").getVeterinaryAdvice);
app.post("/trainer", require("./controller/ai").getTrainingAdvice);
app.get(
  "/chatHistory/:senderId/:receiverId",
  require("./controller/chat").getChatHistory
);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start cron job for notifications
startCronJob();

// Start server
server.listen(process.env.PORT, () => {
  console.log("Server is running on port:", process.env.PORT);
  connectToMongo();
});
