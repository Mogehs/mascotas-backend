require("dotenv").config();
const express = require("express");
const http = require("http");
const connectToMongo = require("./db");
const cors = require("cors");

// Import configurations and services
const configureServer = require("./config/server");
const initializeSocket = require("./config/socket");
const { startCronJob } = require("./service/cron.service");

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

// New PetPro features
app.use("/api/products", require("./routes/product"));
app.use("/api/promotions", require("./routes/promotion"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/payments", require("./routes/payment"));

// Legacy routess (keeping for backward compatibility)
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
